const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// POST /api/users/login — find or create user by email
router.post(
  '/login',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('email').trim().notEmpty().isEmail().withMessage('Valid email is required').normalizeEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { name, email } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ name, email });
      }
      res.json({ id: user._id, name: user.name, email: user.email });
    } catch (err) {
      console.error('User login error:', err.message);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

module.exports = router;
