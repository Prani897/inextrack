import React, { useEffect, useState } from 'react';
import { useTransaction } from '../context/TransactionContext';
import { format } from 'date-fns';
import './Dashboard.css';

const Dashboard = () => {
  const { transactions, fetchTransactions, fetchSummary, summary, loading } = useTransaction();
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    fetchTransactions();
    fetchSummary(period);
  }, [fetchTransactions, fetchSummary, period]);

  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading && !summary) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="container dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)}
          className="period-select"
        >
          <option value="daily">Today</option>
          <option value="weekly">This Week</option>
          <option value="monthly">This Month</option>
          <option value="yearly">This Year</option>
        </select>
      </div>

      {summary && (
        <div className="summary-cards grid grid-cols-4">
          <div className="summary-card income-card">
            <div className="card-icon">📈</div>
            <div className="card-content">
              <h3>Total Income</h3>
              <p className="amount">{formatCurrency(summary.totalIncome)}</p>
            </div>
          </div>

          <div className="summary-card expense-card">
            <div className="card-icon">📉</div>
            <div className="card-content">
              <h3>Total Expense</h3>
              <p className="amount">{formatCurrency(summary.totalExpense)}</p>
            </div>
          </div>

          <div className="summary-card balance-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>Balance</h3>
              <p className="amount">{formatCurrency(summary.balance)}</p>
            </div>
          </div>

          <div className="summary-card transactions-card">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3>Transactions</h3>
              <p className="amount">{summary.transactionCount}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card recent-transactions">
        <div className="card-header flex-between">
          <h2>Recent Transactions</h2>
          <a href="/transactions" className="view-all-link">View All →</a>
        </div>

        {recentTransactions.length === 0 ? (
          <p className="no-data">No transactions yet. Start by adding one!</p>
        ) : (
          <div className="transaction-list">
            {recentTransactions.map((transaction) => (
              <div key={transaction._id} className="transaction-item">
                <div className="transaction-info">
                  <div className={`transaction-type-badge ${transaction.type}`}>
                    {transaction.type === 'income' ? '↑' : '↓'}
                  </div>
                  <div>
                    <p className="transaction-category">{transaction.category}</p>
                    <p className="transaction-date">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className={`transaction-amount ${transaction.type}`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
