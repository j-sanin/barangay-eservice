// js/auth.js — Auth helper used by protected pages

const API_BASE = 'http://192.168.56.1:5000/api';

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