const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();
const { sendResetCode } = require('../emailService/emailService');
const crypto = require('crypto');

const router = express.Router();

// Store reset codes temporarily (in production, use a database)
const resetCodes = new Map();

// **User Registration**
router.post("/register", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    country,
    countryCode,
    phoneNumber,
    password, // Will be hashed in User model
    role,
    practiceType,
    licenseNumber,
    experience,
    certificationID,
    clinicName,
    university,
    graduationYear,
  } = req.body;

  try {
    // **Normalize Email**
    const normalizedEmail = email.trim().toLowerCase();

    // **Check required fields**
    if (!firstName || !lastName || !email || !phoneNumber || !password || !role || !practiceType) {
      return res.status(400).json({ error: "Please fill in all required fields." });
    }

    // **Validate phone number length**
    if (phoneNumber.length !== 10) {
      return res.status(400).json({ error: "Phone number must be 10 digits." });
    }

    if (role === "doctor" && (!licenseNumber || !experience)) {
      return res.status(400).json({ error: "Doctors must provide License Number and Experience." });
    }

    if (role === "technician" && (!certificationID || !clinicName)) {
      return res.status(400).json({ error: "Technicians must provide Certification ID and Clinic Name." });
    }

    if (role === "student" && (!university || !graduationYear)) {
      return res.status(400).json({ error: "Students must provide University and Graduation Year." });
    }

    // **Check if user already exists**
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) return res.status(400).json({ error: "User already exists." });

    // **Create User Object**
    const newUser = new User({
      firstName,
      lastName,
      email: normalizedEmail,
      phoneNumber,
      password, // Plain password (will be hashed in User.js)
      role,
      practiceType,
      country,
      countryCode,
      ...(role === "doctor" && { licenseNumber, experience }),
      ...(role === "technician" && { certificationID, clinicName }),
      ...(role === "student" && { university, graduationYear }),
    });

    // **Save User to Database**
    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// **User Login**
router.post("/login", async (req, res) => {
  try {
    console.log('👉 Login request received:', {
      body: req.body,
      headers: req.headers,
      url: req.url
    });

    // Validate input
    if (!req.body.email || !req.body.password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if role is provided
    if (!req.body.role) {
      console.log('❌ Role not provided');
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      console.log('❌ User not found:', req.body.email);
      // Use generic error message to avoid revealing if email exists
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log('✅ User found:', {
      email: user.email,
      role: user.role,
      id: user._id
    });

    // Verify that the user role matches the selected role
    if (user.role !== req.body.role) {
      console.log('❌ Role mismatch:', {
        selectedRole: req.body.role,
        actualRole: user.role
      });
      // Use generic error message to avoid revealing role information
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await user.comparePassword(req.body.password);
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', req.body.email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log('✅ Login successful for:', req.body.email);

    // Send response
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: "Login failed: " + error.message });
  }
});

// **Password Reset**
router.post('/api/auth/reset-password', async (req, res) => {
  const { email } = req.body;
  
  // Generate a 6-digit reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store the reset code with expiration (15 minutes)
  resetCodes.set(email, {
    code: resetCode,
    expiry: Date.now() + 15 * 60 * 1000 // 15 minutes
  });

  // Send the reset code via email
  const emailSent = await sendResetCode(email, resetCode);

  if (emailSent) {
    res.json({ message: "Reset code sent to your email" });
  } else {
    res.status(500).json({ message: "Error sending reset code" });
  }
});

// New endpoint to verify code and update password
router.post('/api/auth/verify-reset', async (req, res) => {
  const { email, code, newPassword } = req.body;
  
  const storedReset = resetCodes.get(email);
  
  if (!storedReset || storedReset.code !== code) {
    return res.status(400).json({ message: "Invalid reset code" });
  }
  
  if (Date.now() > storedReset.expiry) {
    resetCodes.delete(email);
    return res.status(400).json({ message: "Reset code has expired" });
  }

  try {
    // Update password in your database here
    // ... your password update logic ...

    // Clear the reset code
    resetCodes.delete(email);
    
    res.json({ message: "Password successfully reset" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password" });
  }
});

// Add this temporary route to check users
router.get("/test-users", async (req, res) => {
  try {
    const users = await User.find({}, 'email role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;