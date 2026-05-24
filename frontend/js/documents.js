const API_BASE = 'http://192.168.56.1:5000/api';

// ── AUTH GUARD ────────────────────────────────────────────
if (!localStorage.getItem('token')) {
  alert('You need to log in to access this page.');
  window.location.href = 'login.html';
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

// ✅ POPUP FUNCTIONS
function openModal(title, imgSrc) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalImage').src = imgSrc;
    document.getElementById('sampleModal').style.display = 'block';
}
function closeModal() {
    document.getElementById('sampleModal').style.display = 'none';
}
// Close if click outside
window.onclick = function(e) {
    const modal = document.getElementById('sampleModal');
    if (e.target === modal) modal.style.display = 'none';
}

// ── SUBMIT HANDLER ────────────────────────────────────────
document.getElementById(`docForm`).addEventListener(`submit`, async function (e) {
  e.preventDefault();

  const selected = this.querySelector(`input[name="document"]:checked`);
  if (!selected) {
    alert(`Please select a document type first.`);
    return;
  }

  const purpose = document.getElementById('purposeInput').value.trim();
  if (!purpose) {
    alert('Please state your reason for requesting this document.');
    document.getElementById('purposeInput').focus();
    return;
  }

  const btn = document.getElementById('submitBtn');
  btn.disabled    = true;
  btn.textContent = 'Submitting...';

  try {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        documentType: selected.value,
        purpose: purpose
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Failed to submit request. Please try again.');
      btn.disabled    = false;
      btn.textContent = 'Submit Request';
      return;
    }

    alert('✅ Request submitted successfully! Redirecting to your dashboard...');
    window.location.replace('dashboard.html');

  } catch (err) {
    alert(`❌ Could not connect to the server. Please check your internet connection and try again.`);
    btn.disabled    = false;
    btn.textContent = `Submit Request`;
    console.error(`Submit request error:`, err);
  }
});