const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middleware/auth');
const { upload } = require('../config/multer');

// Special routes should come BEFORE parameterized routes
// Get user's quiz history
router.get('/history', auth, quizController.getQuizHistory);

// Get user's quiz stats for dashboard
router.get('/user/stats', auth, quizController.getUserQuizStats);

// Generate a new quiz
router.post('/generate', auth, quizController.generateQuiz);

// Generate a quiz from PDF
router.post('/generate-from-pdf', auth, upload.single('pdf'), quizController.generatePDFQuiz);

// Parameterized routes come AFTER specific routes
// Get a specific quiz
router.get('/:id', auth, quizController.getQuiz);

// Submit quiz answers
router.post('/:id/submit', auth, quizController.submitQuiz);

// Get quiz results/analysis
router.get('/:id/results', auth, quizController.getQuizResults);

module.exports = router;
