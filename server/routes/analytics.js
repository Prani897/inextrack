const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route   GET /api/analytics/summary
// @desc    Get summary statistics
// @access  Private
router.get('/summary', async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    
    let dateQuery = {};
    const now = new Date();
    
    if (period) {
      switch(period) {
        case 'daily':
          dateQuery = {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          };
          break;
        case 'weekly':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          dateQuery = { $gte: weekStart };
          break;
        case 'monthly':
          dateQuery = {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
          };
          break;
        case 'yearly':
          dateQuery = {
            $gte: new Date(now.getFullYear(), 0, 1),
            $lt: new Date(now.getFullYear() + 1, 0, 1)
          };
          break;
      }
    } else if (startDate || endDate) {
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) dateQuery.$lte = new Date(endDate);
    }

    const query = { user: req.user._id };
    if (Object.keys(dateQuery).length > 0) {
      query.date = dateQuery;
    }

    const transactions = await Transaction.find(query);

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      data: {
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense,
        transactionCount: transactions.length
      }
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/analytics/category
// @desc    Get transactions grouped by category
// @access  Private
router.get('/category', async (req, res) => {
  try {
    const { type, period } = req.query;
    
    let dateQuery = {};
    const now = new Date();
    
    if (period) {
      switch(period) {
        case 'daily':
          dateQuery = {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          };
          break;
        case 'weekly':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          dateQuery = { $gte: weekStart };
          break;
        case 'monthly':
          dateQuery = {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
          };
          break;
        case 'yearly':
          dateQuery = {
            $gte: new Date(now.getFullYear(), 0, 1),
            $lt: new Date(now.getFullYear() + 1, 0, 1)
          };
          break;
      }
    }

    const matchStage = { user: req.user._id };
    if (type) matchStage.type = type;
    if (Object.keys(dateQuery).length > 0) matchStage.date = dateQuery;

    const categoryData = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const formatted = categoryData.map(item => ({
      category: item._id.category,
      type: item._id.type,
      total: item.total,
      count: item.count
    }));

    res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('Category analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/analytics/trend
// @desc    Get transaction trends over time
// @access  Private
router.get('/trend', async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    
    let groupBy;
    const now = new Date();
    let matchDate = {};

    switch(period) {
      case 'daily':
        // Last 30 days
        matchDate = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        groupBy = {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' }
        };
        break;
      case 'weekly':
        // Last 12 weeks
        matchDate = { $gte: new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000) };
        groupBy = {
          year: { $year: '$date' },
          week: { $week: '$date' }
        };
        break;
      case 'monthly':
        // Last 12 months
        matchDate = { $gte: new Date(now.getFullYear() - 1, now.getMonth(), 1) };
        groupBy = {
          year: { $year: '$date' },
          month: { $month: '$date' }
        };
        break;
      case 'yearly':
        // Last 5 years
        matchDate = { $gte: new Date(now.getFullYear() - 5, 0, 1) };
        groupBy = {
          year: { $year: '$date' }
        };
        break;
    }

    const trendData = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: matchDate
        }
      },
      {
        $group: {
          _id: { ...groupBy, type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.day': 1 } }
    ]);

    res.json({
      success: true,
      data: trendData
    });
  } catch (error) {
    console.error('Trend analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
