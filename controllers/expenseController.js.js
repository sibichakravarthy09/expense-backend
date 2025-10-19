const Expense = require('../models/Expense');
const Split = require('../models/Split');

// Get all expenses with filtering
exports.getAllExpenses = async (req, res) => {
  try {
    const { split, startDate, endDate, paidBy } = req.query;
    let query = {};

    if (split) query.split = split;
    if (paidBy) query.paidBy = paidBy;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .populate('split')
      .sort({ date: -1 });
    
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single expense
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('split');
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create expense
exports.createExpense = async (req, res) => {
  try {
    const { description, amount, split, paidBy, date, notes } = req.body;

    // Validation
    if (!description || description.trim() === '') {
      return res.status(400).json({ error: 'Description is required' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }
    if (!split) {
      return res.status(400).json({ error: 'Split category is required' });
    }

    // Verify split exists
    const splitExists = await Split.findById(split);
    if (!splitExists) {
      return res.status(400).json({ error: 'Split category does not exist' });
    }

    const expense = new Expense({
      description,
      amount,
      split,
      paidBy: paidBy || 'User',
      date: date ? new Date(date) : new Date(),
      notes
    });

    await expense.save();
    await expense.populate('split');
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const { description, amount, split, paidBy, date, notes } = req.body;

    // Validation
    if (description !== undefined && description.trim() === '') {
      return res.status(400).json({ error: 'Description cannot be empty' });
    }
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    if (split) {
      const splitExists = await Split.findById(split);
      if (!splitExists) {
        return res.status(400).json({ error: 'Split category does not exist' });
      }
    }

    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) updateData.amount = amount;
    if (split !== undefined) updateData.split = split;
    if (paidBy !== undefined) updateData.paidBy = paidBy;
    if (date !== undefined) updateData.date = new Date(date);
    if (notes !== undefined) updateData.notes = notes;

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('split');

    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get expenses by split
exports.getExpensesBySplit = async (req, res) => {
  try {
    const { splitId } = req.params;
    
    const split = await Split.findById(splitId);
    if (!split) return res.status(404).json({ error: 'Split not found' });

    const expenses = await Expense.find({ split: splitId })
      .populate('split')
      .sort({ date: -1 });

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
