const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { register, login, logout, forgotPassword, resetPassword, changePassword, updateProfile } = require('../controllers/authController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '..', 'uploads'));
	},
	filename: function (req, file, cb) {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, `${unique}${ext}`);
	}
});

const upload = multer({ storage });

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', protect, changePassword);
// Allow multipart/form-data for profile updates (file + fields)
router.put('/profile', protect, upload.single('photo'), updateProfile);

module.exports = router;