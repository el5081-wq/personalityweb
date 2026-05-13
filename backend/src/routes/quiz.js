const express = require('express');
const questions = require('../data/questions');
const personalities = require('../data/personalities');
const QuizResult = require('../models/QuizResult');

const router = express.Router();

router.get('/questions', (_req, res) => {
  const sanitized = questions.map(({ id, text, options }) => ({
    id,
    text,
    options: options.map(({ id, text }) => ({ id, text })),
  }));
  res.json(sanitized);
});

router.post('/submit', async (req, res) => {
  const { answers } = req.body;

  if (!Array.isArray(answers) || answers.length !== questions.length) {
    return res.status(422).json({ error: `Expected ${questions.length} answers.` });
  }

  const scores = {};
  for (const { questionId, selectedOption } of answers) {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return res.status(422).json({ error: `Invalid questionId: ${questionId}` });

    const option = question.options.find((o) => o.id === selectedOption);
    if (!option) return res.status(422).json({ error: `Invalid option "${selectedOption}" for question ${questionId}` });

    for (const [type, points] of Object.entries(option.scores)) {
      scores[type] = (scores[type] || 0) + points;
    }
  }

  const personalityType = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const personality = personalities[personalityType];

  try {
    await QuizResult.create({ personalityType, scores, answers });
  } catch (err) {
    console.error('Failed to save quiz result:', err.message);
  }

  res.json({
    personalityType,
    ...personality,
    scores,
  });
});

router.get('/stats', async (_req, res) => {
  try {
    const stats = await QuizResult.aggregate([
      { $group: { _id: '$personalityType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
