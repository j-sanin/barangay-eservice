// js/profile.js — Profile edit/save with real backend API call

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://barangay-eservice-backend.onrender.com/api';

// Load profile data from backend when page loads
async function loadProfile() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users/profile`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.status === 401) {
      localStorage.clear();
      window.location.href = 'login.html';
      return;
    }

    const user = await res.json();

    // Populate display fields
    const displayName = document.getElementById('displayName');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const displayRole = document.getElementById('displayRole');

    if (displayName)  displayName.textContent  = user.name  || '';
    if (profileName)  profileName.textContent  = user.name  || '';
    if (profileEmail) profileEmail.textContent = user.email || '';
    if (displayRole)  displayRole.textContent  = (user.role || 'resident').toUpperCase();

    // Pre-fill hidden inputs with current values
    const inputName  = document.getElementById('inputName');
    const inputEmail = document.getElementById('inputEmail');
    const inputAddress = document.getElementById('inputAddress');
const inputPhone = document.getElementById('inputPhone');
if (inputAddress) inputAddress.value = user.address || '';
if (inputPhone) inputPhone.value = user.phone || '';

// Display fields
const profileAddress = document.getElementById('profileAddress');
const profilePhone = document.getElementById('profilePhone');
if (profileAddress) profileAddress.textContent = user.address || '—';
if (profilePhone) profilePhone.textContent = user.phone || '—';

  } catch (err) {
    console.error('loadProfile error:', err);
  }
}

// Toggle between view and edit mode, and SAVE to backend on confirm
async function toggleEdit() {
  const btn        = document.getElementById('editBtn');
  const isEditing  = btn.classList.contains('save-state');

  if (isEditing) {
    // ── SAVE: send updated name/email to the backend API ──
    const inputName  = document.getElementById('inputName');
    const inputEmail = document.getElementById('inputEmail');

    const newName  = inputName  ? inputName.value.trim()  : '';
    const newEmail = inputEmail ? inputEmail.value.trim() : '';

    if (!newName || !newEmail) {
      alert('Name and email cannot be empty.');
      return;
    }

    btn.disabled    = true;
    btn.textContent = 'Saving...';

    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          name: newName, 
          email: newEmail,
          address: document.getElementById('inputAddress')?.value.trim() || '',
          phone: document.getElementById('inputPhone')?.value.trim() || ''
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Failed to save profile.');
        btn.disabled    = false;
        btn.textContent = 'Save Changes';
        return;
      }

      // Update display with saved values
      const displayName  = document.getElementById('displayName');
      const profileName  = document.getElementById('profileName');
      const profileEmail = document.getElementById('profileEmail');

      if (displayName)  displayName.textContent  = data.name;
      if (profileName)  profileName.textContent  = data.name;
      if (profileEmail) profileEmail.textContent = data.email;

      // Also update localStorage name
      localStorage.setItem('userName', data.name);

      // Hide inputs, show static text
      document.querySelectorAll('.edit-input').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.static-text').forEach(el => el.style.display = 'block');

      btn.disabled    = false;
      btn.textContent = 'Edit Profile';
      btn.classList.remove('save-state');

      alert('Profile saved successfully!');

    } catch (err) {
      alert('Cannot connect to server. Make sure the backend is running.');
      btn.disabled    = false;
      btn.textContent = 'Save Changes';
      console.error('Save profile error:', err);
    }

  } else {
    // ── EDIT: show input fields ──
    document.querySelectorAll('.static-text').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.edit-input').forEach(el => el.style.display = 'block');

    btn.textContent = 'Save Changes';
    btn.classList.add('save-state');
  }
}

// Auto-load profile when page is ready
document.addEventListener('DOMContentLoaded', loadProfile);
