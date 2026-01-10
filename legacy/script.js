const API_URL = "https://api.stl-ai.in/api/generate";

async function generatePassword() {
  const master = document.getElementById("master").value;
  const context = document.getElementById("context").value;
  const length = document.getElementById("length").value;
  const error = document.getElementById("error");

  error.textContent = "";

  if (!master || !context) {
    error.textContent = "Master key and context are required";
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        master,
        context,
        length: parseInt(length),
        charset: "all"
      })
    });

    const data = await res.json();

    document.getElementById("password").value = data.password;
    document.getElementById("result").classList.remove("hidden");

  } catch (e) {
    error.textContent = "Failed to generate password";
  }
}

function copyPassword() {
  const input = document.getElementById("password");
  input.select();
  document.execCommand("copy");
  alert("Copied!");
}