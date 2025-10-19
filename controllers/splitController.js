const Split = require('../models/Split');
const Expense = require('../models/Expense');

// Get all splits
exports.getAllSplits = async (req, res) => {
  try {
    const splits = await Split.find().sort({ createdAt: -1 });
    res.json(splits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single split
exports.getSplitById = async (req, res) => {
  try {
    const split = await Split.findById(req.params.id);
    if (!split) return res.status(404).json({ error: 'Split not found' });
    res.json(split);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create split
exports.createSplit = async (req, res) => {
  try {
    const { name, color } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Split name is required' });
    }

    const existingSplit = await Split.findOne({ name });
    if (existingSplit) {
      return res.status(400).json({ error: 'Split name already exists' });
    }

    const split = new Split({ name, color });
    await split.save();
    res.status(201).json(split);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update split
exports.updateSplit = async (req, res) => {
  try {
    const { name, color } = req.body;
    
    if (name && name.trim() === '') {
      return res.status(400).json({ error: 'Split name cannot be empty' });
    }

    const split = await Split.findByIdAndUpdate(
      req.params.id,
      { name, color },
      { new: true }
    );
    if (!split) return res.status(404).json({ error: 'Split not found' });
    res.json(split);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete split
exports.deleteSplit = async (req, res) => {
  try {
    // Check if split has any expenses
    const expenseCount = await Expense.countDocuments({ split: req.params.id });
    if (expenseCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete split with ${expenseCount} expenses` 
      });
    }

    const split = await Split.findByIdAndDelete(req.params.id);
    if (!split) return res.status(404).json({ error: 'Split not found' });
    res.json({ message: 'Split deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};