// ===== Configuration Configuration =====
// Routes new user registrations straight to your active live Render database server
const BACKEND_URL = "https://no-skip-records.onrender.com";

const signupForm = document.getElementById("signup-form");
const errorMessage = document.getElementById("error-message");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent form from reloading

  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const submitBtn = signupForm.querySelector("button");

  errorMessage.textContent = ""; // Clear old errors
  submitBtn.disabled = true;

  try {
    // 🔄 FIXED: Pointed to absolute Render address and added cross-domain cookie capabilities
    const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // 🔥 CRUCIAL: Keeps new user profiles logged in automatically across domains
      body: JSON.stringify({ name, email, username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      window.location.href = "/";
    } else {
      errorMessage.textContent =
        data.error || "Registration failed. Please try again.";
    }
  } catch (err) {
    console.error("Network error:", err);
    errorMessage.textContent = "Unable to connect. Please try again.";
  } finally {
    submitBtn.disabled = false;
  }
});
