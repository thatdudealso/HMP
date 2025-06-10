const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const nodemailer = require('nodemailer');

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  host: 'your-smtp-host', // You'll need to add your SMTP settings
  port: 587,
  secure: false,
  auth: {
    user: 'contact@helpmypet.ai',
    pass: 'your-email-password'
  }
});

router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email already exists
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: 'Email already subscribed' });
    }

    // Create new subscriber
    const subscriber = new Subscriber({ email });
    await subscriber.save();

    // Send confirmation email
    await transporter.sendMail({
      from: 'contact@helpmypet.ai',
      to: email,
      subject: 'Welcome to HelpMyPet.AI Newsletter',
      html: `
        <h2>Welcome to HelpMyPet.AI!</h2>
        <p>Thank you for subscribing to our newsletter. You'll receive updates about the latest veterinary AI developments.</p>
        <p>Best regards,<br>HelpMyPet.AI Team</p>
      `
    });

    res.status(201).json({ message: 'Successfully subscribed' });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ message: 'Error processing subscription' });
  }
});

module.exports = router; 