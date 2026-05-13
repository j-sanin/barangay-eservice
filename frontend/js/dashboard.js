const API_BASE = 'https://barangay-eservice-api.onrender.com/api';
let dashboardLoaded = false;

// ── AUTH HELPERS ─────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

// ── FETCH WRAPPER ─────────────────────────────────────────────
async function fetchData(endpoint) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { headers: authHeaders() });

    if (res.status === 401) {
      alert('Session expired. Please log in again.');
      localStorage.clear();
      window.location.href = 'login.html';
      return null;
    }

    if (res.status === 403) {
      alert('Admin access only. Please log in as admin.');
      localStorage.clear();
      window.location.href = 'admin-login.html';
      return null;
    }

    if (!res.ok) throw new Error(`Server error ${res.status}`);

    const json = await res.json();
    return json.data ?? json;

  } catch (err) {
    console.error(`fetchData(${endpoint}) failed:`, err);
    return null;
  }
}

// ── RENDER HELPERS ────────────────────────────────────────────
function renderList(containerId, items, templateFn) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="10" style="padding:25px; text-align:center; color:#a8b2d1;">
          No requests found yet.
        </td>
      </tr>`;
    return;
  }

  container.innerHTML = items.map(templateFn).join('');
}

function statusBadge(status) {
  const map = {
    pending:   { bg: 'rgba(255,215,0,0.15)',   color: '#ffd700' },
    approved:  { bg: 'rgba(100,255,218,0.15)', color: '#64ffda' },
    completed: { bg: 'rgba(110,168,255,0.15)', color: '#6ea8fe' },
    rejected:  { bg: 'rgba(255,100,100,0.15)', color: '#ff6464' },
  };
  const s = status?.toLowerCase() ?? 'pending';
  const style = map[s] ?? map.pending;
  return `<span style="background:${style.bg}; color:${style.color}; padding:5px 14px; border-radius:20px; font-size:13px; font-weight:600;">${capitalize(status)}</span>`;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

function formatReleaseDate(dateStr) {
  if (!dateStr) return '<span class="no-date">Not yet set by admin</span>';
  const d = new Date(dateStr);
  const formatted = d.toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  return `<span class="release-date">${formatted}</span>`;
}

// ── RESIDENT DASHBOARD ────────────────────────────────────────
async function loadMyDashboard() {
  if (dashboardLoaded) return;
  dashboardLoaded = true;

  const requests = await fetchData('/requests/mine');
  if (requests === null) return;

  const pending   = requests.filter(r => r.status === 'pending').length;
  const approved  = requests.filter(r => r.status === 'approved').length;
  const completed = requests.filter(r => r.status === 'completed').length;

  const elP = document.getElementById('countPending');
  const elA = document.getElementById('countApproved');
  const elC = document.getElementById('countCompleted');

  if (elP) elP.textContent = pending;
  if (elA) elA.textContent = approved;
  if (elC) elC.textContent = completed;

  renderList('requestTableBody', requests, req => `
    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
      <td style="color:#fff; padding:15px; font-weight:500;">
        ${capitalize(req.documentType?.replace(/_/g, ' '))}
      </td>
      <td style="color:#a8b2d1; padding:15px; font-size:0.9rem; max-width:220px;">
        ${req.purpose || '—'}
      </td>
      <td style="color:#a8b2d1; padding:15px;">
        ${formatDate(req.createdAt)}
      </td>
      <td style="padding:15px;">
        ${statusBadge(req.status)}
      </td>
      <td style="padding:15px;">
        ${formatReleaseDate(req.releaseDate)}
      </td>
    </tr>
  `);
}

// ── TRACK PAGE ────────────────────────────────────────────────
async function loadMyRequests() {
  const requests = await fetchData('/requests/mine');
  if (requests === null) return;

  renderList('requestTableBody', requests, req => `
    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
      <td style="color:#fff; padding:15px; font-weight:500;">
        ${capitalize(req.documentType?.replace(/_/g, ' '))}
      </td>
      <td style="color:#a8b2d1; padding:15px; font-size:0.9rem;">
        ${req.purpose || '—'}
      </td>
      <td style="color:#a8b2d1; padding:15px;">
        ${formatDate(req.createdAt)}
      </td>
      <td style="padding:15px;">
        ${statusBadge(req.status)}
      </td>
      <td style="padding:15px;">
        ${formatReleaseDate(req.releaseDate)}
      </td>
    </tr>
  `);
}

// ── ADMIN: LOAD ALL REQUESTS ──────────────────────────────────
async function loadAllRequests() {
  const requests = await fetchData('/requests');
  if (!requests) return;

  const pending   = requests.filter(r => r.status === 'pending').length;
  const approved  = requests.filter(r => r.status === 'approved').length;
  const completed = requests.filter(r => r.status === 'completed').length;
  const rejected  = requests.filter(r => r.status === 'rejected').length;

  const elP = document.getElementById('statPending');
  const elA = document.getElementById('statApproved');
  const elC = document.getElementById('statCompleted');
  const elR = document.getElementById('statRejected');

  if (elP) elP.textContent = pending;
  if (elA) elA.textContent = approved;
  if (elC) elC.textContent = completed;
  if (elR) elR.textContent = rejected;

  renderList('adminTableBody', requests, req => `
    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
      <td style="padding:14px; color:#fff; font-weight:500;">
        ${req.user?.name ?? 'Unknown'}
      </td>
      <td style="padding:14px; color:#ccd6f6;">
        ${capitalize(req.documentType?.replace(/_/g, ' '))}
      </td>
      <td style="padding:14px; color:#a8b2d1; font-size:0.85rem; max-width:200px;">
        ${req.purpose || '—'}
      </td>
      <td style="padding:14px; color:#a8b2d1;">
        ${formatDate(req.createdAt)}
      </td>
      <td style="padding:14px;">
        ${statusBadge(req.status)}
      </td>
      <td style="padding:14px;">
        ${buildReleaseDateCell(req)}
      </td>
      <td style="padding:14px;">
        ${req.remarks
          ? `<span style="color:#a8b2d1; font-size:12px; font-style:italic;">${req.remarks}</span>`
          : '<span style="color:#555; font-size:12px;">—</span>'}
      </td>
      <td style="padding:14px; white-space:nowrap;">
        ${buildActionButtons(req)}
      </td>
    </tr>
  `);
}

// ── RELEASE DATE CELL ─────────────────────────────────────────
function buildReleaseDateCell(req) {
  if (req.status === 'completed' || req.status === 'rejected') {
    return req.releaseDate
      ? `<span class="set-date">${formatDate(req.releaseDate)}</span>`
      : '<span style="color:#555; font-size:13px;">—</span>';
  }

  const currentDate = req.releaseDate || '';
  return `
    <input type="date" class="release-date-input" id="date_${req._id}" value="${currentDate}">
    <button class="btn-save-date" onclick="saveReleaseDate('${req._id}')">Save</button>
  `;
}

// ── ACTION BUTTONS ────────────────────────────────────────────
function buildActionButtons(req) {
  const btnStyle = (bg, color, border) =>
    `padding:6px 12px; background:${bg}; color:${color}; border:1px solid ${border};
     border-radius:8px; font-weight:600; font-size:12px; cursor:pointer;
     margin:2px; white-space:nowrap; display:inline-block;`;

  let buttons = '';

  if (req.status === 'pending') {
    buttons += `
      <button onclick="approveRequest('${req._id}')"
        style="${btnStyle('rgba(100,255,218,0.15)', '#64ffda', '#64ffda')}">
        ✔️ Approve
      </button>
      <button onclick="rejectRequest('${req._id}')"
        style="${btnStyle('rgba(255,100,100,0.15)', '#ff6464', '#ff6464')}">
        ✖ Reject
      </button>`;
  }

  if (req.status === 'approved') {
    buttons += `
      <button onclick="completeRequest('${req._id}')"
        style="${btnStyle('rgba(110,168,255,0.15)', '#6ea8fe', '#6ea8fe')}">
        🎉 Complete
      </button>
      <button onclick="rejectRequest('${req._id}')"
        style="${btnStyle('rgba(255,100,100,0.15)', '#ff6464', '#ff6464')}">
        ✖ Reject
      </button>`;
  }

  if (req.status === 'completed' || req.status === 'rejected') {
    buttons += `
      <button onclick="deleteRequest('${req._id}')"
        style="${btnStyle('rgba(255,80,80,0.12)', '#ff5050', '#ff5050')}">
        🗑️ Delete
      </button>`;
  }

  return buttons || '<span style="color:#555; font-size:13px;">—</span>';
}

// ── SAVE RELEASE DATE ─────────────────────────────────────────
async function saveReleaseDate(id) {
  const input = document.getElementById(`date_${id}`);
  if (!input || !input.value) {
    showToast('Please select a date first.', 'warning');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/requests/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ releaseDate: input.value })
    });

    if (!res.ok) throw new Error('Failed');

    showToast(`✅ Release date saved: ${input.value}`, 'success');
    await loadAllRequests();
  } catch (err) {
    showToast('❌ Could not save release date. Please try again.', 'error');
  }
}

// ── APPROVE ───────────────────────────────────────────────────
async function approveRequest(id) {
  const confirmed = await showConfirm(
    'Approve Request',
    'Are you sure you want to approve this request?',
    'Approve', 'Cancel', '#64ffda'
  );
  if (!confirmed) return;

  try {
    const res = await fetch(`${API_BASE}/requests/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status: 'approved' })
    });
    if (!res.ok) throw new Error('Failed');
    showToast('✅ Request approved successfully.', 'success');
    await loadAllRequests();
  } catch (err) {
    showToast('❌ Could not approve. Please try again.', 'error');
  }
}

// ── COMPLETE ──────────────────────────────────────────────────
async function completeRequest(id) {
  const confirmed = await showConfirm(
    'Mark as Completed',
    'Mark this request as completed? The resident will be notified.',
    'Mark Complete', 'Cancel', '#6ea8fe'
  );
  if (!confirmed) return;

  try {
    const res = await fetch(`${API_BASE}/requests/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status: 'completed' })
    });
    if (!res.ok) throw new Error('Failed');
    showToast('🎉 Request marked as completed.', 'success');
    await loadAllRequests();
  } catch (err) {
    showToast('❌ Could not complete. Please try again.', 'error');
  }
}

// ── REJECT (with reason input) ────────────────────────────────
async function rejectRequest(id) {
  const reason = await showPromptConfirm(
    'Reject Request',
    'Enter a rejection reason (optional):',
    'Reject Request', 'Cancel'
  );
  if (reason === null) return; // user cancelled

  try {
    const body = { status: 'rejected' };
    if (reason.trim()) body.remarks = reason.trim();

    const res = await fetch(`${API_BASE}/requests/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('Failed');
    showToast('✖ Request rejected.', 'warning');
    await loadAllRequests();
  } catch (err) {
    showToast('❌ Could not reject. Please try again.', 'error');
  }
}

// ── DELETE ────────────────────────────────────────────────────
async function deleteRequest(id) {
  const confirmed = await showConfirm(
    '⚠️ Delete Request',
    'This will permanently delete the request and cannot be undone. Continue?',
    'Delete', 'Cancel', '#ff5050'
  );
  if (!confirmed) return;

  try {
    const res = await fetch(`${API_BASE}/requests/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed');
    showToast('🗑️ Request deleted.', 'success');
    await loadAllRequests();
  } catch (err) {
    showToast('❌ Could not delete. Please try again.', 'error');
  }
}

// ── MODAL: Confirmation Dialog ────────────────────────────────
function showConfirm(title, message, confirmText, cancelText, confirmColor) {
  return new Promise((resolve) => {
    removeModal();
    const modal = document.createElement('div');
    modal.id = 'customModal';
    modal.innerHTML = `
      <div style="
        position:fixed; inset:0; background:rgba(0,0,0,0.7);
        display:flex; align-items:center; justify-content:center; z-index:9999;">
        <div style="
          background:#1a1f35; border:1px solid rgba(255,255,255,0.1);
          border-radius:16px; padding:32px; max-width:420px; width:90%;
          box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <h3 style="color:#ccd6f6; margin:0 0 12px; font-size:1.2rem;">${title}</h3>
          <p style="color:#a8b2d1; margin:0 0 24px; font-size:0.95rem; line-height:1.6;">${message}</p>
          <div style="display:flex; gap:12px; justify-content:flex-end;">
            <button id="modalCancel" style="
              padding:10px 20px; background:rgba(255,255,255,0.05);
              color:#a8b2d1; border:1px solid rgba(255,255,255,0.15);
              border-radius:8px; font-weight:600; cursor:pointer; font-size:14px;">
              ${cancelText}
            </button>
            <button id="modalConfirm" style="
              padding:10px 20px; background:rgba(${hexToRgb(confirmColor)},0.2);
              color:${confirmColor}; border:1px solid ${confirmColor};
              border-radius:8px; font-weight:600; cursor:pointer; font-size:14px;">
              ${confirmText}
            </button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById('modalConfirm').onclick = () => { removeModal(); resolve(true); };
    document.getElementById('modalCancel').onclick  = () => { removeModal(); resolve(false); };
  });
}

// ── MODAL: Prompt + Confirm (for reject reason) ───────────────
function showPromptConfirm(title, placeholder, confirmText, cancelText) {
  return new Promise((resolve) => {
    removeModal();
    const modal = document.createElement('div');
    modal.id = 'customModal';
    modal.innerHTML = `
      <div style="
        position:fixed; inset:0; background:rgba(0,0,0,0.7);
        display:flex; align-items:center; justify-content:center; z-index:9999;">
        <div style="
          background:#1a1f35; border:1px solid rgba(255,255,255,0.1);
          border-radius:16px; padding:32px; max-width:420px; width:90%;
          box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <h3 style="color:#ccd6f6; margin:0 0 16px; font-size:1.2rem;">${title}</h3>
          <textarea id="modalInput" placeholder="${placeholder}" style="
            width:100%; min-height:90px; background:rgba(255,255,255,0.05);
            border:1px solid rgba(255,255,255,0.15); border-radius:8px;
            color:#ccd6f6; padding:12px; font-size:14px; resize:vertical;
            box-sizing:border-box; margin-bottom:20px;"></textarea>
          <div style="display:flex; gap:12px; justify-content:flex-end;">
            <button id="modalCancel" style="
              padding:10px 20px; background:rgba(255,255,255,0.05);
              color:#a8b2d1; border:1px solid rgba(255,255,255,0.15);
              border-radius:8px; font-weight:600; cursor:pointer; font-size:14px;">
              ${cancelText}
            </button>
            <button id="modalConfirm" style="
              padding:10px 20px; background:rgba(255,100,100,0.2);
              color:#ff6464; border:1px solid #ff6464;
              border-radius:8px; font-weight:600; cursor:pointer; font-size:14px;">
              ${confirmText}
            </button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById('modalConfirm').onclick = () => {
      const val = document.getElementById('modalInput').value;
      removeModal();
      resolve(val);
    };
    document.getElementById('modalCancel').onclick = () => { removeModal(); resolve(null); };
  });
}

function removeModal() {
  const existing = document.getElementById('customModal');
  if (existing) existing.remove();
}

// ── TOAST NOTIFICATION ────────────────────────────────────────
function showToast(message, type = 'success') {
  const existing = document.getElementById('toastNotif');
  if (existing) existing.remove();

  const colors = {
    success: { bg: 'rgba(100,255,218,0.15)', border: '#64ffda', color: '#64ffda' },
    error:   { bg: 'rgba(255,100,100,0.15)', border: '#ff6464', color: '#ff6464' },
    warning: { bg: 'rgba(255,215,0,0.15)',   border: '#ffd700', color: '#ffd700' },
  };
  const c = colors[type] ?? colors.success;

  const toast = document.createElement('div');
  toast.id = 'toastNotif';
  toast.innerHTML = message;
  toast.style.cssText = `
    position:fixed; bottom:28px; right:28px; z-index:99999;
    background:${c.bg}; color:${c.color}; border:1px solid ${c.border};
    padding:14px 22px; border-radius:12px; font-weight:600; font-size:14px;
    box-shadow:0 8px 30px rgba(0,0,0,0.4);
    animation:fadeInUp 0.3s ease;
    max-width:340px; line-height:1.5;`;

  // Inject animation if not present
  if (!document.getElementById('toastStyle')) {
    const style = document.createElement('style');
    style.id = 'toastStyle';
    style.textContent = `
      @keyframes fadeInUp {
        from { opacity:0; transform:translateY(16px); }
        to   { opacity:1; transform:translateY(0); }
      }`;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ── UTILITY ───────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `${r},${g},${b}`;
}

// ── INIT ──────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const url = window.location.href;

  if (url.includes('admin-dashboard.html')) {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('userRole');
    if (!token || role !== 'admin') {
      alert('Admin access only. Please log in.');
      window.location.href = 'admin-login.html';
      return;
    }
    loadAllRequests();
    return;
  }

  if (url.includes('dashboard.html')) {
    loadMyDashboard();
    return;
  }

  if (url.includes('track.html')) {
    loadMyRequests();
  }
});
