// js/register.js — Handles registration form submission

const API_BASE = 'http://192.168.56.1:5000/api';

document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name     = form.querySelector('[name="name"]').value.trim();
    const email    = form.querySelector('[name="email"]').value.trim();
    const password = form.querySelector('[name="password"]').value.trim();

    if (!name || !email || !password) {
      alert('All fields are required.');
      return;
    }

    const btn = form.querySelector('button[type="submit"]') || form.querySelector('button');
    if (btn) { btn.disabled = true; btn.textContent = 'Registering...'; }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'resident' })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Registration failed. Please try again.');
        if (btn) { btn.disabled = false; btn.textContent = 'Register'; }
        return;
      }

      alert('Account created successfully! You can now log in.');
      window.location.href = 'login.html';

    } catch (err) {
      alert('Cannot connect to server. Make sure the backend is running on port 5000.');
      if (btn) { btn.disabled = false; btn.textContent = 'Register'; }
      console.error('Register error:', err);
    }
  });
});
