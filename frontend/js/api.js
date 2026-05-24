// 📌 API.JS — BACKEND CONNECTION ONLY
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api/auth'
  : 'https://your-render-app-name.onrender.com/api/auth';

// ✅ LOGIN
async function loginUser(email, password) {
  return fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
}

// ✅ VERIFY OTP
async function verifyOtpCode(email, otp) {
  return fetch(`${API_BASE}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
}

// ✅ RESEND OTP
async function resendOtpCode(email) {
  return fetch(`${API_BASE}/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
}