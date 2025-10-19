const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// Get summary by split
router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query).populate('split');
    
    const summary = {};
    expenses.forEach(exp => {
      const splitName = exp.split.name;
      if (!summary[splitName]) {
        summary[splitName] = { total: 0, count: 0, color: exp.split.color };
      }
      summary[splitName].total += exp.amount;
      summary[splitName].count += 1;
    });

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get monthly breakdown
router.get('/monthly', async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    const expenses = await Expense.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('split');

    const monthlyData = {};
    for (let i = 1; i <= 12; i++) {
      monthlyData[i] = {};
    }

    expenses.forEach(exp => {
      const month = exp.date.getMonth() + 1;
      const splitName = exp.split.name;
      if (!monthlyData[month][splitName]) {
        monthlyData[month][splitName] = 0;
      }
      monthlyData[month][splitName] += exp.amount;
    });

    res.json(monthlyData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;