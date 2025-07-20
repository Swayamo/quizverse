/**
 * Validates and normalizes quiz data to ensure it has the proper structure
 * 
 * @param {Object} quizData - Data to validate
 * @returns {Object} Normalized quiz data
 * @throws {Error} If quiz data is invalid
 */
function validateQuizFormat(quizData) {
  if (!quizData || typeof quizData !== 'object') {
    throw new Error('Quiz data must be a valid object');
  }
  
  let normalizedQuiz = { questions: [] };
  
  if (quizData.quiz) {
    normalizedQuiz.topic = quizData.quiz.topic || 'General Knowledge';
    normalizedQuiz.description = quizData.quiz.description || '';
    normalizedQuiz.questions = quizData.quiz.questions || [];
  } else if (Array.isArray(quizData)) {
    normalizedQuiz.questions = quizData;
  } else if (quizData.questions) {
    normalizedQuiz = quizData;
  } else if (quizData.quizz) {
    normalizedQuiz.topic = quizData.quizz.name || 'General Knowledge';
    normalizedQuiz.description = quizData.quizz.description || '';
    
    if (quizData.quizz.questions) {
      normalizedQuiz.questions = quizData.quizz.questions.map(q => {
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
  
  normalizedQuiz.questions.forEach((question, index) => {
    if (!question.question && !question.questionText) {
      throw new Error(`Question ${index + 1} is missing question text`);
    }
    
    if (question.questionText && !question.question) {
      question.question = question.questionText;
    }
    
    if (!Array.isArray(question.options) || question.options.length < 2) {
      throw new Error(`Question ${index + 1} must have at least 2 options`);
    }
    
    if (!question.correctAnswer && question.answers) {
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
    
    if (!question.options.includes(question.correctAnswer)) {
      throw new Error(`The correct answer for question ${index + 1} must be included in the options`);
    }
  });
  
  return normalizedQuiz;
}

module.exports = { validateQuizFormat };
