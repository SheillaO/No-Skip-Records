import { getDBConnection } from "../db/db.js";

export async function addToCart(req, res) {
  try {
    const db = await getDBConnection();
    const productId = parseInt(req.body.productId, 10);

    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const userId = req.session.userId;
    const existing = await db.get(
      "SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?",
      [userId, productId],
    );

    if (existing) {
      await db.run(
        "UPDATE cart_items SET quantity = quantity + 1 WHERE id = ?",
        [existing.id],
      );
    } else {
      await db.run(
        "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, 1)",
        [userId, productId],
      );
    }

    return res.json({ message: "Added to cart" });
  } catch (err) {
    console.error("Error adding to cart:", err.message);
    return res.status(500).json({ error: "Database operation failed" });
  }
}

export async function getCartCount(req, res) {
  try {
    const db = await getDBConnection();
    const result = await db.get(
      "SELECT SUM(quantity) AS totalItems FROM cart_items WHERE user_id = ?",
      [req.session.userId],
    );

    return res.json({ totalItems: result.totalItems || 0 });
  } catch (err) {
    console.error("Error getting cart count:", err.message);
    return res.status(500).json({ error: "Database operation failed" });
  }
}

export async function getAll(req, res) {
  try {
    const db = await getDBConnection();
    const items = await db.all(
      `
      SELECT ci.id AS cartItemId, ci.quantity, p.title, p.artist, p.price 
      FROM cart_items ci 
      JOIN products p ON p.id = ci.product_id 
      WHERE ci.user_id = ?
    `,
      [req.session.userId],
    );

    return res.json({ items: items });
  } catch (err) {
    console.error("Error getting cart items:", err.message);
    return res.status(500).json({ error: "Database operation failed" });
  }
}

export async function deleteItem(req, res) {
  try {
    const db = await getDBConnection();
    const itemId = parseInt(req.params.itemId, 10);

    if (isNaN(itemId)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const item = await db.get(
      "SELECT quantity FROM cart_items WHERE id = ? AND user_id = ?",
      [itemId, req.session.userId],
    );

    if (!item) {
      return res.status(404).json({ error: "Item not found" }); 
    }

    await db.run("DELETE FROM cart_items WHERE id = ? AND user_id = ?", [
      itemId,
      req.session.userId,
    ]);
    return res.status(204).send();
  } catch (err) {
    console.error("Error deleting cart item:", err.message);
    return res.status(500).json({ error: "Database operation failed" });
  }
}

export async function deleteAll(req, res) {
  try {
    const db = await getDBConnection();
    await db.run("DELETE FROM cart_items WHERE user_id = ?", [
      req.session.userId,
    ]);

    return res.status(204).send();
  } catch (err) {
    console.error("Error clearing cart:", err.message);
    return res.status(500).json({ error: "Database operation failed" });
  }
}
