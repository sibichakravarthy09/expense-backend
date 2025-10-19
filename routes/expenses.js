const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// Middleware to check JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided. Please login' });
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

// Get all user expenses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;
    let query = { userId: req.userId };

    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create expense
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { description, amount, category, date, notes } = req.body;

    if (!description || !amount || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const expense = new Expense({
      userId: req.userId,
      description,
      amount,
      category,
      date: date || new Date(),
      notes
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete expense
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get expenses summary
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId });

    const summary = {};
    let totalAmount = 0;

    expenses.forEach(exp => {
      if (!summary[exp.category]) {
        summary[exp.category] = { total: 0, count: 0 };
      }
      summary[exp.category].total += exp.amount;
      summary[exp.category].count += 1;
      totalAmount += exp.amount;
    });

    res.json({ summary, totalAmount, count: expenses.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;