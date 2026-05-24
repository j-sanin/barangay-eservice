const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (toEmail, otpCode) => {
  const expiryMinutes = process.env.OTP_EXPIRY_MINUTES || 10;
  
  console.log('Sending email to:', toEmail);
  console.log('API Key exists:', !!process.env.RESEND_API_KEY);

  const result = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: toEmail,
    subject: 'Your Barangay E-Service Login Code',
    html: `<p>Your OTP is: <strong>${otpCode}</strong></p>`,
  });
  
  console.log('Resend result:', JSON.stringify(result));const Brevo = require('@getbrevo/brevo');

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

const sendOTPEmail = async (toEmail, otpCode) => {
  const expiryMinutes = process.env.OTP_EXPIRY_MINUTES || 10;

  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  sendSmtpEmail.subject = 'Your Barangay E-Service Login Code';
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color: #1a1a2e;">Barangay E-Service</h2>
      <p>Your OTP expires in <strong>${expiryMinutes} minutes</strong>.</p>
      <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px; text-align: center;
                  background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 24px 0;">
        ${otpCode}
      </div>
      <p style="color: #888; font-size: 13px;">If you did not request this, ignore this email.</p>
    </div>
  `;
  sendSmtpEmail.sender = { name: 'Barangay E-Service', email: process.env.EMAIL_USER };
  sendSmtpEmail.to = [{ email: toEmail }];

  console.log('Sending email to:', toEmail);
  const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
  console.log('Email sent:', JSON.stringify(result));
};

module.exports = { sendOTPEmail };
};

module.exports = { sendOTPEmail };