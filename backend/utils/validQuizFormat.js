/**
 * Validates and normalizes quiz data to ensure it has the proper structure
 * 
 * @param {Object} quizData - Data to validate
 * @returns {Object} Normalized quiz data
 * @throws {Error} If quiz data is invalid
 */
function validateQuizFormat(quizData) {
  // Check if we have a valid object
  if (!quizData || typeof quizData !== 'object') {
    throw new Error('Quiz data must be a valid object');
  }
  
  // Normalize structure based on different possible formats
  let normalizedQuiz = { questions: [] };
  
  // Handle different possible structures
  if (quizData.quiz) {
    // Format: { quiz: { topic, description, questions } }
    normalizedQuiz.topic = quizData.quiz.topic || 'General Knowledge';
    normalizedQuiz.description = quizData.quiz.description || '';
    normalizedQuiz.questions = quizData.quiz.questions || [];
  } else if (Array.isArray(quizData)) {
    // Format: [{ question, options, correctAnswer }]
    normalizedQuiz.questions = quizData;
  } else if (quizData.questions) {
    // Format: { topic, description, questions }
    normalizedQuiz = quizData;
  } else if (quizData.quizz) {
    // Format: { quizz: { name, description, questions } }
    normalizedQuiz.topic = quizData.quizz.name || 'General Knowledge';
    normalizedQuiz.description = quizData.quizz.description || '';
    
    // Handle different question formats
    if (quizData.quizz.questions) {
      normalizedQuiz.questions = quizData.quizz.questions.map(q => {
        // Handle format with answerText and isCorrect
        if (q.answers && Array.isArray(q.answers)) {
          const correctAnswer = q.answers.find(a => a.isCorrect)?.answerText || '';
          const options = q.answers.map(a => a.answerText);
          
          return {
            question: q.questionText,
            options,
            correctAnswer
          };
        }
        return q;
      });
    }
  }
  
  // Validate questions array
  if (!Array.isArray(normalizedQuiz.questions) || normalizedQuiz.questions.length === 0) {
    throw new Error('Quiz must contain at least one question');
  }
  
  // Ensure each question has the correct structure
  normalizedQuiz.questions.forEach((question, index) => {
    if (!question.question && !question.questionText) {
      throw new Error(`Question ${index + 1} is missing question text`);
    }
    
    // Normalize question structure
    if (question.questionText && !question.question) {
      question.question = question.questionText;
    }
    
    if (!Array.isArray(question.options) || question.options.length < 2) {
      throw new Error(`Question ${index + 1} must have at least 2 options`);
    }
    
    if (!question.correctAnswer && question.answers) {
      // Find correct answer from answers array
      const correctAnswer = question.answers.find(a => a.isCorrect);
      if (correctAnswer) {
        question.correctAnswer = correctAnswer.answerText;
      } else {
        throw new Error(`Question ${index + 1} is missing correct answer`);
      }
    }
    
    if (!question.correctAnswer) {
      throw new Error(`Question ${index + 1} is missing correct answer`);
    }
    
    // Ensure the correct answer is among the options
    if (!question.options.includes(question.correctAnswer)) {
      throw new Error(`The correct answer for question ${index + 1} must be included in the options`);
    }
  });
  
  return normalizedQuiz;
}

module.exports = { validateQuizFormat };
