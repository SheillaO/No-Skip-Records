import { getDBConnection } from "../db/db.js";

export async function getCurrentUser(req, res) {
  try {
    const db = await getDBConnection();

    if (!req.session.userId) {
      return res.json({ isLoggedIn: false });
    }

    const user = await db.get("SELECT name, email FROM users WHERE id = ?", [
      req.session.userId,
    ]);

    if (!user) {
      return res.json({ isLoggedIn: false });
    }

    return res.json({
      isLoggedIn: true,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("getCurrentUser error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}
