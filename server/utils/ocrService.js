/**
 * Receipt OCR Service
 * Extracts amount and vendor information from receipt images
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Simple regex patterns to extract information from OCR text
const extractReceiptData = (text) => {
  if (!text || text.trim().length === 0) {
    return { amount: null, vendor: null, date: null };
  }

  const lines = text.toLowerCase().split('\n').filter(l => l.trim());
  
  let amount = null;
  let vendor = null;
  let date = null;

  // More aggressive amount patterns
  const amountPatterns = [
    /total\s*[:=\s]*\$?([\d,]+\.?\d*)/i,
    /amount\s*[:=\s]*\$?([\d,]+\.?\d*)/i,
    /\$\s*([\d,]+\.[\d]{2})\s*(?:cash|paid|total|subtotal)/i,
    /\$\s*([\d,]+\.[\d]{2})/,
    /([\d]{1,5}\.[\d]{2})\s*(?:cash|paid)/i,
    /([\d]{1,5}\.\d{2})/
  ];

  // Vendor patterns - look for business names
  const vendorPatterns = [
    /^([a-z\s&'-]{4,50})$/m,
    /(?:restaurant|cafe|store|shop|market|pizza|burger)[\s:]?([a-z\s&'-]+)/i,
    /^([a-z]{4,30}\s+[a-z]{3,30})$/im
  ];

  // Date patterns
  const datePatterns = [
    /(?:date|ordered|served)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    /([a-z]+\s+\d{1,2}[,\s]+\d{4})/i
  ];

  // Extract amount - try each pattern
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

  // Extract vendor - try to find business/restaurant name
  const meaningfulLines = lines
    .filter(line => {
      // Filter out lines that look like items or numbers
      if (/^\s*\$/.test(line)) return false;
      if (/^(\d+\s*x|qty|quantity)/.test(line)) return false;
      if (line.length < 3 || line.length > 60) return false;
      return true;
    });

  // Usually the vendor is one of the first meaningful lines
  if (meaningfulLines.length > 0) {
    vendor = meaningfulLines[0]
      .trim()
      .replace(/[^a-z0-9\s&'-]/gi, '')
      .trim()
      .substring(0, 50);
    
    if (!vendor || vendor.length < 2) {
      vendor = null;
    }
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
    vendor: vendor || 'Unknown Store',
    date,
    rawText: text
  };
};

/**
 * Process receipt image with OCR
 * For now, returns extracted text structure
 */
const processReceipt = async (imagePath) => {
  try {
    // Validate file exists
    await fs.access(imagePath);

    // Get file info
    const fileStats = await fs.stat(imagePath);
    if (fileStats.size > 10 * 1024 * 1024) {
      throw new Error('Image file too large (max 10MB)');
    }

    // Validate image format
    const metadata = await sharp(imagePath).metadata();
    if (!metadata.format || !['jpeg', 'png', 'jpg', 'webp'].includes(metadata.format)) {
      throw new Error('Invalid image format. Supported: JPEG, PNG, WebP');
    }

    // Optimize image for OCR (resize, enhance contrast)
    const optimizedPath = path.join(path.dirname(imagePath), `optimized_${path.basename(imagePath)}`);
    await sharp(imagePath)
      .resize(2048, 2048, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .normalise()
      .toFile(optimizedPath);

    // Return structure for client-side OCR processing
    // The client will handle actual OCR with Tesseract.js
    const ocrResult = {
      success: true,
      message: 'Image optimized. Ready for OCR processing on client.',
      imagePath: optimizedPath,
      extractedData: {
        amount: null,
        vendor: null,
        date: null
      }
    };

    // Clean up optimized image
    await fs.unlink(optimizedPath).catch(() => {});

    return ocrResult;
  } catch (error) {
    console.error('Receipt OCR error:', error);
    throw new Error(`Failed to process receipt: ${error.message}`);
  }
};

/**
 * Extract structured data from OCR text
 */
const extractStructuredData = (ocrText) => {
  return extractReceiptData(ocrText);
};

module.exports = {
  processReceipt,
  extractStructuredData,
  extractReceiptData
};
