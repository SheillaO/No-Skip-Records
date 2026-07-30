import { getDBConnection } from "./db/db.js";


const tableName = "products";

// 2. Set to true if you want the custom filtered column view for the products table
const useNeaterProductDisplay = true;
// ---------------------

async function debugDatabaseTable() {
  const db = await getDBConnection();

  try {
    // Dynamically fetches data from the chosen table
    const rows = await db.all(`SELECT * FROM ${tableName}`);

    // If viewing products with the neater view enabled, slice out only specific columns
    if (tableName === "products" && useNeaterProductDisplay) {
      const displayItems = rows.map(({ id, title, artist, year, stock }) => {
        return { id, title, artist, year, stock };
      });
      console.table(displayItems);
    } else {
      // Default: Logs every single column from the table
      console.table(rows);
    }
  } catch (err) {
    console.error(`Error fetching table "${tableName}":`, err.message);
  } finally {
    await db.close();
  }
}

debugDatabaseTable();
