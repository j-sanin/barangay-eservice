const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (toEmail, otpCode) => {
  const expiryMinutes = process.env.OTP_EXPIRY_MINUTES || 10;
  
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: toEmail,
    subject: 'Your Barangay E-Service Login Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #1a1a2e;">Barangay E-Service</h2>
        <p>Your OTP expires in <strong>${expiryMinutes} minutes</strong>.</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px; text-align: center;
                    background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 24px 0;">
          ${otpCode}
        </div>
        <p style="color: #888; font-size: 13px;">If you did not request this, ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendOTPEmail };