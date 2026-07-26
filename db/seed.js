// db/seed.js
// Run with: npm run seed
// Populates the products table with sample data (safe to re-run).
const db = require('./database');

const products = [
  {
    name: 'Wireless Headphones',
    description: 'Over-ear wireless headphones with active noise cancellation, 30-hour battery life, and plush memory-foam ear cushions.',
    price: 79.99,
    image_url: 'https://picsum.photos/seed/headphones/500/500',
    category: 'Electronics',
    stock: 25
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Track your steps, heart rate, sleep, and workouts. Water-resistant with a 7-day battery life and color touchscreen.',
    price: 129.99,
    image_url: 'https://picsum.photos/seed/watch/500/500',
    category: 'Electronics',
    stock: 15
  },
  {
    name: 'Mechanical Keyboard',
    description: 'RGB backlit mechanical keyboard with hot-swappable switches and a durable aluminum frame.',
    price: 89.5,
    image_url: 'https://picsum.photos/seed/keyboard/500/500',
    category: 'Electronics',
    stock: 40
  },
  {
    name: 'Classic Leather Backpack',
    description: 'Handcrafted genuine leather backpack with laptop compartment, perfect for work, travel, or school.',
    price: 64.0,
    image_url: 'https://picsum.photos/seed/backpack/500/500',
    category: 'Fashion',
    stock: 30
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Double-walled, vacuum-insulated bottle that keeps drinks cold for 24 hours or hot for 12. 750ml capacity.',
    price: 19.99,
    image_url: 'https://picsum.photos/seed/bottle/500/500',
    category: 'Home & Living',
    stock: 100
  },
  {
    name: 'Ceramic Coffee Mug Set',
    description: 'Set of 4 hand-glazed ceramic mugs, microwave and dishwasher safe. 12oz each.',
    price: 24.99,
    image_url: 'https://picsum.photos/seed/mugs/500/500',
    category: 'Home & Living',
    stock: 60
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight breathable running shoes with responsive cushioning for everyday training.',
    price: 74.95,
    image_url: 'https://picsum.photos/seed/shoes/500/500',
    category: 'Fashion',
    stock: 50
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Compact speaker with 360-degree sound, IPX7 waterproofing, and 12-hour battery life.',
    price: 45.0,
    image_url: 'https://picsum.photos/seed/speaker/500/500',
    category: 'Electronics',
    stock: 35
  },
  {
    name: 'Yoga Mat',
    description: 'Extra-thick non-slip yoga mat with carrying strap, ideal for yoga, pilates, and floor workouts.',
    price: 29.99,
    image_url: 'https://picsum.photos/seed/yogamat/500/500',
    category: 'Sports',
    stock: 45
  },
  {
    name: 'Desk Lamp with Wireless Charger',
    description: 'Adjustable LED desk lamp with built-in Qi wireless charging pad and USB port.',
    price: 39.99,
    image_url: 'https://picsum.photos/seed/lamp/500/500',
    category: 'Home & Living',
    stock: 20
  },
  {
    name: 'Sunglasses',
    description: 'Polarized UV400 sunglasses with a lightweight titanium frame.',
    price: 34.5,
    image_url: 'https://picsum.photos/seed/sunglasses/500/500',
    category: 'Fashion',
    stock: 55
  },
  {
    name: 'Cast Iron Skillet',
    description: 'Pre-seasoned 12-inch cast iron skillet, oven-safe and perfect for searing, baking, and frying.',
    price: 32.0,
    image_url: 'https://picsum.photos/seed/skillet/500/500',
    category: 'Home & Living',
    stock: 28
  }
];

const countRow = db.prepare('SELECT COUNT(*) AS c FROM products').get();

if (countRow.c > 0) {
  console.log(`Products table already has ${countRow.c} rows — skipping seed. (Delete db/ecommerce.db to reset.)`);
} else {
  const insert = db.prepare(`
    INSERT INTO products (name, description, price, image_url, category, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const p of products) {
    insert.run(p.name, p.description, p.price, p.image_url, p.category, p.stock);
  }
  console.log(`Seeded ${products.length} products.`);
}
