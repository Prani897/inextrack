import React, { useState } from 'react';
import { parseSMS, formatParsedDataForForm } from '../utils/smsParser';
import { useTransaction } from '../context/TransactionContext';
import './SMSImport.css';

const SMSImport = () => {
  const [smsText, setSmsText] = useState('');
  const [parsedTransactions, setParsedTransactions] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { addTransaction } = useTransaction();

  const handleParseSMS = () => {
    if (!smsText.trim()) {
      setMessage('Please paste SMS text');
      return;
    }

    // Split by common SMS separators
    const smsList = smsText
      .split(/\n\n+|---+|===+/)
      .filter(sms => sms.trim().length > 20);

    const parsed = smsList.map((sms, index) => ({
      id: index,
      raw: sms.trim(),
      ...parseSMS(sms.trim())
    })).filter(p => p.amount !== null);

    if (parsed.length === 0) {
      setMessage('No transactions found in the SMS. Please check the format.');
      return;
    }

    setParsedTransactions(parsed);
    setMessage(`Found ${parsed.length} transaction(s)`);
    setSelectedTransactions(new Set(parsed.map(p => p.id)));
  };

  const toggleTransaction = (id) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTransactions(newSelected);
  };

  const handleImport = async () => {
    if (selectedTransactions.size === 0) {
      setMessage('Please select transactions to import');
      return;
    }

    setLoading(true);
    try {
      const toImport = parsedTransactions.filter(t => selectedTransactions.has(t.id));
      let successCount = 0;

      for (const transaction of toImport) {
        const formData = formatParsedDataForForm(transaction);
        await addTransaction({
          ...formData,
          date: new Date(formData.date).toISOString()
        });
        successCount++;
      }

      setMessage(`Successfully imported ${successCount} transaction(s)`);
      setSmsText('');
      setParsedTransactions([]);
      setSelectedTransactions(new Set());
    } catch (error) {
      setMessage(`Error importing transactions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container sms-import-page">
      <div className="sms-header">
        <h1>📱 Import Transactions from SMS</h1>
        <p>Paste your bank/payment SMS below and we'll extract transaction details</p>
      </div>

      <div className="sms-input-section card">
        <h2>Step 1: Paste SMS Text</h2>
        <textarea
          value={smsText}
          onChange={(e) => setSmsText(e.target.value)}
          placeholder="Paste SMS here. You can paste multiple SMS separated by blank lines or dashes.

Example:
Your A/C XXXX2345 debited for ₹500 at Amazon. Bal: ₹10,500. Date: 15/03/2024

---

Your A/C XXXX2345 debited for ₹200 at Zomato. Bal: ₹10,300. Date: 15/03/2024"
          className="sms-textarea"
        />
        <button
          onClick={handleParseSMS}
          className="btn btn-primary"
          style={{ marginTop: '16px' }}
        >
          Parse SMS
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {parsedTransactions.length > 0 && (
        <div className="sms-review-section card">
          <h2>Step 2: Review & Select Transactions</h2>
          <div className="transactions-list">
            {parsedTransactions.map((transaction) => (
              <div key={transaction.id} className="transaction-card">
                <input
                  type="checkbox"
                  checked={selectedTransactions.has(transaction.id)}
                  onChange={() => toggleTransaction(transaction.id)}
                  className="transaction-checkbox"
                />
                <div className="transaction-details">
                  <div className="transaction-main">
                    <span className="transaction-merchant">
                      {transaction.merchant || 'Unknown Merchant'}
                    </span>
                    <span className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount}
                    </span>
                  </div>
                  <div className="transaction-meta">
                    <span className="category-badge">{transaction.category}</span>
                    {transaction.date && (
                      <span className="date-badge">{transaction.date}</span>
                    )}
                  </div>
                  <p className="transaction-raw">{transaction.raw.substring(0, 100)}...</p>
                </div>
              </div>
            ))}
          </div>

          <div className="import-actions">
            <button
              onClick={() => setSelectedTransactions(new Set(parsedTransactions.map(t => t.id)))}
              className="btn btn-secondary"
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedTransactions(new Set())}
              className="btn btn-secondary"
            >
              Deselect All
            </button>
            <button
              onClick={handleImport}
              disabled={loading || selectedTransactions.size === 0}
              className="btn btn-success"
            >
              {loading ? 'Importing...' : `Import ${selectedTransactions.size} Selected`}
            </button>
          </div>
        </div>
      )}

      <div className="sms-tips card">
        <h3>📋 Tips for Best Results:</h3>
        <ul>
          <li>SMS from banks usually work best (Chase, PNC, BOFA, etc.)</li>
          <li>Payment app SMS (Zell, Apple Pay, Google Wallet) also work well</li>
          <li>Separate multiple SMS with blank lines or dashes</li>
          <li>Include the amount and merchant name in the SMS</li>
          <li>Our parser automatically detects categories (Food, Shopping, etc.)</li>
          <li>Review extracted data before importing</li>
        </ul>
      </div>
    </div>
  );
};

export default SMSImport;
