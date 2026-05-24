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
  
  console.log('Resend result:', JSON.stringify(result));
};

module.exports = { sendOTPEmail };