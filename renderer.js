const { ipcRenderer } = require("electron");

document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Send form data to main process
  ipcRenderer.send("login-form-submit", { email, password });
});

document.getElementById("requestForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const reason = document.getElementById("reason").value;

  // Send form data to main process
  ipcRenderer.send("out-going-request", {reason });
});

