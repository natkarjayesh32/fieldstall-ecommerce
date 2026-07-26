// public/js/order-confirmation.js

async function init() {
  const id = new URLSearchParams(window.location.search).get('id');
  const root = document.querySelector('#confirmation-root');
  if (!id) {
    root.innerHTML = `<p class="center-note">No order specified.</p>`;
    return;
  }

  try {
    const order = await api(`/orders/${id}`);
    const lines = order.items
      .map(
        (i) => `
        <div class="receipt-line">
          <div><div class="name">${i.product_name}</div><div class="sub">x${i.quantity}</div></div>
          <div class="mono">${formatMoney(i.price * i.quantity)}</div>
        </div>`
      )
      .join('');

    root.innerHTML = `
      <div class="receipt">
        <div class="receipt-head">
          <div class="store">FIELDSTALL</div>
          <div class="meta">Order #${String(order.id).padStart(6, '0')} · ${order.created_at}</div>
          <div class="meta">Ship to: ${order.shipping_name}, ${order.shipping_address}, ${order.shipping_city} ${order.shipping_zip}</div>
        </div>
        <div class="receipt-body">${lines}</div>
        <div class="receipt-total">
          <div class="row grand"><span>Total paid</span><span>${formatMoney(order.total)}</span></div>
          <div class="row"><span>Status</span><span class="status-badge">${order.status}</span></div>
        </div>
      </div>
      <div style="text-align:center;margin-top:24px;">
        <a href="/index.html" class="btn btn-outline">Continue shopping</a>
      </div>
    `;
  } catch (err) {
    root.innerHTML = `<p class="center-note">${err.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
