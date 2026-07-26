import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "node:path";

export async function getDBConnection() {
  // Resolves the path to 'database.db' in your current working directory
  const dbPath = path.join(process.cwd(), "database.db");

  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
}
