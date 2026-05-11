import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import Tesseract from 'tesseract.js';
import '../styles/ReceiptUploader.css';

/**
 * Extract amount, vendor, and date from OCR text
 */
const extractReceiptData = (text) => {
  if (!text || text.trim().length === 0) {
    return { amount: null, vendor: null, date: null };
  }

  const lines = text.split('\n').filter(l => l.trim());
  let amount = null;
  let vendor = null;
  let date = null;

  // Amount patterns
  const amountPatterns = [
    /total\s*[:=\s]*\$?([\d,]+\.?\d*)/i,
    /amount\s*[:=\s]*\$?([\d,]+\.?\d*)/i,
    /\$\s*([\d,]+\.[\d]{2})/,
    /([\d]{1,5}\.\d{2})/
  ];

  // Date patterns
  const datePatterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    /([a-z]+\s+\d{1,2}[,\s]+\d{4})/i
  ];

  // Extract amount
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const cleaned = match[1].replace(/,/g, '');
      const value = parseFloat(cleaned);
      if (!isNaN(value) && value > 0 && value < 10000) {
        amount = parseFloat(value.toFixed(2));
        break;
      }
    }
  }

  // Extract vendor - first meaningful line
  const meaningfulLines = lines.filter(line => {
    if (/^\s*\$/.test(line)) return false;
    if (line.length < 3 || line.length > 60) return false;
    return true;
  });

  if (meaningfulLines.length > 0) {
    vendor = meaningfulLines[0].trim().substring(0, 50);
  }

  // Extract date
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      date = match[1].trim();
      break;
    }
  }

  return {
    amount,
    vendor: vendor || 'Store',
    date
  };
};

export const ReceiptUploader = ({ onExtractedData, onClose }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB');
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDragDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleParseReceipt = async () => {
    if (!file) {
      toast.error('Please select a receipt image');
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      // Use Tesseract.js to extract text from image
      const { data: { text, confidence } } = await Tesseract.recognize(
        file,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing') {
              setProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      // Extract structured data from text
      const data = extractReceiptData(text);
      setExtractedData({
        ...data,
        confidence: Math.round(confidence * 100),
        rawText: text
      });

      if (!data.amount) {
        toast.warning('Could not detect amount. Please check the receipt.');
      } else {
        toast.success('Receipt parsed successfully!');
      }

      // Notify parent component
      if (onExtractedData) {
        onExtractedData({
          amount: data.amount,
          vendor: data.vendor,
          description: data.vendor,
          category: 'Food & Dining',
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('OCR error:', error);
      toast.error('Failed to parse receipt. Try a clearer image.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setExtractedData(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="receipt-uploader-overlay">
      <div className="receipt-uploader">
        <div className="uploader-header">
          <h2>📸 Parse Receipt</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {!extractedData ? (
          <>
            <div
              className="drop-zone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDragDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <div className="preview-container">
                  <img src={preview} alt="Receipt preview" className="preview-image" />
                  <button className="change-image-btn" onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}>
                    Choose Different Image
                  </button>
                </div>
              ) : (
                <>
                  <div className="drop-icon">📷</div>
                  <p className="drop-text">Click to select or drag & drop receipt image</p>
                  <p className="drop-hint">Supported formats: JPEG, PNG, WebP (Max 10MB)</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                hidden
              />
            </div>

            {file && (
              <div className="uploader-actions">
                <div className="progress-section">
                  {loading && (
                    <>
                      <p className="progress-text">Reading receipt... {progress}%</p>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                      </div>
                    </>
                  )}
                </div>
                <button
                  className="parse-btn"
                  onClick={handleParseReceipt}
                  disabled={loading}
                >
                  {loading ? '⏳ Parsing...' : '🔍 Parse Receipt'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="extraction-results">
            <h3>✅ Extracted Data</h3>
            
            <div className="result-item">
              <label>Vendor:</label>
              <p className="result-value">{extractedData.vendor || 'Unknown'}</p>
            </div>

            <div className="result-item">
              <label>Amount:</label>
              <p className="result-value">
                {extractedData.amount ? `$${extractedData.amount.toFixed(2)}` : 'Not detected'}
              </p>
            </div>

            {extractedData.date && (
              <div className="result-item">
                <label>Date:</label>
                <p className="result-value">{extractedData.date}</p>
              </div>
            )}

            {extractedData.confidence > 0 && (
              <div className="result-item">
                <label>Confidence:</label>
                <p className="result-value">{extractedData.confidence}%</p>
              </div>
            )}

            <details className="raw-text-details">
              <summary>📄 View Raw Text</summary>
              <pre className="raw-text">{extractedData.rawText}</pre>
            </details>

            <div className="extraction-hint">
              💡 You can adjust these values before adding the transaction
            </div>

            <div className="result-actions">
              <button className="confirm-btn" onClick={() => onClose()}>
                ✓ Use Extracted Data
              </button>
              <button className="reset-btn" onClick={handleReset}>
                ↻ Parse Another Receipt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptUploader;
