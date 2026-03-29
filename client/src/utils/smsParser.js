// SMS Transaction Parser
// Extracts transaction details from bank/payment SMS

export const parseSMS = (smsText) => {
  const result = {
    amount: null,
    merchant: null,
    date: null,
    category: null,
    type: null,
    description: null,
    raw: smsText
  };

  if (!smsText) return result;

  // Convert to lowercase for easier matching
  const text = smsText.toLowerCase();
  
  // Detect transaction type (credit/debit)
  if (text.includes('credited') || text.includes('received') || text.includes('sent you') || text.includes('deposited') || text.includes('inward')) {
    result.type = 'income';
  } else if (text.includes('debited') || text.includes('spent') || text.includes('withdrawn') || text.includes('charged') || text.includes('deducted')) {
    result.type = 'expense';
  } else {
    result.type = 'expense'; // default
  }

  // Extract amount (looks for currency symbols or amount patterns)
  const amountPatterns = [
    /[₹$€£]\s*(\d+[,.\d]*)/gi,
    /rs\.?\s*(\d+[,.\d]*)/gi,
    /amount[:\s]+[₹$€£]?\s*(\d+[,.\d]*)/gi,
    /of\s*[₹$€£]?\s*(\d+[,.\d]*)/gi,
    /(\d+[,.\d]*)\s*(?:rupees|usd|eur|gbp)/gi,
  ];

  for (let pattern of amountPatterns) {
    const match = smsText.match(pattern);
    if (match) {
      // Clean up the matched amount
      const amount = match[0]
        .replace(/[₹$€£]/g, '')
        .replace(/rs\.?/gi, '')
        .replace(/[a-z\s]/gi, '')
        .replace(/,/g, '');
      
      if (amount && parseFloat(amount) > 0) {
        result.amount = parseFloat(amount);
        break;
      }
    }
  }

  // Extract merchant/description
  const merchantPatterns = [
    /at\s+([a-zA-Z\s&'-]+?)(?:\.|,|on|$)/i,
    /(?:merchant|store|shop)[:\s]+([a-zA-Z\s&'-]+?)(?:\.|,|$)/i,
    /(?:to|from)\s+([a-zA-Z\s&'-]+?)(?:\.|,|for|$)/i,
    /(?:transaction at|purchase at)\s+([a-zA-Z\s&'-]+?)(?:\.|,|$)/i,
  ];

  for (let pattern of merchantPatterns) {
    const match = smsText.match(pattern);
    if (match && match[1]) {
      result.merchant = match[1].trim();
      break;
    }
  }

  // If no merchant found, try to extract any capitalized words
  if (!result.merchant) {
    const words = smsText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
    if (words && words.length > 0) {
      // Filter out common words
      const filtered = words.filter(w => !['Your', 'A/C', 'SMS', 'Transaction'].includes(w));
      if (filtered.length > 0) {
        result.merchant = filtered[0];
      }
    }
  }

  // Extract date
  const datePatterns = [
    /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/,
    /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{2,4})/i,
    /on\s+(\d{1,2}[/-]\d{1,2})/,
  ];

  for (let pattern of datePatterns) {
    const match = smsText.match(pattern);
    if (match) {
      result.date = match[1];
      break;
    }
  }

  // Categorize transaction
  result.category = categorizeTransaction(smsText, result.merchant);

  // Create description
  result.description = `${result.type === 'income' ? 'Received from' : 'Payment to'} ${result.merchant || 'Transaction'}`;

  return result;
};

// Categorize based on keywords
const categorizeTransaction = (text, merchant) => {
  const lowerText = (text + ' ' + (merchant || '')).toLowerCase();

  const categories = {
    'Food & Dining': ['restaurant', 'cafe', 'pizza', 'burger', 'food', 'swiggy', 'zomato', 'uber eats', 'mcdonalds', 'kfc', 'dominos', 'subway', 'starbucks', 'coffee', 'dining', 'meal'],
    'Shopping': ['amazon', 'flipkart', 'mall', 'store', 'shop', 'retail', 'clothing', 'fashion', 'shoes', 'apparel', 'garments', 'shopping'],
    'Transportation': ['uber', 'ola', 'taxi', 'gas', 'petrol', 'fuel', 'parking', 'bus', 'train', 'flight', 'railway', 'metro'],
    'Entertainment': ['movie', 'cinema', 'netflix', 'amazon prime', 'spotify', 'gaming', 'entertainment', 'ticket', 'shows', 'concert'],
    'Utilities': ['electricity', 'water', 'gas', 'internet', 'mobile', 'phone', 'bill', 'recharge', 'utility', 'airtel', 'jio', 'vodafone', 'bsnl'],
    'Healthcare': ['pharmacy', 'hospital', 'clinic', 'doctor', 'medicine', 'health', 'medical', 'health'],
    'Education': ['school', 'college', 'university', 'course', 'training', 'tuition', 'education', 'exam', 'book'],
    'Investment': ['transfer', 'investment', 'mutual', 'stock', 'broker', 'bank', 'deposit'],
    'Income': ['salary', 'refund', 'credit', 'income', 'received', 'transferred to'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return category;
    }
  }

  return 'Other';
};

// Parse multiple SMS at once
export const parseMultipleSMS = (smsTextArray) => {
  return smsTextArray.map(sms => parseSMS(sms)).filter(result => result.amount !== null);
};

// Format parsed data for transaction entry
export const formatParsedDataForForm = (parsedData) => {
  return {
    amount: parsedData.amount || '',
    category: parsedData.category || 'Other',
    type: parsedData.type || 'expense',
    description: parsedData.description || parsedData.merchant || '',
    date: parsedData.date || new Date().toISOString().split('T')[0],
  };
};
