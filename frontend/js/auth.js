// js/auth.js — Auth helper used by protected pages

const API_BASE =  'https://barangay-eservice-api.onrender.com/api';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

function checkLoginStatus() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('You need to log in to access this page.');
    window.location.href = 'login.html';
  }
}

checkLoginStatus();