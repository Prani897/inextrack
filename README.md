# InexTrack - Income & Expense Tracker

A full-stack web application for tracking personal income and expenses with analytics and secure user authentication.

## Features

- 🔐 **Secure Authentication**: JWT-based login and registration system
- 💰 **Transaction Management**: Add, edit, and delete income/expense transactions
- 📊 **Analytics Dashboard**: Visualize your financial data with charts and graphs
- 📅 **Time-based Analysis**: View data by day, week, month, or year
- 🎨 **Custom Theme**: Beautiful UI with custom color palette
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Express Validator

### Frontend
- React 18
- Vite (build tool)
- React Router for navigation
- Recharts for data visualization
- Axios for API calls
- React Toastify for notifications

## Color Palette
- Primary: #B6AE9F
- Secondary: #C5C7BC
- Tertiary: #DEDED1
- Accent: #FBF3D1

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## Installation

### 1. Clone or navigate to the project folder

```bash
cd c:\xampp\htdocs\Inextrack
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Install Client Dependencies

```bash
cd ../client
npm install
```

### 4. Configure Environment Variables

The server `.env` file is already created in `server/.env`. Update the following values if needed:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/inextrack
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

**Important**: Change the `JWT_SECRET` to a secure random string in production!

### 5. Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
# If MongoDB is installed as a service
net start MongoDB

# Or run mongod directly
mongod
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
# or
sudo service mongod start
```

## Running the Application

### Development Mode

You'll need two terminal windows:

**Terminal 1 - Start the Server:**
```bash
cd server
npm run dev
```
Server will run on http://localhost:5000

**Terminal 2 - Start the Client:**
```bash
cd client
npm run dev
```
Client will run on http://localhost:3000

### Production Build

**Build the client:**
```bash
cd client
npm run build
```

**Start the server:**
```bash
cd server
npm start
```

## Usage

1. **Register**: Create a new account with your name, email, and password
2. **Login**: Sign in with your credentials
3. **Dashboard**: View your financial summary and recent transactions
4. **Transactions**: Add, edit, or delete income and expense entries
5. **Analytics**: Analyze your spending patterns with visual charts

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Transactions
- `GET /api/transactions` - Get all transactions (protected)
- `GET /api/transactions/:id` - Get single transaction (protected)
- `POST /api/transactions` - Create transaction (protected)
- `PUT /api/transactions/:id` - Update transaction (protected)
- `DELETE /api/transactions/:id` - Delete transaction (protected)

### Analytics
- `GET /api/analytics/summary` - Get financial summary (protected)
- `GET /api/analytics/category` - Get data by category (protected)
- `GET /api/analytics/trend` - Get trend data (protected)

## Project Structure

```
Inextrack/
├── server/
│   ├── models/
│   │   ├── User.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── transactions.js
│   │   └── analytics.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── client/
    ├── src/
    │   ├── api/
    │   │   └── api.js
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── PrivateRoute.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── TransactionContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Transactions.jsx
    │   │   └── Analytics.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Common Categories

### Income
- Salary
- Freelance
- Investment
- Gift
- Other

### Expense
- Food
- Transport
- Shopping
- Bills
- Entertainment
- Health
- Education
- Other

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Protected API routes
- Input validation
- CORS enabled

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check if the connection string in `.env` is correct
- Verify MongoDB is accessible on port 27017

### Port Already in Use
- Change the PORT in server `.env` file
- Change the port in client `vite.config.js`

### CORS Issues
- Make sure both server and client are running
- Check proxy configuration in `vite.config.js`

## Future Enhancements

- Budget setting and alerts
- Recurring transactions
- Export data to CSV/PDF
- Multiple currency support
- Receipt upload functionality
- Dark mode theme

## License

MIT License - Feel free to use this project for personal purposes.

## Support

For issues or questions, please create an issue in the project repository or contact the developer.

---

**Happy Tracking! 💰**
