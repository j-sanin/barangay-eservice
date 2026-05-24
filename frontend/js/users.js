// API_BASE is already declared in dashboard.js — removed to avoid duplicate error

let allUsers = []; // store all fetched users for search filtering

document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('userRole');
    if (!token || role !== 'admin') {
        alert('Admin access only. Please log in.');
        window.location.href = 'admin-login.html';
    }
});

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

function switchTab(tab) {
    const requestsPanel = document.getElementById('requestsPanel');
    const usersPanel    = document.getElementById('usersPanel');
    const tabRequests   = document.getElementById('tabRequests');
    const tabUsers      = document.getElementById('tabUsers');

    if (tab === 'requests') {
        requestsPanel.classList.remove('hidden');
        usersPanel.classList.remove('active');
        tabRequests.classList.add('active');
        tabUsers.classList.remove('active');
    } else {
        requestsPanel.classList.add('hidden');
        usersPanel.classList.add('active');
        tabRequests.classList.remove('active');
        tabUsers.classList.add('active');
        loadUsers();
    }
}

async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = `<tr><td colspan="4" style="padding:25px; text-align:center; color:#a8b2d1;">Loading users...</td></tr>`;

    try {
        const token = localStorage.getItem('token');
        const res   = await fetch(`${API_BASE}/users/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data  = await res.json();

        if (!res.ok) {
            tbody.innerHTML = `<tr><td colspan="4" style="padding:25px; text-align:center; color:#ff6363;">${data.message || 'Failed to load users.'}</td></tr>`;
            return;
        }

        if (!data.length) {
            tbody.innerHTML = `<tr><td colspan="4" style="padding:25px; text-align:center; color:#a8b2d1;">No users found.</td></tr>`;
            return;
        }

        allUsers = data; // save all users for search
        renderUsers(allUsers);

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4" style="padding:25px; text-align:center; color:#ff6363;">Cannot connect to server.</td></tr>`;
        console.error('Users load error:', err);
    }
}

function renderUsers(list) {
    const tbody = document.getElementById('usersTableBody');

    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="4" style="padding:25px; text-align:center; color:#a8b2d1;">No users found.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map((user, index) => `
        <tr>
            <td style="color:#a8b2d1;">${index + 1}</td>
            <td>${user.name || '—'}</td>
            <td style="color:#a8b2d1;">${user.email || '—'}</td>
            <td style="color:#a8b2d1;">${user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-PH', { year:'numeric', month:'short', day:'numeric' }) : '—'}</td>
        </tr>
    `).join('');
}

function searchUsers() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();

    if (!query) {
        renderUsers(allUsers);
        return;
    }

    const filtered = allUsers.filter(user =>
        user.name && user.name.toLowerCase().includes(query)
    );

    renderUsers(filtered);
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    renderUsers(allUsers);
}