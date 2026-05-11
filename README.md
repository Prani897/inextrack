# 💰 Inextrack - Expense Tracking Application

A modern full-stack expense tracking web application built with **React 18** and **Node.js/Express**, featuring AI-powered receipt parsing using **Tesseract.js OCR** for automatic expense extraction.

**Live Features:**
- 📱 Responsive expense tracking dashboard
- 💼 Complete transaction management (CRUD operations)
- 📊 Interactive analytics with Recharts
- 📸 AI-powered receipt parser with OCR
- 📱 SMS transaction import
- 🔐 Secure JWT authentication with bcrypt encryption
- ☁️ Cloud-based MongoDB storage

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [Usage Guide](#usage-guide)
- [Key Technologies Explained](#key-technologies-explained)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### Core Functionality
- **User Authentication** - Secure login/register with JWT tokens and password encryption
- **Transaction Management** - Add, edit, delete income and expense transactions with categories
- **Analytics Dashboard** - Beautiful charts and financial summaries using Recharts
- **Smart Receipt Parser** - Upload receipt images → AI extracts vendor, amount, and date automatically
- **SMS Import** - Parse expense data from SMS messages
- **Category Organization** - Organize transactions by spending categories (Food, Travel, etc.)
- **Data Persistence** - All transactions securely stored in MongoDB Atlas

### Technical Highlights
- 🔐 **bcryptjs** - Industry-standard password hashing
- 🎫 **JWT Authentication** - Stateless, secure session management
- 🤖 **Tesseract.js** - Client-side OCR for receipt image processing
- 📊 **Recharts** - Interactive data visualization library
- 🎯 **React Context API** - Global state management without Redux
- 🔄 **RESTful API** - Clean, scalable API architecture
- 🌐 **CORS Enabled** - Secure cross-origin requests

---

## 🛠 Tech Stack

### Frontend Stack
```
React 18              - Modern UI framework with hooks
Vite 5.4              - Lightning-fast build tool
Axios 1.6             - HTTP client for API calls
React Router v6       - Client-side routing & navigation
Recharts 2.10         - Data visualization & charts
Tesseract.js 5.0      - AI/ML for receipt text extraction
React Toastify 9.1    - Toast notifications
Date-fns 3.0          - Date formatting & manipulation
```

### Backend Stack
```
Node.js v22           - JavaScript runtime
Express 4             - Web framework for REST API
MongoDB Atlas         - Cloud NoSQL database
Mongoose              - MongoDB object modeling (ODM)
bcryptjs 2.4          - Password encryption & hashing
jsonwebtoken 9        - JWT token generation & verification
Multer 1.4            - File upload handling
Sharp 0.33            - Image processing for receipts
Express Validator     - Input validation & sanitization
Dotenv                - Environment variable management
```

---

## 📁 Project Structure

```
Inextrack/
│
├── server/                          # BACKEND - Express REST API
│   ├── server.js                    # Main server entry point
│   ├── package.json                 # Dependencies & scripts
│   ├── .env                         # Environment: PORT, MONGODB_URI, JWT_SECRET
│   │
│   ├── models/                      # Mongoose Schemas
│   │   ├── User.js                  # User model (name, email, hashed password)
│   │   └── Transaction.js           # Transaction model (type, amount, category, date)
│   │
│   ├── routes/                      # API Endpoints
│   │   ├── auth.js                  # POST /register, /login | GET /me
│   │   ├── transactions.js          # GET/POST/PUT/DELETE transactions
│   │   ├── analytics.js             # GET /summary (financial insights)
│   │   └── receipts.js              # POST /parse (upload & extract receipt)
│   │
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware
│   │
│   └── utils/
│       └── ocrService.js            # Receipt OCR processing with Tesseract.js
│
├── client/                          # FRONTEND - React SPA
│   ├── package.json                 # Dependencies & scripts
│   ├── vite.config.js               # Vite bundler config
│   ├── index.html                   # HTML entry point
│   │
│   └── src/
│       ├── main.jsx                 # React app initialization
│       ├── App.jsx                  # Main app component with routing
│       ├── index.css                # Global styles & variables
│       │
│       ├── pages/                   # Full page components
│       │   ├── Login.jsx            # Login form page
│       │   ├── Register.jsx         # User registration page
│       │   ├── Dashboard.jsx        # Home page with financial summary
│       │   ├── Transactions.jsx     # Transaction list + add modal
│       │   ├── Analytics.jsx        # Charts & spending analysis
│       │   ├── SMSImport.jsx        # SMS transaction parser
│       │   └── *.css                # Page-specific styling
│       │
│       ├── components/              # Reusable UI components
│       │   ├── Navbar.jsx           # Top navigation bar
│       │   ├── PrivateRoute.jsx     # Route protection (auth required)
│       │   ├── ReceiptUploader.jsx  # Receipt upload & OCR component
│       │   └── *.css                # Component styling
│       │
│       ├── context/                 # Global State Management
│       │   ├── AuthContext.jsx      # Auth state: user, token, login/logout
│       │   └── TransactionContext.jsx # Transactions: list, add, update, delete
│       │
│       ├── api/                     # API Communication
│       │   └── api.js               # Axios instance + all API methods
│       │
│       ├── services/
│       │   └── socketService.js     # (Removed - WebSocket feature removed)
│       │
│       ├── utils/                   # Utility Functions
│       │   └── smsParser.js         # Parse SMS for transaction data
│       │
│       └── styles/
│           └── *.css                # Shared component styles
│
├── README.md                        # Project documentation (this file)
├── MONGODB_SETUP.md                 # MongoDB Atlas setup guide
├── package.json                     # Root workspace config
└── .gitignore                       # Git ignore rules
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** v14+ ([Download](https://nodejs.org))
- **npm** v6+ (comes with Node.js)
- **MongoDB Atlas Account** (Free: [Sign up](https://www.mongodb.com/cloud/atlas))

### Step 1: Clone or Download Project

```bash
cd Inextrack
```

### Step 2: Backend Setup

```bash
cd server

# Install all dependencies
npm install

# Create .env file
# Copy this content and fill in your details:
PORT=3000
MONGODB_URI=mongodb+srv://inextrack_user:inextrack$1234@cluster0.d6d9gsi.mongodb.net/?appName=Cluster0
JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

**⚠️ IMPORTANT - MongoDB IP Whitelist:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Login → Select Cluster0
3. **Security** → **Network Access**
4. Click **"+ Add IP Address"**
5. Select **"Allow Access from Anywhere"** (for development)
6. Click **Confirm** → Wait 1-2 minutes

### Step 3: Frontend Setup

```bash
cd ../client

# Install dependencies
npm install
```

---

## ▶️ Running the Project

### Terminal 1 - Start Backend Server

```bash
cd server
npm start
```

Expected output:
```
✅ Server running on http://localhost:3000
✅ MongoDB connected successfully
```

⚠️ **If MongoDB error:** Make sure you've whitelisted your IP in MongoDB Atlas Network Access

### Terminal 2 - Start Frontend Client

```bash
cd client
npm run dev
```

Expected output:
```
VITE v5.4.21  ready in 1029 ms
➜  Local:   http://localhost:5173
➜  Network: use --host to expose
```

### Access the Application

**Open browser:** http://localhost:5173

---

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)
```
POST   /register              Register new user
POST   /login                 User login (returns JWT token)
GET    /me                    Get current user (protected)
```

### Transaction Routes (`/api/transactions`)
```
GET    /                      Get all user transactions
GET    /:id                   Get single transaction
POST   /                      Create new transaction
PUT    /:id                   Update transaction
DELETE /:id                   Delete transaction
```

### Analytics Routes (`/api/analytics`)
```
GET    /summary              Get financial summary & insights
```

### Receipt Routes (`/api/receipts`)
```
POST   /parse                Upload receipt image & parse
```

---

## 📖 Usage Guide

### 1️⃣ Create Your Account

1. Click **"Register"** button on login page
2. Enter:
   - Full name
   - Email address
   - Password (6+ characters)
3. Click **"Create Account"**
4. You're automatically logged in!

### 2️⃣ Add a Transaction Manually

1. Go to **Transactions** page
2. Click **"Add Transaction"** button
3. Fill in details:
   - **Type**: Income or Expense
   - **Category**: Select from dropdown (Food, Travel, Utilities, etc.)
   - **Amount**: Enter amount in $
   - **Description**: Optional notes
   - **Date**: Transaction date
4. Click **"Add Transaction"**
5. ✅ Transaction appears in list immediately!

### 3️⃣ Parse Receipt with AI 📸

1. Click **"Add Transaction"**
2. Click **"📸 Parse Receipt"** button in modal header
3. **Upload receipt image**:
   - Click to select file
   - Or drag & drop image
4. **AI processes image** (shows progress bar):
   - Tesseract.js reads text from image
   - Regex patterns extract: vendor, amount, date
5. **Review extracted data**:
   - Vendor name (e.g., "Starbucks")
   - Amount (e.g., "$5.25")
   - Date (e.g., "05/11/2026")
   - Confidence score
6. **Click "Use Extracted Data"**
7. Form auto-fills with extracted values
8. Adjust if needed, then click **"Add Transaction"**

### 4️⃣ View Analytics Dashboard 📊

1. Go to **Analytics** page
2. See interactive charts:
   - **Income vs Expenses** - Pie/bar chart
   - **Spending by Category** - Breakdown chart
   - **Monthly Trends** - Line graph
   - **Total Summary** - All-time totals
3. Charts update automatically as you add transactions

### 5️⃣ Import from SMS 📱

1. Go to **SMS Import** page
2. Paste SMS messages containing expenses:
   ```
   "Paid $50 for gas at Shell"
   "Restaurant bill $75"
   ```
3. App extracts transaction data automatically
4. Review suggested transactions
5. Click **"Import"** to save to database

---

## 🔑 Key Technologies Explained

### React 18 + Vite
- **React**: Modern UI library with hooks for state management
- **Vite**: Ultra-fast build tool (10x faster than Webpack)
- **Component-based**: Navbar, PrivateRoute, ReceiptUploader are reusable components

### Express REST API
- **Routes**: Different endpoints for auth, transactions, analytics, receipts
- **Middleware**: JWT verification, CORS, request parsing
- **Database**: MongoDB through Mongoose ODM

### Tesseract.js (OCR)
```javascript
// How receipt parsing works:
1. User uploads image
2. Tesseract.js reads text from image (on client-side)
3. Regex patterns extract: amount, vendor, date
4. Form auto-fills with extracted data
5. User confirms or adjusts values
```

### React Context API
```javascript
// Global state management without Redux:
- AuthContext: Manages user login state & JWT token
- TransactionContext: Manages transactions list & CRUD operations
```

### MongoDB + Mongoose
```javascript
// Data Structure:
- Users collection: Stores user accounts with encrypted passwords
- Transactions collection: Stores all expense/income records
```

---

## 🔐 Security Features

| Feature | Implementation |
|---------|-----------------|
| **Password Encryption** | bcryptjs (10-round salt) |
| **Session Management** | JWT tokens (7-day expiry) |
| **Route Protection** | PrivateRoute component checks JWT |
| **CORS** | Configured to allow localhost:5173 |
| **Environment Variables** | Sensitive data in .env (not in git) |
| **Input Validation** | Express-validator on all routes |

---

## 🐛 Troubleshooting

### ❌ MongoDB Connection Error
```
Error: Could not connect to any servers in your MongoDB Atlas cluster
```
**Solution:**
1. Go to MongoDB Atlas Dashboard
2. Select Cluster0 → Security → Network Access
3. Add IP address → Allow Access from Anywhere
4. Restart server

### ❌ Port Already in Use
```
Error: EADDRINUSE: address already in use :::3000
```
**Solution:**
```bash
# Find process using port 3000
netstat -ano | grep 3000

# Kill the process
taskkill /PID <PID_NUMBER> /F
```

### ❌ Dependencies Missing
```
Error: Cannot find module 'express'
```
**Solution:**
```bash
cd server
npm install
```

### ❌ CORS Error
```
Error: Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Ensure frontend is on `http://localhost:5173`
- Ensure server is on `http://localhost:3000`
- Check CORS is enabled in server.js

### ❌ OCR Not Working
**Solution:**
- Ensure Tesseract.js is installed: `npm install tesseract.js`
- Use clear, good-quality receipt images
- Check browser console (F12) for errors

---

## 📊 Project Statistics

- **Frontend Files**: ~15 components & pages
- **Backend Routes**: 4 main route groups
- **Database Models**: 2 schemas (User, Transaction)
- **API Endpoints**: 10+ endpoints
- **Lines of Code**: ~3000+ lines

---

## 🎓 Learning Outcomes

By exploring this project, you'll learn:
- ✅ Full-stack web development (frontend + backend)
- ✅ React hooks & Context API for state management
- ✅ RESTful API design with Express
- ✅ Database design with MongoDB & Mongoose
- ✅ User authentication with JWT & bcrypt
- ✅ File uploads with Multer
- ✅ AI/ML integration (Tesseract.js OCR)
- ✅ Data visualization with Recharts

---

## 📚 Resources

- [React 18 Docs](https://react.dev)
- [Express Documentation](https://expressjs.com)
- [MongoDB Guide](https://docs.mongodb.com)
- [Tesseract.js](https://github.com/naptha/tesseract.js)
- [Recharts](https://recharts.org)
- [JWT.io](https://jwt.io)

---

## 🤝 Support & Debugging

**Quick Debugging Checklist:**
1. ✅ Is server running on port 3000?
2. ✅ Is client running on port 5173?
3. ✅ Is MongoDB connected? (Check server logs)
4. ✅ Check browser console (F12) for errors
5. ✅ Check server terminal for API errors

**To see detailed errors:**
- **Browser**: Press F12 → Console tab
- **Server**: Look at terminal output

---

## 📝 Notes for Class Presentation

**Key Points to Explain:**
1. This is a **full-stack application** (frontend + backend + database)
2. Uses **modern React** (18) with functional components and hooks
3. **OCR technology** (Tesseract.js) for smart receipt parsing
4. **Secure authentication** with JWT tokens and password encryption
5. **Cloud database** (MongoDB Atlas) for data persistence
6. **Responsive design** that works on mobile and desktop

---

**Ready to track expenses like a pro! 💰✨**
