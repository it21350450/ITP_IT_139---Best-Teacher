const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Register Models first
require('./models/User');
require('./models/Quiz');
require('./models/Question');
require('./models/Submission');

// Route files
const quizRoutes = require('./routes/quizRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

dotenv.config();

// Connect to database
connectDB().then(() => {
  // Seed mock users for dev mode
  if (process.env.NODE_ENV !== 'production') {
    const User = require('./models/User');
    const mockUsers = [
      { _id: '65f3a0a1e4b0a1b2c3d4e5f5', name: 'Dr. Smith', email: 'teacher@example.com', role: 'teacher' },
      { _id: '65f3a1b2e4b0a1b2c3d4e5f6', name: 'John Doe', email: 'student@example.com', role: 'student' }
    ];
    
    mockUsers.forEach(async (u) => {
      try {
        await User.findByIdAndUpdate(u._id, u, { upsert: true });
      } catch (e) {
        console.error('Seed Error:', e.message);
      }
    });
  }
});

const app = express();

// Body parser
app.use(express.json());

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Mount routes
app.use('/api/quizzes', quizRoutes);
app.use('/api/submissions', submissionRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Quiz & Assessment API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
