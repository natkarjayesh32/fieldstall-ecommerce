// routes/orders.js
const express = require('express');
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// POST /api/orders  { shippingName, shippingAddress, shippingCity, shippingZip }
// Creates an order from the user's current cart, decrements stock, clears cart.
router.post('/', (req, res) => {
  const userId = req.session.userId;
  const { shippingName, shippingAddress, shippingCity, shippingZip } = req.body;

  if (!shippingName || !shippingAddress || !shippingCity || !shippingZip) {
    return res.status(400).json({ error: 'Full shipping details are required.' });
  }

  const cartItems = db
    .prepare(
      `SELECT ci.quantity, p.id AS product_id, p.name, p.price, p.stock
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?`
    )
    .all(userId);

  if (cartItems.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty.' });
  }

  for (const item of cartItems) {
    if (item.stock < item.quantity) {
      return res.status(400).json({ error: `Not enough stock for "${item.name}".` });
    }
  }

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Run as a manual transaction (node:sqlite doesn't expose better-sqlite3's .transaction()).
  db.exec('BEGIN');
  try {
    const orderResult = db
      .prepare(
        `INSERT INTO orders (user_id, total, status, shipping_name, shipping_address, shipping_city, shipping_zip)
         VALUES (?, ?, 'processing', ?, ?, ?, ?)`
      )
      .run(userId, Math.round(total * 100) / 100, shippingName, shippingAddress, shippingCity, shippingZip);

    const orderId = Number(orderResult.lastInsertRowid);

    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
       VALUES (?, ?, ?, ?, ?)`
    );
    const decrementStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

    for (const item of cartItems) {
      insertItem.run(orderId, item.product_id, item.name, item.price, item.quantity);
      decrementStock.run(item.quantity, item.product_id);
    }

    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);

    db.exec('COMMIT');

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
    res.status(201).json({ ...order, items });
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('Order creation failed:', err);
    res.status(500).json({ error: 'Something went wrong placing your order.' });
  }
});

// GET /api/orders  - order history for the logged-in user
router.get('/', (req, res) => {
  const orders = db
    .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.session.userId);

  const withItems = orders.map((o) => ({
    ...o,
    items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id)
  }));

  res.json(withItems);
});

// GET /api/orders/:id
router.get('/:id', (req, res) => {
  const order = db
    .prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.session.userId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ ...order, items });
});

module.exports = router;
