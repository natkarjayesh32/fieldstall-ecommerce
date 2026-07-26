# Fieldstall — Basic E-Commerce Site

A full working e-commerce demo: product listings, product detail pages, shopping cart,
order processing/checkout, and user registration/login — backed by a real SQL database.

## Stack

- **Backend:** Node.js + Express.js
- **Database:** SQLite, via Node's built-in `node:sqlite` module (Node 22.5+) — no native
  compilation or external DB server required. Data is stored in `db/ecommerce.db`.
- **Auth:** Session-based (cookie), passwords hashed with `bcryptjs`.
- **Frontend:** Plain HTML, CSS, and vanilla JavaScript (no framework, no build step).

## Requirements

- Node.js **22.5.0 or newer** (for built-in SQLite support). Check with `node -v`.

## Setup

```bash
npm install
npm run seed     # populates the products table with 12 sample products (safe to re-run)
npm start         # starts the server at http://localhost:3000
```

Then open **http://localhost:3000** in your browser.

To reset all data (products, users, carts, orders), stop the server and delete
`db/ecommerce.db`, then run `npm run seed` again.

## Project structure

```
ecommerce-site/
├── server.js              # Express app entry point
├── db/
│   ├── database.js        # SQLite connection + schema (users, products, cart_items, orders, order_items)
│   └── seed.js             # Sample product data
├── middleware/
│   └── auth.js             # requireAuth guard for protected API routes
├── routes/
│   ├── auth.js              # POST /register, /login, /logout · GET /me
│   ├── products.js          # GET /products, /products/:id, /products/categories
│   ├── cart.js               # GET/POST /cart · PUT/DELETE /cart/:id  (auth required)
│   └── orders.js             # POST /orders (checkout) · GET /orders, /orders/:id  (auth required)
└── public/                 # Static frontend
    ├── index.html            # Product listing (search + category filter)
    ├── product.html           # Product detail page
    ├── cart.html               # Shopping cart
    ├── checkout.html           # Shipping form + order placement
    ├── order-confirmation.html # Receipt-style confirmation after checkout
    ├── orders.html              # Order history
    ├── login.html / register.html
    ├── css/style.css
    └── js/  (main.js, products.js, product-detail.js, cart.js, checkout.js, auth.js, orders.js, order-confirmation.js)
```

## Features

- **Product listings** with search and category filtering
- **Product detail page** with quantity selector and stock display
- **Shopping cart** — add, change quantity, remove, persisted per logged-in user in the DB
- **Order processing** — checkout deducts stock, records line items, and clears the cart
  in a single transaction; order history and a receipt-style confirmation page
- **User registration/login** — hashed passwords, session cookies, route protection on
  cart/order APIs
- **Database** — normalized SQLite schema: `users`, `products`, `cart_items`, `orders`, `order_items`

## API overview

| Method | Route                  | Auth | Description                    |
|--------|------------------------|------|---------------------------------|
| POST   | /api/auth/register     | —    | Create account, starts session |
| POST   | /api/auth/login        | —    | Log in, starts session         |
| POST   | /api/auth/logout       | —    | End session                    |
| GET    | /api/auth/me           | —    | Current logged-in user (or null)|
| GET    | /api/products          | —    | List products (`?category=`, `?search=`) |
| GET    | /api/products/:id      | —    | Product detail                 |
| GET    | /api/products/categories| —   | List distinct categories       |
| GET    | /api/cart              | ✅   | View current cart              |
| POST   | /api/cart               | ✅   | Add item to cart               |
| PUT    | /api/cart/:cartItemId   | ✅   | Update quantity                |
| DELETE | /api/cart/:cartItemId   | ✅   | Remove item                    |
| POST   | /api/orders             | ✅   | Checkout (creates order from cart) |
| GET    | /api/orders             | ✅   | Order history                  |
| GET    | /api/orders/:id         | ✅   | Order detail                   |

## Notes on going to production

This is a learning/demo project. Before deploying for real use you'd want to:
- Set a strong, secret `SESSION_SECRET` environment variable
- Serve over HTTPS and set `cookie.secure = true` in `server.js`
- Add rate limiting on `/api/auth/*`
- Add pagination to `/api/products` for larger catalogs
- Swap SQLite for Postgres/MySQL if you need concurrent multi-process scaling
- Add a real payment provider (Stripe, etc.) to the checkout flow — this demo just records the order
