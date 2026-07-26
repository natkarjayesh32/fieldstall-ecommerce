// public/js/cart.js

function renderCart(cart) {
  const root = document.querySelector('#cart-root');

  if (cart.items.length === 0) {
    root.innerHTML = `
      <div class="empty-state">
        <h3>Your cart is empty</h3>
        <p>Add something from the shop to see it here.</p>
        <br>
        <a href="/index.html" class="btn btn-marigold">Browse products</a>
      </div>`;
    return;
  }

  const itemsHtml = cart.items
    .map(
      (i) => `
      <div class="receipt-line" data-item="${i.cart_item_id}">
        <div>
          <div class="name">${i.name}</div>
          <div class="sub">${formatMoney(i.price)} each</div>
          <div class="cart-item-qty" style="margin-top:8px;">
            <button data-dec="${i.cart_item_id}">−</button>
            <span class="mono">${i.quantity}</span>
            <button data-inc="${i.cart_item_id}" ${i.quantity >= i.stock ? 'disabled' : ''}>+</button>
            <span class="remove-link" data-remove="${i.cart_item_id}" style="margin-left:10px;">Remove</span>
          </div>
        </div>
        <div class="mono">${formatMoney(i.price * i.quantity)}</div>
      </div>`
    )
    .join('');

  root.innerHTML = `
    <div class="cart-layout">
      <div class="receipt">
        <div class="receipt-head">
          <div class="store">FIELDSTALL</div>
          <div class="meta">${cart.items.length} item type${cart.items.length > 1 ? 's' : ''} in cart</div>
        </div>
        <div class="receipt-body">${itemsHtml}</div>
      </div>

      <div>
        <div class="receipt" style="margin-bottom:20px;">
          <div class="receipt-total">
            <div class="row"><span>Subtotal</span><span>${formatMoney(cart.total)}</span></div>
            <div class="row"><span>Shipping</span><span>Free</span></div>
            <div class="row grand"><span>Total</span><span>${formatMoney(cart.total)}</span></div>
          </div>
        </div>
        <a href="/checkout.html" class="btn btn-marigold btn-block">Proceed to checkout</a>
      </div>
    </div>
  `;

  root.querySelectorAll('[data-inc]').forEach((btn) =>
    btn.addEventListener('click', () => changeQty(btn.dataset.inc, 1))
  );
  root.querySelectorAll('[data-dec]').forEach((btn) =>
    btn.addEventListener('click', () => changeQty(btn.dataset.dec, -1))
  );
  root.querySelectorAll('[data-remove]').forEach((el) =>
    el.addEventListener('click', () => removeItem(el.dataset.remove))
  );
}

async function loadCart() {
  try {
    const cart = await api('/cart');
    renderCart(cart);
  } catch (err) {
    if (err.message.includes('logged in')) {
      window.location.href = '/login.html';
      return;
    }
    document.querySelector('#cart-root').innerHTML = `<p class="center-note">${err.message}</p>`;
  }
}

async function changeQty(cartItemId, delta) {
  const currentSpan = document.querySelector(`[data-item="${cartItemId}"] .mono`);
  const currentQty = parseInt(currentSpan.textContent, 10);
  const newQty = currentQty + delta;
  try {
    await api(`/cart/${cartItemId}`, { method: 'PUT', body: JSON.stringify({ quantity: newQty }) });
    await loadCart();
    refreshCartBadge();
  } catch (err) {
    showToast(err.message);
  }
}

async function removeItem(cartItemId) {
  try {
    await api(`/cart/${cartItemId}`, { method: 'DELETE' });
    await loadCart();
    refreshCartBadge();
    showToast('Removed from cart');
  } catch (err) {
    showToast(err.message);
  }
}

document.addEventListener('DOMContentLoaded', loadCart);
