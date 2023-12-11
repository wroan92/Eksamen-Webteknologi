// importer requirements
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
      res.status(500).json({ error: "Failed to create users table" });
      throw error;
    }
    console.log("Created users table");
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
          return res.status(500).json({ message: "Server error", error: err.message });
      }

      if (!user) {
          return res.status(401).json({ message: "Invalid username or password" });
      }

      try {
          const passwordMatch = await bcrypt.compare(password, user.password);
          if (passwordMatch) {
              const token = jwt.sign({ username: username }, secretKey, { expiresIn: "1h" });

              res.cookie('token', token, {
                  httpOnly: false, 
                  secure: true,
                  maxAge: 3600000, 
                  sameSite: "None"
              });

              res.json({ message: "Innlogging vellykket!" });
          } else {
              res.status(401).json({ message: "Invalid username or password" });
          }
      } catch (error) {
          res.status(500).json({ message: "Authentication error", error: error.message });
      }
  });
});

// Logout for bruker
app.post("/logout", (req, res) => {});

// Hent alle poster inkludert username fra users
app.get("/posts", (req, res) => {});

// Hent en post på ID
app.get("/posts/:id", (req, res) => {});

// Opprett en post
app.post("/posts", (req, res) => {});

// Oppdater post
app.put("/posts/:id", (req, res) => {});

// Slett en post
app.delete("/posts/:id", (req, res) => {});

// Start serveren
app.listen(port, () => {
  console.log(`Server is running at:  http://localhost:${port}`);
});
