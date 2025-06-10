const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",  // Microsoft/Office365 SMTP server
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "your-email@yourdomain.com", // Your GoDaddy email
    pass: "your-email-password" // Your email password
  }
});

const sendResetCode = async (email, resetCode) => {
  try {
    await transporter.sendMail({
      from: '"Your App Name" <your-email@yourdomain.com>',
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${resetCode}`,
      html: `
        <h1>Password Reset</h1>
        <p>Your password reset code is: <strong>${resetCode}</strong></p>
        <p>This code will expire in 15 minutes.</p>
      `
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = { sendResetCode };
