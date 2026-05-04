const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import Mock User Model to register it in Mongoose before routes run
require('./models/User');

// Main Routes
const bookingRoutes = require('./routes/bookingRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
app.use('/api/bookings', bookingRoutes);
app.use('/api/teachers', teacherRoutes);

// Centralized Error Middleware
const errorHandler = require('./middleware/errorMiddleware');
app.use(errorHandler);

// Establish database connection and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/best-teacher';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(`\n====================================`);
    console.log(`🚀 MongoDB Connected: ${MONGO_URI}`);
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    console.log(`====================================\n`);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
