// public/js/products.js
// Powers the homepage: fetch products, render grid, category filter, search, add-to-cart.

let allProducts = [];
let currentCategory = '';
let searchTimer = null;

function productCardHtml(p) {
  const lowStock = p.stock > 0 && p.stock <= 5;
  const outOfStock = p.stock === 0;
  return `
    <div class="card">
      <a href="/product.html?id=${p.id}">
        <div class="card-media">
          ${outOfStock ? '<span class="stock-flag">Sold out</span>' : lowStock ? `<span class="stock-flag">Only ${p.stock} left</span>` : ''}
          <img src="${p.image_url}" alt="${p.name}" loading="lazy">
        </div>
      </a>
      <div class="card-body">
        <div class="card-cat">${p.category}</div>
        <a href="/product.html?id=${p.id}"><div class="card-name">${p.name}</div></a>
        <div class="card-price">
          <span class="price">${formatMoney(p.price)}</span>
          <button class="btn btn-marigold" data-add="${p.id}" ${outOfStock ? 'disabled' : ''}>
            ${outOfStock ? 'Sold out' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderGrid(products) {
  const grid = document.querySelector('#product-grid');
  if (products.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;">
      <h3>No products match</h3>
      <p>Try a different search term or category.</p>
    </div>`;
    return;
  }
  grid.innerHTML = products.map(productCardHtml).join('');

  grid.querySelectorAll('[data-add]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const productId = btn.dataset.add;
      try {
        await api('/cart', { method: 'POST', body: JSON.stringify({ productId, quantity: 1 }) });
        showToast('Added to cart');
        refreshCartBadge();
      } catch (err) {
        if (err.message.includes('logged in')) {
          showToast('Log in to add items to your cart');
          setTimeout(() => (window.location.href = '/login.html'), 900);
        } else {
          showToast(err.message);
        }
      }
    });
  });
}

function renderCategoryChips(categories) {
  const row = document.querySelector('#filter-row');
  row.innerHTML =
    `<button class="chip active" data-category="">All</button>` +
    categories.map((c) => `<button class="chip" data-category="${c}">${c}</button>`).join('');

  row.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      row.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategory = chip.dataset.category;
      loadProducts();
    });
  });
}

async function loadProducts() {
  const search = document.querySelector('#search-input').value.trim();
  const params = new URLSearchParams();
  if (currentCategory) params.set('category', currentCategory);
  if (search) params.set('search', search);

  try {
    const products = await api(`/products?${params.toString()}`);
    renderGrid(products);
    document.querySelector('#hero-count').textContent = products.reduce((s, p) => s + (p.stock > 0 ? 1 : 0), 0);
  } catch (err) {
    document.querySelector('#product-grid').innerHTML = `<p class="center-note">Couldn't load products: ${err.message}</p>`;
  }
}

async function init() {
  try {
    const categories = await api('/products/categories');
    renderCategoryChips(categories);
  } catch {
    /* non-fatal */
  }
  loadProducts();

  document.querySelector('#search-input').addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadProducts, 300);
  });
}

document.addEventListener('DOMContentLoaded', init);
