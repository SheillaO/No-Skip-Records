import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "node:path";
import bcrypt from "bcryptjs";
import { vinyl } from "./data.js";

export async function seedProducts() {
  const db = await open({
    filename: path.join("database.db"),
    driver: sqlite3.Database,
  });

  // Only seeds if products table is empty — avoids duplicate rows
  // if this ever runs more than once against the same database.db
  const existing = await db.get("SELECT COUNT(*) AS count FROM products");
  if (existing.count > 0) {
    console.log("Products already seeded — skipping.");
    await db.close();
    return;
  }

  try {
    await db.exec("BEGIN TRANSACTION");

    for (const { title, artist, price, image, year, genre, stock } of vinyl) {
      await db.run(
        `
        INSERT INTO products (title, artist, price, image, year, genre, stock)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, artist, price, image, year, genre, stock],
      );
    }

    await db.exec("COMMIT");
    console.log("All records inserted successfully.");
  } catch (err) {
    await db.exec("ROLLBACK");
    console.error("Error inserting data:", err.message);
  } finally {
    await db.close();
    console.log("Database connection closed.");
  }
}

// Ensures a working login always exists right after a database wipe —
// so you (or anyone testing the site) never hit "Invalid credentials"
// on a fresh restart without first registering a brand new account.
export async function seedDemoUser() {
  const db = await open({
    filename: path.join("database.db"),
    driver: sqlite3.Database,
  });

  const existing = await db.get("SELECT id FROM users WHERE username = ?", [
    "demo",
  ]);

  if (existing) {
    console.log("Demo user already exists — skipping.");
    await db.close();
    return;
  }

  const hashed = await bcrypt.hash("demopass123", 10);

  await db.run(
    "INSERT INTO users (name, email, username, password) VALUES (?, ?, ?, ?)",
    ["Demo User", "demo@noskiprecords.test", "demo", hashed],
  );

  console.log("Demo user seeded — username: demo / password: demopass123");
  await db.close();
}

// Still runs standalone with "node seedTable.js" exactly like before
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProducts();
  seedDemoUser();
}
