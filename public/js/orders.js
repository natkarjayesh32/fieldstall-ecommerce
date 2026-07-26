// public/js/orders.js

async function init() {
  const root = document.querySelector('#orders-root');
  try {
    const orders = await api('/orders');
    if (orders.length === 0) {
      root.innerHTML = `
        <div class="empty-state">
          <h3>No orders yet</h3>
          <p>Once you check out, your orders will show up here.</p>
          <br><a href="/index.html" class="btn btn-marigold">Browse products</a>
        </div>`;
      return;
    }

    root.innerHTML = orders
      .map(
        (o) => `
      <div class="order-card">
        <div class="head">
          <span class="oid">#${String(o.id).padStart(6, '0')}</span>
          <span class="status-badge">${o.status}</span>
        </div>
        <div class="items">${o.items.map((i) => `${i.product_name} × ${i.quantity}`).join(', ')}</div>
        <div style="display:flex;justify-content:space-between;margin-top:12px;align-items:center;">
          <span class="mono" style="color:var(--ink-soft);font-size:12.5px;">${o.created_at}</span>
          <span class="mono" style="font-weight:600;">${formatMoney(o.total)}</span>
        </div>
      </div>`
      )
      .join('');
  } catch (err) {
    if (err.message.includes('logged in')) {
      window.location.href = '/login.html';
      return;
    }
    root.innerHTML = `<p class="center-note">${err.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
