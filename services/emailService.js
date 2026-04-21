const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendPasswordReset = async (toEmail, resetToken) => {
  const base = process.env.FRONTEND_URL?.replace(/\/$/, '') ?? 'http://localhost:4200';
  const resetUrl = `${base}/reset-password/${resetToken}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Password Reset Request',
    text: `You requested a password reset.\n\nReset link: ${resetUrl}\n\nThis link expires in 1 hour.`,
  });
};

module.exports = { sendPasswordReset }; 