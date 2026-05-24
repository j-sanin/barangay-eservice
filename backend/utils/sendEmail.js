const https = require('https');

const sendOTPEmail = async (toEmail, otpCode) => {
  const expiryMinutes = process.env.OTP_EXPIRY_MINUTES || 10;
  
  const data = JSON.stringify({
    sender: { name: 'Barangay E-Service', email: process.env.EMAIL_USER },
    to: [{ email: toEmail }],
    subject: 'Your Barangay E-Service Login Code',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #1a1a2e;">Barangay E-Service</h2>
        <p>Your OTP expires in <strong>${expiryMinutes} minutes</strong>.</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px; text-align: center;
                    background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 24px 0;">
          ${otpCode}
        </div>
        <p style="color: #888; font-size: 13px;">If you did not request this, ignore this email.</p>
      </div>
    `
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('Brevo response:', body);
        resolve(body);
      });
    });

    req.on('error', (err) => {
      console.error('Brevo error:', err);
      reject(err);
    });

    req.write(data);
    req.end();
  });
};

module.exports = { sendOTPEmail };