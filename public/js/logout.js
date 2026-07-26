const BACKEND_URL = "https://no-skip-records.onrender.com";

export async function logout() {
  try {
    // 🔄 FIXED: Added the BACKEND_URL, specified POST method, and included session credentials
    const res = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    window.location.href = "/";
  } catch (err) {
    // 🔄 FIXED: Declared (err) parameter explicitly here
    console.log("failed to log out", err);
  }
}
