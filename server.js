const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./backend/routes/auth');
const quizRoutes = require('./backend/routes/quizzes');
const userRoutes = require('./backend/routes/users');
const { findAvailablePort } = require('./utils/portManager');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/users', userRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('frontend/dist'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!', error: err.message });
});

const startServer = async () => {
  const PORT = process.env.PORT || 5000;
  const availablePort = await findAvailablePort(PORT);
  
  app.listen(availablePort, () => {
    console.log(`Server is running on port ${availablePort}`);
  });
};

startServer();
