// public/js/auth.js
// Handles both the login form and the register form (whichever is present on the page).

function showFormError(msg) {
  const el = document.querySelector('#form-error');
  el.textContent = msg;
  el.classList.add('show');
}

async function handleLogin(e) {
  e.preventDefault();
  document.querySelector('#form-error').classList.remove('show');
  const btn = document.querySelector('#submit-btn');
  btn.disabled = true;
  btn.textContent = 'Logging in…';

  try {
    await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: e.target.email.value.trim(),
        password: e.target.password.value
      })
    });
    window.location.href = '/index.html';
  } catch (err) {
    showFormError(err.message);
    btn.disabled = false;
    btn.textContent = 'Log in';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  document.querySelector('#form-error').classList.remove('show');
  const btn = document.querySelector('#submit-btn');
  btn.disabled = true;
  btn.textContent = 'Creating account…';

  try {
    await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: e.target.name.value.trim(),
        email: e.target.email.value.trim(),
        password: e.target.password.value
      })
    });
    window.location.href = '/index.html';
  } catch (err) {
    showFormError(err.message);
    btn.disabled = false;
    btn.textContent = 'Create account';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('#login-form');
  const registerForm = document.querySelector('#register-form');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (registerForm) registerForm.addEventListener('submit', handleRegister);
});
