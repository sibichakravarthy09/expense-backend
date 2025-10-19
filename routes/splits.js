const express = require('express');
const router = express.Router();
const Split = require('../models/Split');

// Get all splits
router.get('/', async (req, res) => {
  try {
    const splits = await Split.find().sort({ createdAt: -1 });
    res.json(splits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single split
router.get('/:id', async (req, res) => {
  try {
    const split = await Split.findById(req.params.id);
    if (!split) return res.status(404).json({ error: 'Split not found' });
    res.json(split);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create split
router.post('/', async (req, res) => {
  try {
    const { name, color } = req.body;
    const split = new Split({ name, color });
    await split.save();
    res.status(201).json(split);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update split
router.put('/:id', async (req, res) => {
  try {
    const { name, color } = req.body;
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
});

// Delete split
router.delete('/:id', async (req, res) => {
  try {
    const split = await Split.findByIdAndDelete(req.params.id);
    if (!split) return res.status(404).json({ error: 'Split not found' });
    res.json({ message: 'Split deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;