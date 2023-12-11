document.getElementById("loginForm").addEventListener("submit", loginUser);
document
  .getElementById("createPostForm")
  .addEventListener("submit", createPost);
document
  .getElementById("registerForm")
  .addEventListener("submit", registerUser);

document.addEventListener("DOMContentLoaded", () => {
  getPosts();
});

document.addEventListener("DOMContentLoaded", updateLoginLogoutLink);

function showRegister() {
  document.querySelector("#registerUser").style.display = "block";
  document.querySelector("#loginUser").style.display = "none";
  document.querySelector("#newPost").style.display = "none";
}

function showLogin() {
  document.querySelector("#registerUser").style.display = "none";
  document.querySelector("#loginUser").style.display = "block";
  document.querySelector("#newPost").style.display = "none";
}

function showNewPost() {
  document.querySelector("#registerUser").style.display = "none";
  document.querySelector("#loginUser").style.display = "none";
  document.querySelector("#newPost").style.display = "block";
}

function registerUser() {
  const username = document.getElementById("registerUsername").value;
  const password = document.getElementById("registerPassword").value;
  const email = document.getElementById("registerEmail").value;

  fetch("http://localhost:3000/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
      email,
      dateCreated: new Date().toISOString(),
    }),
  })
    .then((response) => response.json())
    .then((data) => console.log(data)) // CHANGELOG: Oppdatert denne fra .then(data)
    .catch((error) => console.error("Error:", error));
}

function handleLoginLogout() {
  const token = getCookie("token");
  console.log(token);
  if (token) {
    logoutUser(); // Logg ut brukeren
  } else {
    showLogin(); // Vis innloggingsform
  }
}

function updateLoginLogoutLink() {
  const token = getCookie("token");
  const loginLogoutLink = document.getElementById("loginLogoutLink");
  if (token) {
    loginLogoutLink.textContent = "Logg ut";
    loginLogoutLink.onclick = logoutUser;
  } else {
    loginLogoutLink.textContent = "Logg inn";
    loginLogoutLink.onclick = showLogin;
  }
}

function loginUser(event) {
  event.preventDefault(); // Forhindre standard skjema-sending

  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Inkluderer cookies i forespørselen
    body: JSON.stringify({ username, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.message === "Innlogging vellykket!") {
        alert("Du er nå logget inn!");
        document.querySelector("#loginUser").style.display = "none";
        location.reload();
        // Du kan sjekke cookien i nettleserens utviklerverktøy under Application -> Cookies
      } else {
        alert("Innlogging feilet: " + data.message);
      }
    })
    .catch((error) => console.error("Error:", error));
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function createPost(event) {
  // CHANGELOG: Oppdatert denne funksjonen til å bruke event og rettet på credentials og reload av location
  event.preventDefault();
  const title = document.getElementById("postTitle").value;
  const content = document.getElementById("postContent").value;
  const datePosted = new Date().toISOString();
  const token = getCookie("token"); // Hent token fra cookie
  console.log(token);

  fetch("http://localhost:3000/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: "Bearer " + token, // Inkluderer cookies i forespørselen
    },
    credentials: "include", // Inkluderer cookies i forespørselen
    body: JSON.stringify({ title, content, datePosted }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Post opprettet: " + data.message);
      location.reload();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function logoutUser() {
  if (!confirm("Er du sikker på at du vil logge ut?")) {
    return;
  }
  deleteCookie("token");
  alert("Du har blitt logget ut.");
  location.reload();
}

function formatToNorwegianDateTime(isoString) {
  const date = new Date(isoString);
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  return new Intl.DateTimeFormat("no-NO", options).format(date);
}

function getPosts() {
  fetch("http://localhost:3000/posts/")
    .then((response) => response.json())
    .then((data) => {
      document.querySelector("#showPosts").innerHTML = "";

      data.forEach((element) => {
        // Formater datoen før den vises
        const formattedDate = formatToNorwegianDateTime(element.datePosted);

        document.querySelector("#showPosts").innerHTML += `
                    <div class="box">
                        <h3>${element.title}</h3>
                        <p>${element.content}</p>
                        <p>Laget av ${
                          element.username.charAt(0).toUpperCase() +
                          element.username.slice(1)
                        }</p>
                        <p>${formattedDate}</p>
                        <button onclick='showEditForm(${
                          element.id
                        })'>Edit</button>
                        <button onclick='deletePost(${
                          element.id
                        })'>Delete</button>
                    </div>
                `;
      });
    })
    .catch((error) => console.error("Error:", error));
}

function updatePost(postId) {
  const title = document.getElementById("editPostTitle").value;
  const content = document.getElementById("editPostContent").value;
  const datePosted = new Date().toISOString();
  const token = getCookie("token");

  fetch(`http://localhost:3000/posts/${postId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ title, content, datePosted }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Post oppdatert: " + data.message);
      document.getElementById("editPostForm").style.display = "none"; // Skjul formen etter oppdatering
      getPosts();
    })
    .catch((error) => console.error("Error:", error));
}

function showEditForm(postId) {
  getPostData(postId);
}

function getPostData(postId) {
  fetch("http://localhost:3000/posts/" + postId)
    .then((response) => response.json())
    .then((postData) => {
      // Fyll ut formen med postens data
      document.getElementById("editPostTitle").value = postData.title;
      document.getElementById("editPostContent").value = postData.content;

      // Vis formen
      document.getElementById("editPostForm").style.display = "block";

      // Oppdater knappen til å inkludere postId
      document.querySelector("#editPostForm button").onclick = function () {
        updatePost(postId);
      };
    })
    .catch((error) => console.error("Error:", error));
}

function deletePost(postId) {
  const token = getCookie("token"); // Hent token fra cookie

  if (!confirm("Er du sikker på at du vil slette denne posten?")) {
    return; // Avbryt sletting hvis brukeren ikke bekrefter
  }

  fetch("http://localhost:3000/posts/" + postId, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      confirm("Post slettet: " + data.message);
      // Her kan du legge til kode for å oppdatere UI etter sletting
      getPosts();
    })
    .catch((error) => console.error("Error:", error));
}
