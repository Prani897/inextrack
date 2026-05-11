import React, { useState } from 'react';
import { useTransaction } from '../context/TransactionContext';
import ReceiptUploader from '../components/ReceiptUploader';
import { toast } from 'react-toastify';
import '../pages/Transactions.css';

/**
 * Example: Enhanced Transaction Page with Receipt Parser Integration
 * 
 * This example shows how to integrate the ReceiptUploader component
 * into your existing transaction creation flow.
 */

export const TransactionFormWithReceipt = () => {
  const { addTransaction, fetchTransactions } = useTransaction();
  const [showReceiptUploader, setShowReceiptUploader] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'expense',
    category: 'Food & Dining',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    by: 'Pranali'
  });

  const [errors, setErrors] = useState({});

  // Handle extracted data from receipt uploader
  const handleExtractedData = (extractedData) => {
    setFormData({
      ...formData,
      amount: extractedData.amount || '',
      description: extractedData.description || formData.description,
      category: extractedData.category || 'Food & Dining',
      date: extractedData.date || formData.date
    });
    
    toast.success('💡 Receipt data filled in! Adjust if needed and submit.');
    setShowReceiptUploader(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const success = await addTransaction(formData);
    
    if (success) {
      // Reset form
      setFormData({
        type: 'expense',
        category: 'Food & Dining',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        by: 'Pranali'
      });
      
      // Refetch transactions
      fetchTransactions();
    }
  };

  return (
    <div className="transaction-form-container">
      <div className="form-header">
        <h2>Add Transaction</h2>
        <button
          className="receipt-upload-btn"
          onClick={() => setShowReceiptUploader(true)}
          title="Use receipt image to auto-fill transaction details"
        >
          📸 Parse Receipt
        </button>
      </div>

      <form onSubmit={handleSubmit} className="transaction-form">
        {/* Transaction Type */}
        <div className="form-group">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={`form-control ${errors.category ? 'error' : ''}`}
          >
            <option value="">Select Category</option>
            <option value="Food & Dining">Food & Dining</option>
            <option value="Transportation">Transportation</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Shopping">Shopping</option>
            <option value="Utilities">Utilities</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && <span className="error-text">{errors.category}</span>}
        </div>

        {/* Amount */}
        <div className="form-group">
          <label htmlFor="amount">Amount ($)</label>
          <input
            id="amount"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className={`form-control ${errors.amount ? 'error' : ''}`}
          />
          {errors.amount && <span className="error-text">{errors.amount}</span>}
          {formData.amount && (
            <span className="amount-preview">≈ ${parseFloat(formData.amount).toFixed(2)}</span>
          )}
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description (optional)</label>
          <input
            id="description"
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Add notes about this transaction"
            className="form-control"
          />
        </div>

        {/* Date */}
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className={`form-control ${errors.date ? 'error' : ''}`}
          />
          {errors.date && <span className="error-text">{errors.date}</span>}
        </div>

        {/* Who Made the Transaction */}
        <div className="form-group">
          <label htmlFor="by">By</label>
          <select
            id="by"
            name="by"
            value={formData.by}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="Pranali">Pranali</option>
            <option value="Nikunj">Nikunj</option>
          </select>
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-btn">
          ✓ Add Transaction
        </button>
      </form>

      {/* Receipt Uploader Modal */}
      {showReceiptUploader && (
        <ReceiptUploader
          onExtractedData={handleExtractedData}
          onClose={() => setShowReceiptUploader(false)}
        />
      )}
    </div>
  );
};

export default TransactionFormWithReceipt;

/**
 * INTEGRATION TIPS:
 * 
 * 1. Import this component where you need transaction creation:
 *    import TransactionFormWithReceipt from '../components/TransactionFormWithReceipt';
 * 
 * 2. Use it in your page:
 *    <TransactionFormWithReceipt />
 * 
 * 3. Customize categories to match your needs
 * 
 * 4. The ReceiptUploader button will:
 *    - Open a modal
 *    - Let user select/drag-drop receipt image
 *    - Extract amount, vendor, date
 *    - Pre-fill form fields
 * 
 * 5. User can then edit the pre-filled data and submit
 * 
 * 6. Real-time updates will notify other users instantly!
 */
