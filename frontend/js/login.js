// 📌 LOGIN.JS — FRONTEND FUNCTIONS ONLY
let timerInterval;
let timeLeft = 10 * 60;
let currentUserEmail = '';

function showMsg(id, text, type) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.className = `alert alert-${type} d-block`;
}

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const btn = document.getElementById('loginBtn');

    if (!email || !password) return showMsg('messageError', 'Please fill in all fields.', 'danger');

    btn.disabled = true;
    btn.textContent = 'Processing...';

    try {
        const res = await loginUser(email, password);
        const data = await res.json();

        if (!res.ok) {
            showMsg('messageError', data.message || 'Login failed.', 'danger');
            btn.disabled = false;
            btn.textContent = 'Login';
            return;
        }

        currentUserEmail = email;
        document.getElementById('userEmailText').textContent = email;
        showOtpModal();
        showMsg('messageSuccess', data.message, 'success');

    } catch (err) {
        showMsg('messageError', 'Server error. Please try again.', 'danger');
        btn.disabled = false;
        btn.textContent = 'Login';
    }
});

function showOtpModal() {
    document.getElementById('otpModal').style.display = 'block';
    startTimer();
    document.querySelectorAll('.otp-box').forEach(b => b.value = '');
    document.getElementById('otpSuccess').className = 'alert alert-success d-none';
    document.getElementById('otpError').className = 'alert alert-danger d-none';
}

function moveNext(input, currentIndex) {
    if (input.value.length === 1 && currentIndex < 6) {
        input.parentElement.children[currentIndex].focus();
    }
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 10 * 60;

    timerInterval = setInterval(() => {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        document.getElementById('timer').textContent = 
            `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showMsg('otpError', '⏰ OTP expired. Please login again.', 'danger');
            document.getElementById('verifyOtpBtn').disabled = true;
        }
        timeLeft--;
    }, 1000);
}

document.getElementById('verifyOtpBtn').addEventListener('click', async function() {
    const otpBoxes = document.querySelectorAll('.otp-box');
    let otpCode = '';
    otpBoxes.forEach(box => otpCode += box.value);

    if (otpCode.length !== 6) return showMsg('otpError', 'Please enter 6-digit code.', 'danger');

    this.disabled = true;
    this.textContent = 'Verifying...';

    try {
        const res = await verifyOtpCode(currentUserEmail, otpCode);
        const data = await res.json();

        if (!res.ok) {
            showMsg('otpError', data.message || 'Invalid Code.', 'danger');
            this.disabled = false;
            this.textContent = 'Verify Code';
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userRole', data.role);

        showMsg('otpSuccess', '✅ Login Successful! Redirecting...', 'success');
        clearInterval(timerInterval);

        setTimeout(() => {
            if (data.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }, 1500);

    } catch (err) {
        showMsg('otpError', 'Server error. Try again.', 'danger');
        this.disabled = false;
        this.textContent = 'Verify Code';
    }
});

document.getElementById('resendOtp').addEventListener('click', async function(e) {
    e.preventDefault();
    const btn = this;
    btn.textContent = 'Sending...';

    try {
        const res = await resendOtpCode(currentUserEmail);
        const data = await res.json();

        if (!res.ok) {
            showMsg('otpError', data.message || 'Failed to resend.', 'danger');
            btn.textContent = 'Resend OTP';
            return;
        }

        showMsg('otpSuccess', '✅ New OTP sent! Timer reset.', 'success');
        startTimer();
        btn.textContent = 'Resend OTP';

    } catch (err) {
        showMsg('otpError', 'Server error.', 'danger');
        btn.textContent = 'Resend OTP';
    }
});

// ✅ CLOSE BUTTON — hides modal and stops timer
document.getElementById('closeModalBtn').addEventListener('click', function() {
    document.getElementById('otpModal').style.display = 'none';
    clearInterval(timerInterval);
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';
});

// ✅ BACKSPACE — delete and go back to previous box
document.getElementById('otpModal').addEventListener('keydown', function(e) {
    if (e.key !== 'Backspace') return;
    const boxes = document.querySelectorAll('.otp-box');
    boxes.forEach(function(box, index) {
        if (document.activeElement === box) {
            e.preventDefault();
            if (box.value !== '') {
                box.value = '';
            } else if (index > 0) {
                boxes[index - 1].value = '';
                boxes[index - 1].focus();
            }
        }
    });
});