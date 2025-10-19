const validateExpenseRequest = (req, res, next) => {
  const { description, amount, split } = req.body;

  if (!description || description.trim() === '') {
    return res.status(400).json({ error: 'Description is required' });
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  if (!split) {
    return res.status(400).json({ error: 'Split category is required' });
  }

  next();
};

const validateSplitRequest = (req, res, next) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Split name is required' });
  }

  next();
};

module.exports = { validateExpenseRequest, validateSplitRequest };