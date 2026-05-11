const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { protect } = require('../middleware/auth');
const { processReceipt, extractStructuredData } = require('../utils/ocrService');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/receipts');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `receipt-${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// All routes are protected
router.use(protect);

/**
 * @route   POST /api/receipts/parse
 * @desc    Parse receipt image and extract transaction data
 * @access  Private
 */
router.post('/parse', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const filePath = req.file.path;

    // Process receipt with OCR
    const ocrResult = await processReceipt(filePath);

    // Extract structured data if OCR was successful
    let extractedData = ocrResult.extractedData;
    
    if (ocrResult.text) {
      extractedData = extractStructuredData(ocrResult.text);
    }

    // Clean up uploaded file after processing
    await fs.unlink(filePath).catch(() => {});

    res.json({
      success: true,
      data: {
        amount: extractedData.amount,
        vendor: extractedData.vendor,
        date: extractedData.date,
        confidence: ocrResult.confidence || 0,
        rawText: ocrResult.text || ''
      },
      message: 'Receipt parsed successfully'
    });
  } catch (error) {
    console.error('Receipt parse error:', error);
    
    // Clean up file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to parse receipt'
    });
  }
});

/**
 * @route   POST /api/receipts/parse-with-ocr
 * @desc    Parse receipt with advanced OCR (when Tesseract.js is integrated)
 * @access  Private
 * 
 * This endpoint will be enhanced when Tesseract.js is integrated
 */
router.post('/parse-with-ocr', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const filePath = req.file.path;

    // TODO: Integrate Tesseract.js or cloud OCR service here
    // For now, return a response indicating OCR is not yet implemented
    
    // Example of what this would look like:
    // const { createWorker } = require('tesseract.js');
    // const worker = await createWorker();
    // const { data: { text, confidence } } = await worker.recognize(filePath);
    // await worker.terminate();

    const mockOcrText = `
      GROCERY STORE
      123 Main St
      
      Date: 01/15/2024
      
      Items:
      Milk          $4.99
      Bread         $2.49
      Eggs          $3.99
      
      Subtotal:     $11.47
      Tax:          $0.91
      Total:        $12.38
    `;

    const extractedData = extractStructuredData(mockOcrText);

    // Clean up file
    await fs.unlink(filePath).catch(() => {});

    res.json({
      success: true,
      data: {
        amount: extractedData.amount,
        vendor: extractedData.vendor,
        date: extractedData.date,
        confidence: 0.85,
        rawText: mockOcrText,
        note: 'Advanced OCR feature coming soon - currently returns mock data'
      },
      message: 'Receipt parsed (mock OCR)'
    });
  } catch (error) {
    console.error('Receipt OCR parse error:', error);
    
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to parse receipt with OCR'
    });
  }
});

module.exports = router;
