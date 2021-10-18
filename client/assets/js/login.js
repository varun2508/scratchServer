console.log("------login nah----");

const login = async (url = "", data = {}) => {
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *client
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return await response.json(); // parses JSON response into native JavaScript objects
};
//https://scratchandwin.herokuapp.com/
const callLogin = () => {
  const loginValue = document.getElementById("email").value;
  const passwordValue = document.getElementById("password").value;
  document
    .getElementById("submitButton")
    .setAttribute("style", "display: none;");
  document.getElementById("loader").style.display = "flex";
  console.log("-----loginValue-----", loginValue, passwordValue);
  login("https://scratchandwin.herokuapp.com/api/Clients/login", {
    email: loginValue,
    password: passwordValue,
  })
    .then((data) => {
      if (!data.token) {
        throw new Error("Authentification failed");
      }
      if (data.role !== "admin") {
        throw new Error("You are not an admin!!!");
      }
      console.log("----------token", data.token);
      localStorage.setItem("token", data.token);
      window.location.replace(
        "https://scratchandwin.herokuapp.com/dashboard.html"
      );
      document
        .getElementById("submitButton")
        .setAttribute("style", "display: block;");
      document.getElementById("loader").setAttribute("style", "display: none;");
      console.log("resp on call", data); // JSON data parsed by `response.json()` call
    })
    .catch((err) => {
      console.log("----------err", err);
      if (err.message) {
        alert(err.message);
      } else {
        alert("Error during login! Please contact us!");
      }
      document
        .getElementById("submitButton")
        .setAttribute("style", "display: block;");
      document.getElementById("loader").setAttribute("style", "display: none;");
    });
};
// callLogin();
