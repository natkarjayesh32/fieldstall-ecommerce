// public/js/product-detail.js

function getProductId() {
  return new URLSearchParams(window.location.search).get('id');
}

function renderProduct(p) {
  document.querySelector('#crumb-name').textContent = p.name;
  document.title = `${p.name} — Fieldstall`;

  const outOfStock = p.stock === 0;
  const lowStock = p.stock > 0 && p.stock <= 5;

  document.querySelector('#pdp-root').innerHTML = `
    <div class="pdp-media"><img src="${p.image_url}" alt="${p.name}"></div>
    <div>
      <div class="card-cat">${p.category}</div>
      <h1>${p.name}</h1>
      <div class="price">${formatMoney(p.price)}</div>
      <p class="desc">${p.description}</p>
      <div class="qty-row">
        <div class="qty-control">
          <button id="qty-dec" type="button">−</button>
          <input id="qty-input" type="number" min="1" max="${Math.max(p.stock, 1)}" value="1">
          <button id="qty-inc" type="button">+</button>
        </div>
        <span class="stock-note ${lowStock ? 'low' : ''}">
          ${outOfStock ? 'Out of stock' : lowStock ? `Only ${p.stock} left in stock` : `${p.stock} in stock`}
        </span>
      </div>
      <button class="btn btn-marigold btn-block" id="add-btn" ${outOfStock ? 'disabled' : ''}>
        ${outOfStock ? 'Sold out' : 'Add to cart'}
      </button>
    </div>
  `;

  const qtyInput = document.querySelector('#qty-input');
  document.querySelector('#qty-dec').addEventListener('click', () => {
    qtyInput.value = Math.max(1, parseInt(qtyInput.value, 10) - 1);
  });
  document.querySelector('#qty-inc').addEventListener('click', () => {
    qtyInput.value = Math.min(p.stock, parseInt(qtyInput.value, 10) + 1);
  });

  document.querySelector('#add-btn').addEventListener('click', async () => {
    const quantity = parseInt(qtyInput.value, 10) || 1;
    try {
      await api('/cart', { method: 'POST', body: JSON.stringify({ productId: p.id, quantity }) });
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
}

async function init() {
  const id = getProductId();
  if (!id) {
    document.querySelector('#pdp-root').innerHTML = `<p class="center-note">No product specified.</p>`;
    return;
  }
  try {
    const product = await api(`/products/${id}`);
    renderProduct(product);
  } catch (err) {
    document.querySelector('#pdp-root').innerHTML = `<p class="center-note">${err.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
