const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middleware/auth');
const { upload } = require('../config/multer');

router.get('/history', auth, quizController.getQuizHistory);

router.get('/user/stats', auth, quizController.getUserQuizStats);

router.post('/generate', auth, quizController.generateQuiz);

router.post('/generate-from-pdf', auth, upload.single('pdf'), quizController.generatePDFQuiz);

router.get('/:id', auth, quizController.getQuiz);

router.post('/:id/submit', auth, quizController.submitQuiz);

router.get('/:id/results', auth, quizController.getQuizResults);

module.exports = router;
