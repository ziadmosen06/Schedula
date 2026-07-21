const { CohereClient } = require('cohere-ai');
const Task = require('../models/Task');

const scheduleTask = async (req, res) => {
  const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY
  });

  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const today = new Date().toISOString().split('T')[0];
    const deadline = new Date(task.deadline).toISOString().split('T')[0];

    const response = await cohere.chat({
      model: 'command-r7b-12-2024',
      message: `Create a daily schedule for this task:
Task: ${task.title}
Total hours needed: ${task.estimatedHours}
Start date: ${today}
Deadline: ${deadline}
Priority: ${task.priority}

Return ONLY a JSON array, no other text:
[{"date":"YYYY-MM-DD","hoursPerDay":2,"focus":"what to do"}]
Total hours across all days must equal ${task.estimatedHours}.`,
    });

    const text = response.text;
console.log('AI response:', text);

const jsonMatch = text.match(/\[[\s\S]*?\]/);

if (!jsonMatch) {
  return res.status(500).json({ message: 'AI could not generate a schedule' });
}

try {
  const scheduledDays = JSON.parse(jsonMatch[0]);
  task.scheduledDays = scheduledDays;
  await task.save();
  res.status(200).json({ message: 'Task scheduled successfully', task });
} catch (parseError) {
  console.error('Parse error:', parseError.message);
  console.error('Raw text:', text);
  res.status(500).json({ message: 'Failed to parse AI response' });
}
    task.scheduledDays = scheduledDays;
    await task.save();

    res.status(200).json({ message: 'Task scheduled successfully', task });

  } catch (error) {
    console.error('Cohere error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { scheduleTask };