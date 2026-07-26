// server.js
const express = require('express');
const session = require('express-session');
const path = require('path');

const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  })
);

// API routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);

// Static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Fallback 404 for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
