// public/js/main.js
// Shared helpers used across all pages: fetch wrapper, toast, nav auth state, cart badge.

async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong.');
  }
  return data;
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function formatMoney(n) {
  return `$${Number(n).toFixed(2)}`;
}

async function refreshCartBadge() {
  const badge = document.querySelector('#cart-count');
  if (!badge) return;
  try {
    const cart = await api('/cart');
    const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  } catch {
    badge.style.display = 'none';
  }
}

async function initNavAuth() {
  const authSlot = document.querySelector('#auth-slot');
  if (!authSlot) return;
  try {
    const { user } = await api('/auth/me');
    if (user) {
      authSlot.innerHTML = `
        <a href="/orders.html">My orders</a>
        <a href="#" id="logout-link">Log out (${user.name.split(' ')[0]})</a>
      `;
      document.querySelector('#logout-link').addEventListener('click', async (e) => {
        e.preventDefault();
        await api('/auth/logout', { method: 'POST' });
        window.location.href = '/index.html';
      });
    } else {
      authSlot.innerHTML = `
        <a href="/login.html">Log in</a>
        <a href="/register.html">Sign up</a>
      `;
    }
  } catch {
    authSlot.innerHTML = `<a href="/login.html">Log in</a>`;
  }
  refreshCartBadge();
}

document.addEventListener('DOMContentLoaded', initNavAuth);
