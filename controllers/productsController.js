import { getDBConnection } from "../db/db.js";

export async function getGenres(req, res) {
  try {
    const db = await getDBConnection();

    const genreRows = await db.all("SELECT DISTINCT genre FROM products");
    const genres = genreRows.map((row) => row.genre);

    return res.json(genres);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to fetch genres", details: err.message });
  }
}

export async function getProducts(req, res) {
  try {
    const db = await getDBConnection();

    let query = "SELECT * FROM products";
    const conditions = [];
    const params = [];

    const { genre, search } = req.query;

    // 1. Handle Genre filter
    if (genre) {
      conditions.push("genre = ?");
      params.push(genre);
    }

    // 2. Handle Search filter
    if (search) {
      conditions.push("(title LIKE ? OR artist LIKE ? OR genre LIKE ?)");
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // 3. Dynamically build the WHERE clause if filters exist
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const products = await db.all(query, params);
    return res.json(products);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to fetch products", details: err.message });
  }
}
