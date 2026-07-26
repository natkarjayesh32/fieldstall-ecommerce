// public/js/checkout.js

async function loadSummary() {
  try {
    const cart = await api('/cart');
    const summaryRoot = document.querySelector('#summary-root');

    if (cart.items.length === 0) {
      summaryRoot.innerHTML = `
        <div class="empty-state">
          <h3>Nothing to check out</h3>
          <p>Your cart is empty.</p>
          <br><a href="/index.html" class="btn btn-marigold">Browse products</a>
        </div>`;
      document.querySelector('#place-order-btn').disabled = true;
      return;
    }

    const lines = cart.items
      .map(
        (i) => `
        <div class="receipt-line">
          <div><div class="name">${i.name}</div><div class="sub">x${i.quantity}</div></div>
          <div class="mono">${formatMoney(i.price * i.quantity)}</div>
        </div>`
      )
      .join('');

    summaryRoot.innerHTML = `
      <div class="receipt">
        <div class="receipt-head">
          <div class="store">ORDER SUMMARY</div>
          <div class="meta">${cart.items.length} item type${cart.items.length > 1 ? 's' : ''}</div>
        </div>
        <div class="receipt-body">${lines}</div>
        <div class="receipt-total">
          <div class="row"><span>Subtotal</span><span>${formatMoney(cart.total)}</span></div>
          <div class="row"><span>Shipping</span><span>Free</span></div>
          <div class="row grand"><span>Total</span><span>${formatMoney(cart.total)}</span></div>
        </div>
      </div>
    `;
  } catch (err) {
    if (err.message.includes('logged in')) {
      window.location.href = '/login.html';
      return;
    }
    document.querySelector('#summary-root').innerHTML = `<p class="center-note">${err.message}</p>`;
  }
}

function showFormError(msg) {
  const el = document.querySelector('#form-error');
  el.textContent = msg;
  el.classList.add('show');
}

async function handleSubmit(e) {
  e.preventDefault();
  const el = document.querySelector('#form-error');
  el.classList.remove('show');

  const btn = document.querySelector('#place-order-btn');
  btn.disabled = true;
  btn.textContent = 'Placing order…';

  const form = e.target;
  const payload = {
    shippingName: form.shippingName.value.trim(),
    shippingAddress: form.shippingAddress.value.trim(),
    shippingCity: form.shippingCity.value.trim(),
    shippingZip: form.shippingZip.value.trim()
  };

  try {
    const order = await api('/orders', { method: 'POST', body: JSON.stringify(payload) });
    window.location.href = `/order-confirmation.html?id=${order.id}`;
  } catch (err) {
    showFormError(err.message);
    btn.disabled = false;
    btn.textContent = 'Place order';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadSummary();
  document.querySelector('#checkout-form').addEventListener('submit', handleSubmit);
});
