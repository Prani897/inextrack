import React, { createContext, useState, useContext, useCallback } from 'react';
import { transactionAPI, analyticsAPI } from '../api/api';
import { toast } from 'react-toastify';

const TransactionContext = createContext();

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const fetchTransactions = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const response = await transactionAPI.getAll(filters);
      setTransactions(response.data.data);
    } catch (error) {
      console.error('Fetch transactions error:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async (period = null) => {
    try {
      const params = period ? { period } : {};
      const response = await analyticsAPI.getSummary(params);
      setSummary(response.data.data);
    } catch (error) {
      console.error('Fetch summary error:', error);
    }
  }, []);

  const addTransaction = async (data) => {
    try {
      const response = await transactionAPI.create(data);
      setTransactions([response.data.data, ...transactions]);
      toast.success('Transaction added successfully');
      fetchSummary();
      return true;
    } catch (error) {
      console.error('Add transaction error:', error);
      toast.error('Failed to add transaction');
      return false;
    }
  };

  const updateTransaction = async (id, data) => {
    try {
      const response = await transactionAPI.update(id, data);
      setTransactions(
        transactions.map((t) => (t._id === id ? response.data.data : t))
      );
      toast.success('Transaction updated successfully');
      fetchSummary();
      return true;
    } catch (error) {
      console.error('Update transaction error:', error);
      toast.error('Failed to update transaction');
      return false;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await transactionAPI.delete(id);
      setTransactions(transactions.filter((t) => t._id !== id));
      toast.success('Transaction deleted successfully');
      fetchSummary();
      return true;
    } catch (error) {
      console.error('Delete transaction error:', error);
      toast.error('Failed to delete transaction');
      return false;
    }
  };

  const value = {
    transactions,
    loading,
    summary,
    fetchTransactions,
    fetchSummary,
    addTransaction,
    updateTransaction,
    deleteTransaction
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};
