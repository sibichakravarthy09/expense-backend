const Expense = require('../models/Expense');

// Get summary by split
exports.getSummary = async (req, res) => {
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
    let totalAmount = 0;

    expenses.forEach(exp => {
      const splitName = exp.split.name;
      if (!summary[splitName]) {
        summary[splitName] = { 
          total: 0, 
          count: 0, 
          color: exp.split.color,
          splitId: exp.split._id
        };
      }
      summary[splitName].total += exp.amount;
      summary[splitName].count += 1;
      totalAmount += exp.amount;
    });

    res.json({ summary, totalAmount, expenseCount: expenses.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get monthly breakdown
exports.getMonthlyBreakdown = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

    const expenses = await Expense.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('split');

    const monthlyData = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 1; i <= 12; i++) {
      monthlyData[monthNames[i - 1]] = {};
    }

    expenses.forEach(exp => {
      const month = exp.date.getMonth();
      const monthName = monthNames[month];
      const splitName = exp.split.name;

      if (!monthlyData[monthName][splitName]) {
        monthlyData[monthName][splitName] = 0;
      }
      monthlyData[monthName][splitName] += exp.amount;
    });

    res.json({ monthlyData, year: currentYear });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get daily breakdown
exports.getDailyBreakdown = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : new Date().getMonth();

    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    const expenses = await Expense.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('split').sort({ date: 1 });

    const dailyData = {};

    expenses.forEach(exp => {
      const day = exp.date.getDate();
      if (!dailyData[day]) {
        dailyData[day] = { total: 0, expenses: [] };
      }
      dailyData[day].total += exp.amount;
      dailyData[day].expenses.push({
        description: exp.description,
        amount: exp.amount,
        split: exp.split.name,
        paidBy: exp.paidBy
      });
    });

    res.json({ dailyData, month: currentMonth, year: currentYear });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get top expenses
exports.getTopExpenses = async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const topExpenses = await Expense.find(query)
      .populate('split')
      .sort({ amount: -1 })
      .limit(parseInt(limit));

    res.json(topExpenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};