const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const Task = require('../models/Task');
const { logAuditEvent } = require('../utils/audit');

const estimateHours = (title = '', description = '') => {
  const text = `${title} ${description}`.toLowerCase();
  if (/meeting|call|sync|review|email/i.test(text)) return 0.5;
  if (/bug|fix|debug|investigate|support/i.test(text)) return 2;
  if (/project|launch|plan|research|design/i.test(text)) return 4;
  if (/write|document|report/i.test(text)) return 3;
  if (/cleanup|organize|admin/i.test(text)) return 1.5;
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.min(8, Math.max(1, Math.round(words / 20)));
};

// GET all tasks
router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id, status: { $ne: 'completed' } }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET completed tasks (history)
router.get('/history', protect, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page)) || 1;
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit))) || 10;
    const q = req.query.q ? req.query.q.trim() : '';

    const filter = { user: req.user._id, status: 'completed' };
    if (q) filter.title = { $regex: q, $options: 'i' };

    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);

    res.status(200).json({ tasks, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create task
router.post('/', protect, async (req, res) => {
  try {
    let { title, description, deadline, priority, estimatedHours } = req.body;

    if (!title || !deadline) {
      return res.status(400).json({ message: 'Please provide title and deadline' });
    }

    title = String(title).trim();
    if (title.length > 100) {
      return res.status(400).json({ message: 'Title too long' });
    }

    const selectedDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return res.status(400).json({ message: 'Deadline cannot be in the past' });
    }

    estimatedHours = Number(estimatedHours || 1);
    if (Number.isNaN(estimatedHours) || estimatedHours < 0 || estimatedHours > 10000) {
      return res.status(400).json({ message: 'Invalid estimated hours' });
    }

    const finalEstimatedHours = estimatedHours ?? estimateHours(title, description);

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      deadline: new Date(deadline),
      priority,
      estimatedHours: finalEstimatedHours
    });

    await logAuditEvent(req.user._id, 'task created', req);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// PATCH mark task as completed
router.patch('/:id/complete', protect, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    task.status = 'completed';
    await task.save();

    await logAuditEvent(req.user._id, 'task completed', req);
    res.status(200).json({ message: 'Task marked as completed', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH reschedule overdue task
router.patch('/:id/reschedule', protect, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const { deadline, priority } = req.body;

    if (!deadline) {
      return res.status(400).json({ message: 'Please provide a new deadline' });
    }

    const selectedDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return res.status(400).json({ message: 'New deadline cannot be in the past' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    task.deadline = new Date(deadline);
    if (priority) task.priority = priority;
    task.scheduledDays = [];
    await task.save();

    await logAuditEvent(req.user._id, 'task rescheduled', req);
    res.status(200).json({ message: 'Task rescheduled successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE task
router.delete('/:id', protect, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await task.deleteOne();
    await logAuditEvent(req.user._id, 'task deleted', req);
    res.status(200).json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;