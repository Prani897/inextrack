import React, { useEffect, useState } from 'react';
import { useTransaction } from '../context/TransactionContext';
import { formatInTimeZone } from 'date-fns-tz';
import { format } from 'date-fns';
import './Transactions.css';

const Transactions = () => {
  const { 
    transactions, 
    fetchTransactions, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction, 
    loading 
  } = useTransaction();

  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filter, setFilter] = useState({ type: 'all', category: '' });
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    by: 'Pranali',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const commonCategories = {
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
    expense: ['Rent', 'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other']
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      amount: parseFloat(formData.amount)
    };

    let success;
    if (editingTransaction) {
      success = await updateTransaction(editingTransaction._id, data);
    } else {
      success = await addTransaction(data);
    }

    if (success) {
      resetForm();
      setShowModal(false);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      category: transaction.category,
      by: transaction.by,
      amount: transaction.amount.toString(),
      description: transaction.description || '',
      date: format(new Date(transaction.date), 'yyyy-MM-dd')
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      category: '',
      by: 'Pranali',
      amount: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setEditingTransaction(null);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter.type !== 'all' && t.type !== filter.type) return false;
    if (filter.category && t.category !== filter.category) return false;
    return true;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="container transactions-page">
      <div className="page-header">
        <h1>Transactions</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Add Transaction
        </button>
      </div>

      <div className="card filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Type:</label>
            <select 
              value={filter.type} 
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="form-control"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Category:</label>
            <input
              type="text"
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              placeholder="Filter by category"
              className="form-control"
            />
          </div>
        </div>
      </div>

      <div className="card transactions-table-card">
        {loading ? (
          <div className="loading">Loading transactions...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="no-data">No transactions found</div>
        ) : (
          <div className="transactions-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>By</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{format(new Date(transaction.date), 'MMM dd, yyyy')}</td>
                    <td>
                      <span className={`type-badge ${transaction.type}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td>{transaction.category}</td>
                    <td>{transaction.by}</td>
                    <td className="description">{transaction.description || '-'}</td>
                    <td className={`amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon edit"
                          onClick={() => handleEdit(transaction)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-icon delete"
                          onClick={() => handleDelete(transaction._id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="transaction-form">
              <div className="form-group">
                <label>Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="">Select Category</option>
                  {commonCategories[formData.type].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>By</label>
                <select
                  name="by"
                  value={formData.by}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="Pranali">Pranali</option>
                  <option value="Nikunj">Nikunj</option>
                </select>
              </div>

              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                  placeholder="Add a note..."
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTransaction ? 'Update' : 'Add'} Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
