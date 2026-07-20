const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const Task = require('../models/Task');

// Get all tasks for logged in user
router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a task
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, deadline, priority, estimatedHours } = req.body;
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
    res.status(500).json({ message: error.message });
  }
});

// Delete a task
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Make sure user owns the task
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await task.deleteOne();
    res.status(200).json({ message: 'Task removed' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;