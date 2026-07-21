const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const Task = require('../models/Task');

router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, description, deadline, priority, estimatedHours } = req.body;

    if (!title || !deadline) {
      return res.status(400).json({ message: 'Please provide title and deadline' });
    }

    if (title.length > 100) {
      return res.status(400).json({ message: 'Title too long' });
    }

    if (estimatedHours && (estimatedHours < 0 || estimatedHours > 10000)) {
      return res.status(400).json({ message: 'Invalid estimated hours' });
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      deadline,
      priority,
      estimatedHours
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await task.deleteOne();
    res.status(200).json({ message: 'Task removed' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;