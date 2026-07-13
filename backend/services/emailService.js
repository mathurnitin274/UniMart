const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const service = process.env.EMAIL_SERVICE;

  const hasConfig = (host && user && pass) || (service && user && pass);

  if (!hasConfig) {
    console.log(`\n==========================================`);
    console.log(`[EMAIL FALLBACK] Sending email to ${to}:`);
    console.log(`Subject: ${subject}`);
    console.log(`Text Content:\n${text}`);
    console.log(`==========================================\n`);
    return;
  }

  const transporterConfig = service 
    ? { service, auth: { user, pass } }
    : { host, port: parseInt(port) || 587, secure: port === '465', auth: { user, pass } };

  const transporter = nodemailer.createTransport(transporterConfig);

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"UniMart Support" <${user}>`,
    to,
    subject,
    text,
    html: html || text.replace(/\n/g, '<br>')
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SERVICE] Email sent successfully to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[EMAIL SERVICE] Failed to send email to ${to}:`, error.message);
    throw error;
  }
};

const sendOtpEmail = async (email, otp) => {
  return sendEmail({
    to: email,
    subject: 'UniMart Verification Code',
    text: `Your UniMart verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #6366f1; text-align: center; margin-bottom: 24px;">UniMart Verification</h2>
        <p style="font-size: 16px; color: #333333; line-height: 1.6;">Hello,</p>
        <p style="font-size: 16px; color: #333333; line-height: 1.6;">Use the verification code below to complete your sign-in / registration on UniMart. This code is valid for 10 minutes:</p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="font-size: 32px; font-weight: 700; color: #111827; letter-spacing: 4px; padding: 12px 24px; background-color: #f3f4f6; border-radius: 6px; border: 1px solid #e5e7eb; display: inline-block;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #6b7280; line-height: 1.6; border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 32px;">If you did not request this code, you can safely ignore this email.</p>
        <p style="font-size: 14px; color: #6b7280; margin: 0;">Thanks,</p>
        <p style="font-size: 14px; color: #6b7280; font-weight: 600; margin: 0;">The UniMart Team</p>
      </div>
    `
  });
};

module.exports = { sendEmail, sendOtpEmail };
