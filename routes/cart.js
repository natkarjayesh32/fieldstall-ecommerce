// routes/cart.js
const express = require('express');
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function getCartWithDetails(userId) {
  const rows = db
    .prepare(
      `SELECT ci.id AS cart_item_id, ci.quantity, p.id AS product_id, p.name, p.price, p.image_url, p.stock
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?
       ORDER BY ci.id ASC`
    )
    .all(userId);

  const total = rows.reduce((sum, r) => sum + r.price * r.quantity, 0);
  return { items: rows, total: Math.round(total * 100) / 100 };
}

// GET /api/cart
router.get('/', (req, res) => {
  res.json(getCartWithDetails(req.session.userId));
});

// POST /api/cart  { productId, quantity }
router.post('/', (req, res) => {
  const { productId, quantity } = req.body;
  const qty = Math.max(1, parseInt(quantity, 10) || 1);

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  if (product.stock < qty) {
    return res.status(400).json({ error: `Only ${product.stock} left in stock.` });
  }

  const existing = db
    .prepare('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?')
    .get(req.session.userId, productId);

  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?').run(qty, existing.id);
  } else {
    db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)').run(
      req.session.userId,
      productId,
      qty
    );
  }

  res.status(201).json(getCartWithDetails(req.session.userId));
});

// PUT /api/cart/:cartItemId  { quantity }
router.put('/:cartItemId', (req, res) => {
  const { quantity } = req.body;
  const qty = parseInt(quantity, 10);

  const item = db
    .prepare('SELECT * FROM cart_items WHERE id = ? AND user_id = ?')
    .get(req.params.cartItemId, req.session.userId);
  if (!item) {
    return res.status(404).json({ error: 'Cart item not found.' });
  }

  if (qty <= 0) {
    db.prepare('DELETE FROM cart_items WHERE id = ?').run(item.id);
  } else {
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(qty, item.id);
  }

  res.json(getCartWithDetails(req.session.userId));
});

// DELETE /api/cart/:cartItemId
router.delete('/:cartItemId', (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(
    req.params.cartItemId,
    req.session.userId
  );
  res.json(getCartWithDetails(req.session.userId));
});

module.exports = router;
