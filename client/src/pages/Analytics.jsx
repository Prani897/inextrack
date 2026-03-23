import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../api/api';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import './Analytics.css';

const Analytics = () => {
  const [period, setPeriod] = useState('monthly');
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#B6AE9F', '#C5C7BC', '#4caf50', '#f44336', '#ff9800', '#2196f3', '#9c27b0', '#e91e63'];

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [summaryRes, categoryRes, trendRes] = await Promise.all([
        analyticsAPI.getSummary({ period }),
        analyticsAPI.getByCategory({ period }),
        analyticsAPI.getTrend({ period })
      ]);

      setSummary(summaryRes.data.data);
      setCategoryData(categoryRes.data.data);
      setTrendData(formatTrendData(trendRes.data.data, period));
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTrendData = (data, period) => {
    const grouped = {};

    data.forEach(item => {
      let key;
      if (period === 'daily') {
        key = `${item._id.month}/${item._id.day}`;
      } else if (period === 'weekly') {
        key = `Week ${item._id.week}`;
      } else if (period === 'monthly') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        key = months[item._id.month - 1];
      } else {
        key = item._id.year.toString();
      }

      if (!grouped[key]) {
        grouped[key] = { name: key, income: 0, expense: 0 };
      }

      if (item._id.type === 'income') {
        grouped[key].income = item.total;
      } else {
        grouped[key].expense = item.total;
      }
    });

    return Object.values(grouped);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const expenseData = categoryData.filter(item => item.type === 'expense');
  const incomeData = categoryData.filter(item => item.type === 'income');

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="container analytics-page">
      <div className="page-header">
        <h1>Analytics</h1>
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)}
          className="period-select"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {summary && (
        <div className="summary-section grid grid-cols-3 mb-3">
          <div className="stat-card income">
            <h3>Total Income</h3>
            <p className="stat-value">{formatCurrency(summary.totalIncome)}</p>
          </div>
          <div className="stat-card expense">
            <h3>Total Expense</h3>
            <p className="stat-value">{formatCurrency(summary.totalExpense)}</p>
          </div>
          <div className="stat-card balance">
            <h3>Net Balance</h3>
            <p className="stat-value">{formatCurrency(summary.balance)}</p>
          </div>
        </div>
      )}

      <div className="card chart-card mb-3">
        <h2>Income vs Expense Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#4caf50" strokeWidth={2} />
            <Line type="monotone" dataKey="expense" stroke="#f44336" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 mb-3">
        <div className="card chart-card">
          <h2>Expense by Category</h2>
          {expenseData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => entry.category}
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="category-list">
                {expenseData.map((item, index) => (
                  <div key={item.category} className="category-item">
                    <div className="category-info">
                      <span 
                        className="category-color" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{item.category}</span>
                    </div>
                    <span className="category-amount">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-data">No expense data</div>
          )}
        </div>

        <div className="card chart-card">
          <h2>Income by Category</h2>
          {incomeData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={incomeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="total" fill="#4caf50" />
                </BarChart>
              </ResponsiveContainer>
              <div className="category-list">
                {incomeData.map((item) => (
                  <div key={item.category} className="category-item">
                    <div className="category-info">
                      <span className="category-color" style={{ backgroundColor: '#4caf50' }} />
                      <span>{item.category}</span>
                    </div>
                    <span className="category-amount">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-data">No income data</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
