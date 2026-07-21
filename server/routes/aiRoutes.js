const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { scheduleTask } = require('../controllers/aiController');

router.post('/schedule/:id', protect, scheduleTask);

module.exports = router;