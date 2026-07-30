const BACKEND_URL = "https://no-skip-records.onrender.com";

const signinForm = document.getElementById("signin-form");
const errorMessage = document.getElementById("error-message");

signinForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent form from reloading the page

  const username = document.getElementById("signin-username").value.trim();
  const password = document.getElementById("signin-password").value.trim();
  const submitBtn = signinForm.querySelector("button");

  errorMessage.textContent = ""; // Clear old error messages
  submitBtn.disabled = true;

  try {
    // 🔄 FIXED: Point the fetch URL to your live, absolute Render backend address
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Kept intact: Essential for sending your login cookie to Render
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      window.location.href = "/";
    } else {
      errorMessage.textContent =
        data.error || "Login failed. Please try again.";
    }
  } catch (err) {
    console.error("Network error:", err);
    errorMessage.textContent = "Unable to connect. Please try again.";
  } finally {
    submitBtn.disabled = false;
  }
});
