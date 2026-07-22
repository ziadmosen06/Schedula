const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { logAuditEvent, logLoginAuditEvent } = require('../utils/audit');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      passwordHistory: []
    });

    await User.findByIdAndUpdate(user._id, {
      passwordHistory: [user.password]
    });

    await logAuditEvent(user._id, 'register', req);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to process request' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await logLoginAuditEvent(user._id, req);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to process request' });
  }
};

const logout = async (req, res) => {
  try {
    await logAuditEvent(req.user._id, 'logout', req);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to process request' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email' });
    }

    const user = await User.findOne({ email }).select('+passwordResetOtp +passwordResetOtpExpiresAt');

    if (user) {
      const otp = crypto.randomInt(100000, 999999).toString();
      const hashedOtp = await bcryptjs.hash(otp, 10);

      user.passwordResetOtp = hashedOtp;
      user.passwordResetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Schedula Password Reset OTP',
          text: `Your OTP is ${otp}. It expires in 10 minutes.`
        });

        console.log(`OTP sent to ${user.email}`);
      } catch (mailError) {
        console.error('Email send error:', mailError.message);
        return res.status(502).json({ message: 'Unable to send reset email right now.' });
      }
    }

    res.status(200).json({ message: 'If an account exists, an email has been sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to process request' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email }).select('+passwordResetOtp +passwordResetOtpExpiresAt +passwordHistory +password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (!user.passwordResetOtp || !user.passwordResetOtpExpiresAt || new Date() > user.passwordResetOtpExpiresAt) {
      user.passwordResetOtp = undefined;
      user.passwordResetOtpExpiresAt = undefined;
      await user.save();
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const isOtpMatch = await bcryptjs.compare(otp, user.passwordResetOtp);
    if (!isOtpMatch) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const existingHistory = user.passwordHistory || [];
    const passwordReused = await Promise.all(
      existingHistory.map((oldHash) => bcryptjs.compare(newPassword, oldHash))
    );

    if (passwordReused.some(Boolean)) {
      return res.status(400).json({ message: 'Please choose a different password' });
    }

    const newPasswordHash = await bcryptjs.hash(newPassword, 10);

    user.password = newPasswordHash;
    user.passwordHistory = [newPasswordHash, ...existingHistory].slice(0, 5);
    user.passwordResetOtp = undefined;
    user.passwordResetOtpExpiresAt = undefined;

    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to process request' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    const user = await User.findById(req.user._id).select('+password +passwordHistory');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const existingHistory = user.passwordHistory || [];
    const passwordReused = await Promise.all(
      existingHistory.map((oldHash) => bcryptjs.compare(newPassword, oldHash))
    );

    if (passwordReused.some(Boolean)) {
      return res.status(400).json({ message: 'Please choose a different password' });
    }

    const newPasswordHash = await bcryptjs.hash(newPassword, 10);

    user.password = newPasswordHash;
    user.passwordHistory = [newPasswordHash, ...existingHistory].slice(0, 5);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to process request' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.name) user.name = req.body.name;

    // If multer provided a file, set the photoUrl to served uploads path
    if (req.file) {
      const fullUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      user.photoUrl = fullUrl;
    } else if (req.body.photoUrl) {
      user.photoUrl = req.body.photoUrl;
    }

    await user.save();
    await logAuditEvent(req.user._id, 'profile updated', req);

    res.status(200).json({ _id: user._id, name: user.name, email: user.email, photoUrl: user.photoUrl });
  } catch (error) {
    res.status(500).json({ message: 'Unable to process request' });
  }
};

module.exports = { register, login, logout, forgotPassword, resetPassword, changePassword, updateProfile };