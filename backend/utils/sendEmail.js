const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (toEmail, otpCode) => {
  const expiryMinutes = process.env.OTP_EXPIRY_MINUTES || 10;

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      toEmail,
    subject: 'Your Barangay E-Service Login Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #1a1a2e;">Barangay E-Service</h2>
        <p>Use the code below to complete your login. It expires in <strong>${expiryMinutes} minutes</strong>.</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px; text-align: center;
                    background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 24px 0;">
          ${otpCode}
        </div>
        <p style="color: #888; font-size: 13px;">If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendOTPEmail };
