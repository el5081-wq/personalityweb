const express = require('express');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');

const router = express.Router();

const contactValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must be 100 characters or fewer'),
  body('email')
    .trim()
    .notEmpty().withMessage('Must be email')
    .isEmail().withMessage('Needs to be valid email address')
    .normalizeEmail(),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 2000 }).withMessage('Message must be 2000 characters or fewer'),
];

router.post('/', contactValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const { name, email, message } = req.body;
    const submission = await Contact.create({ name, email, message });
    res.status(201).json({ message: 'Message received', id: submission._id });
  } catch (err) {
    console.error('Contact submission error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const submissions = await Contact.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error('Fetch contacts error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.patch('/:id/read', async (req, res) => {
  try {
    const submission = await Contact.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!submission) return res.status(404).json({ error: 'Submission not found.' });
    res.json(submission);
  } catch (err) {
    console.error('Mark read error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
