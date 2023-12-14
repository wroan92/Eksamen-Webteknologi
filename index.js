// importer requirements
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { title } = require("process");

const app = express();
const port = 3000; // MÅ IKKE ENDRES
const secretKey = "gokstadakademiet"; // MÅ IKKE ENDRES

const corsOptions = {
  origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
  credentials: true,
}; // MÅ IKKE ENDRES! Tillater sending av cookies/autentiseringsopplysninger

app.use(cors(corsOptions)); // MÅ IKKE ENDRES
app.use(express.json()); // MÅ IKKE ENDRES
app.use(express.urlencoded({ extended: true })); // MÅ IKKE ENDRES

// Middleware for å sjekke om bruker er logget inn
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Opprett databasefilen
let db = new sqlite3.Database("./database.db", (error) => {
  if (error) {
    console.error(error.message);
    throw error;
  }
  console.log("Connected to the database.");

  // Opprett tabellen users
  const tableUsers = `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      email TEXT NOT NULL,
      dateCreated TEXT NOT NULL
  )`;
  db.run(tableUsers, (error) => {
    if (error) {
      console.error(error.message);
      throw error;
    }
    console.log("Created users table");
  });

  // Opprett tabellen posts
  const tablePosts = `CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      datePosted TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (id)
  )`;
  db.run(tablePosts, (error) => {
    if (error) {
      console.error(error.message);
      throw error;
    }
    console.log("Created posts table");
  });
});

// Lag en bruker
app.post("/register", async (req, res) => {
  const { username, password, email, dateCreated } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ error: "Vennligst fyll ut alle feltene" });
  }

  // Sjekk om eposten allerede er registrert i databasen
  const emailCheckQuery = "SELECT * FROM users WHERE email = ?";
  db.get(emailCheckQuery, [email], async (error, row) => {
    if (error) {
      console.error(error.message);
      return res.status(500).json({ error: "Feil under sjekking av e-post" });
    }

    if (row) {
      return res
        .status(409)
        .json({ error: "E-postadressen er allerede registrert" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertQuery = `INSERT INTO users (username, password, email, dateCreated) VALUES (?, ?, ?, ?)`;
      db.run(
        insertQuery,
        [username, hashedPassword, email, dateCreated],
        (insertError) => {
          if (insertError) {
            console.error(insertError.message);
            return res.status(500).json({ error: "Kunne ikke lage bruker" });
          }
          return res.status(201).json({ message: "Bruker laget" });
        }
      );
    } catch (hashError) {
      console.error(hashError.message);
      res.status(500).json({ error: "Kunne ikke lage bruker" });
    }
  });
});

// Login for bruker
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const userQuery = "SELECT * FROM users WHERE username = ?";

  db.get(userQuery, [username], async (err, user) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Server error", error: err.message });
    }

    if (!user) {
      return res
        .status(401)
        .json({ message: "Feil brukernavn eller passord." });
    }

    try {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        const token = jwt.sign({ username: username }, secretKey, {
          expiresIn: "1h",
        });

        res.cookie("token", token, {
          httpOnly: false,
          secure: true,
          maxAge: 3600000,
          sameSite: "None",
        });

        res.json({ message: "Innlogging vellykket!" });
      } else {
        res.status(401).json({ error: err.message });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Authentication error", error: error.message });
    }
  });
});

// Logout for bruker
app.post("/logout", (req, res) => {
  app.post("/logout", (req, res) => {
    res.cookie("token", "", { expires: new Date(0) });
    res.json({ message: "Du er nå logget ut" });
  });
});

// Hent alle poster inkludert username fra users
app.get("/posts", (req, res) => {
  const postsQuery = `SELECT posts.id, posts.title, posts.content, posts.datePosted, users.username FROM posts INNER JOIN users ON posts.userId = users.id`;
  db.all(postsQuery, (error, rows) => {
    if (error) {
      console.error(error.message);
      return res.status(500).json({ error: "Kunne ikke hente poster" });
    }
    return res.status(200).json(rows);
  });
});

// Hent en post på ID
app.get("/posts/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM posts WHERE id = ?";
  db.get(query, [id], (err, post) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ message: `Ingen post med id: ${id}` });
    }
  });
});

// Opprett en post
app.post("/posts", authenticateToken, (req, res) => {
  const { title, content, datePosted } = req.body;
  if (!title || !content || !datePosted) {
    return res.status(400).json({ error: "Alle feltene må fylles ut" });
  }

  const userIdQuery = "SELECT id FROM users WHERE username = ?";
  db.get(userIdQuery, [req.user.username], (err, user) => {
    if (err || !user) {
      return res.status(500).json({ message: "Kunne ikke finne brukeren" });
    }
    const insertQuery =
      "INSERT INTO posts (userId, title, content, datePosted) VALUES (?, ?, ?, ?)";
    db.run(
      insertQuery,
      [user.id, title, content, datePosted],
      (insertError) => {
        if (insertError) {
          console.error(insertError.message);
          return res.status(500).json({ error: "Kunne ikke lage ny post." });
        }
        res.status(201).json({ message: "En ny post ble laget" });
      }
    );
  });
});

// Oppdater post
app.put("/posts/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, content, datePosted } = req.body;

  const updateQuery =
    "UPDATE posts SET title = ?, content = ?, datePosted = ? WHERE id = ?";
  db.run(updateQuery, [title, content, datePosted, id], (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: `Posten: ${title}  ble oppdattert` });
  });
});

// Slett en post
app.delete("/posts/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const deleteQuery = "DELETE FROM posts WHERE id = ?";
  db.run(deleteQuery, [id], (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: `Posten med id: ${id} ble slettet` });
  });
});

// Start serveren
app.listen(port, () => {
  console.log(`Server is running at:  http://localhost:${port}`);
});
