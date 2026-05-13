// this file handles all the api routes for the contact form
// POST /api/contact saves a new message to the database
// GET /api/contact returns all messages (useful for checking submissions)
// PATCH /api/contact/:id/read marks a message as read
//used this youtube video to learn how to code the server https://www.youtube.com/watch?v=CvCiNeLnZ00&t=7694s

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
    .trim()// removes whitespace from both ends of the string so space email address works
    .notEmpty().withMessage('Must be email')
    .isEmail().withMessage('Needs to be valid email address')
    .normalizeEmail(),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 2000 }).withMessage('Message must be 2000 characters or fewer'),
];

// POST /api/contact — submit a new message
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

// GET /api/contact — retrieve all submissions (admin use)
router.get('/', async (_req, res) => {
  try {
    const submissions = await Contact.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error('Fetch contacts error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/contact/:id/read — mark a message as read
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
