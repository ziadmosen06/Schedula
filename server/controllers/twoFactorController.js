const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');

const setup2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `Schedula (${req.user.email})`
    });

    await User.findByIdAndUpdate(req.user._id, {
      twoFactorSecret: secret.base32
    });

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      message: '2FA setup initiated',
      qrCode: qrCodeUrl,
      secret: secret.base32
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const verify2FA = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findById(req.user._id).select('+twoFactorSecret');

    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: 'Please setup 2FA first' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid 2FA token' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      twoFactorEnabled: true
    });

    res.status(200).json({ message: '2FA enabled successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const disable2FA = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      twoFactorEnabled: false,
      twoFactorSecret: null
    });

    res.status(200).json({ message: '2FA disabled successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { setup2FA, verify2FA, disable2FA };