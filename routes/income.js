const express = require('express');
const router = express.Router();
const Income = require('../models/Income');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.userId = decoded.userId;
    next();
  });
};

// Get all income
router.get('/', authenticateToken, async (req, res) => {
  try {
    const income = await Income.find({ userId: req.userId }).sort({ date: -1 });
    res.json(income);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add income
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { amount, source, date } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }

    const income = new Income({
      userId: req.userId,
      amount,
      source: source || 'Salary',
      date: date || new Date()
    });

    await income.save();
    res.status(201).json(income);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete income
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }

    res.json({ message: 'Income deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

