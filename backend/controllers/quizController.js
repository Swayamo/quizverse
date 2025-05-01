const db = require('../config/db');
// Import Google Generative AI
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Add this to the imports at the top of the file
const { extractTextFromPDF, generateQuizFromPDF } = require('../utils/pdfProcessor');
const path = require('path');
const fs = require('fs'); // Add this for file operations

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate a quiz based on topic
exports.generateQuiz = async (req, res) => {
  // Change default numQuestions from 5 to 3
  console.log(1);
  const { topic, difficulty = 'medium', numQuestions = 3 } = req.body;
  const userId = req.user.id;

  if (!topic) {
    return res.status(400).json({ message: 'Topic is required' });
  }

  try {
    let generatedQuiz;
    
    try {
      console.log(`Generating quiz on ${topic} with ${numQuestions} questions using Gemini AI`);
      
      // Configure the model (using gemini-pro for text generation)
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      // Updated prompt to include explanations
      const prompt = `Generate a ${difficulty} quiz with ${numQuestions} multiple choice questions about ${topic}. 
      Each question should have 4 options with only one correct answer.
      Also include a brief explanation for why the correct answer is right.
      Format the response as a valid JSON array with this exact structure: 
      [{"question": "Question text", "options": ["Option1", "Option2", "Option3", "Option4"], "correctAnswer": "Correct option text", "explanation": "Clear explanation of why this is the correct answer"}]
      Ensure the output is ONLY the JSON array, without any introductory text or markdown formatting.`;
      
      // Generate content
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let textResponse = response.text();

      // Improved JSON extraction: handle potential markdown code blocks
      if (textResponse.startsWith('```json')) {
        textResponse = textResponse.substring(7, textResponse.length - 3).trim();
      } else if (textResponse.startsWith('```')) {
         textResponse = textResponse.substring(3, textResponse.length - 3).trim();
      }
      
      // Extract JSON from response (handling possible text wrappers)
      const jsonStart = textResponse.indexOf('[');
      const jsonEnd = textResponse.lastIndexOf(']') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
          throw new Error("Could not find valid JSON array in the AI response.");
      }
      
      const jsonString = textResponse.substring(jsonStart, jsonEnd);
      
      generatedQuiz = JSON.parse(jsonString);
      
      // Validate the structure and number of questions received
      if (!Array.isArray(generatedQuiz) || generatedQuiz.length === 0) {
          throw new Error("Generated content is not a valid non-empty array.");
      }
      if (generatedQuiz.length !== numQuestions) {
          console.warn(`AI generated ${generatedQuiz.length} questions, but ${numQuestions} were requested.`);
          // Decide if you want to proceed or throw an error. For now, we proceed.
      }
      
      console.log('Quiz generation successful');
    } catch (aiError) {
      console.error('Gemini AI generation error:', aiError);
      // Use fallback questions if Gemini API fails
      console.log('Gemini API failed, using hardcoded fallback questions');
      generatedQuiz = generateFallbackQuiz(topic, difficulty, numQuestions);
    }

    // Create quiz in database
    const quizResult = await db.query(
      'INSERT INTO quizzes (user_id, topic, difficulty) VALUES ($1, $2, $3) RETURNING id',
      [userId, topic, difficulty]
    );
    
    const quizId = quizResult.rows[0].id;
    
    // Add questions and options to database - Now including explanations
    for (const item of generatedQuiz) {
      const questionResult = await db.query(
        'INSERT INTO questions (quiz_id, question_text, correct_answer, explanation) VALUES ($1, $2, $3, $4) RETURNING id',
        [quizId, item.question, item.correctAnswer, item.explanation || "No explanation provided."]
      );
      
      const questionId = questionResult.rows[0].id;
      
      // Add options
      for (const option of item.options) {
        await db.query(
          'INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, $2, $3)',
          [questionId, option, option === item.correctAnswer]
        );
      }
    }
    
    // Return the created quiz
    res.status(201).json({
      status: 'success',
      data: {
        quizId,
        topic,
        difficulty,
        numQuestions
      }
    });
  } catch (err) {
    console.error('Error generating quiz:', err);
    console.log(1);
    res.status(500).json({ 
      message: 'Error generating quiz', 
      error: err.message,
      suggestion: 'Please try again later or contact support if the issue persists.'
    });
  }
};

// Fallback quiz generator for when API services fail
function generateFallbackQuiz(topic, difficulty, numQuestions) {
  // Ensure fallback also respects the potentially lower numQuestions
  console.log(`Generating fallback quiz on ${topic} with up to ${numQuestions} questions`);
  
  const fallbackQuizzes = {
    javascript: [
      {
        question: "What is JavaScript primarily used for?",
        options: ["Server-side scripting only", "Client-side web development", "Database management", "Mobile app development only"],
        correctAnswer: "Client-side web development",
        explanation: "JavaScript was originally designed as a client-side scripting language to enhance web pages interactivity in browsers."
      },
      {
        question: "Which of the following is NOT a JavaScript data type?",
        options: ["String", "Boolean", "Integer", "Object"],
        correctAnswer: "Integer",
        explanation: "JavaScript has Number as a data type, not specifically Integer. It represents both integers and floating-point numbers."
      },
      {
        question: "What will 'typeof null' return in JavaScript?",
        options: ["null", "undefined", "object", "number"],
        correctAnswer: "object",
        explanation: "In JavaScript, typeof null returns 'object', which is a long-standing bug that's maintained for compatibility."
      }
    ],
    python: [
      {
        question: "What is Python?",
        options: ["A compiled language", "An interpreted language", "A markup language", "An assembly language"],
        correctAnswer: "An interpreted language",
        explanation: "Python is an interpreted language, meaning the code is executed line by line rather than being compiled before execution."
      },
      {
        question: "Which of the following is NOT a Python data type?",
        options: ["List", "Dictionary", "Tuple", "Array"],
        correctAnswer: "Array",
        explanation: "Python doesn't have a native Array data type. It uses Lists for similar functionality, while Arrays are available through the NumPy library."
      },
      {
        question: "How do you create a comment in Python?",
        options: ["/* Comment */", "// Comment", "# Comment", "-- Comment --"],
        correctAnswer: "# Comment",
        explanation: "In Python, single-line comments are created using the hash symbol (#)."
      }
    ],
    general: [
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Jupiter", "Venus"],
        correctAnswer: "Mars",
        explanation: "Mars appears reddish due to iron oxide (rust) on its surface, earning it the nickname 'The Red Planet'."
      },
      {
        question: "What is the chemical symbol for gold?",
        options: ["Ag", "Au", "Fe", "Pb"],
        correctAnswer: "Au",
        explanation: "The chemical symbol Au comes from the Latin word for gold, 'aurum', meaning 'shining dawn'."
      },
      {
        question: "Which gas do plants primarily use for photosynthesis?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
        correctAnswer: "Carbon Dioxide",
        explanation: "Plants absorb carbon dioxide during photosynthesis to create glucose and oxygen as a byproduct."
      }
    ]
  };
  
  // Determine which quiz set to use based on topic
  let quizSet = fallbackQuizzes.general; // Default to general
  
  const lowerTopic = topic.toLowerCase();
  if (lowerTopic.includes('javascript') || lowerTopic.includes('js')) {
    quizSet = fallbackQuizzes.javascript;
  } else if (lowerTopic.includes('python')) {
    quizSet = fallbackQuizzes.python;
  }
  
  // Return requested number of questions, or all if fewer are available
  // Ensure the slice respects the numQuestions parameter passed to this function
  return quizSet.slice(0, Math.min(numQuestions, quizSet.length));
}

// Get a specific quiz
exports.getQuiz = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Verify quiz belongs to user or is public
    const quizCheck = await db.query(
      'SELECT * FROM quizzes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (quizCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Quiz not found or unauthorized' });
    }

    // Get quiz questions
    const questionsResult = await db.query(
      'SELECT q.id, q.question_text FROM questions q WHERE q.quiz_id = $1',
      [id]
    );

    const questions = await Promise.all(questionsResult.rows.map(async (question) => {
      const optionsResult = await db.query(
        'SELECT id, option_text FROM options WHERE question_id = $1',
        [question.id]
      );

      return {
        id: question.id,
        question: question.question_text,
        options: optionsResult.rows.map(opt => ({
          id: opt.id,
          text: opt.option_text
        }))
      };
    }));

    res.json({
      status: 'success',
      data: {
        id: parseInt(id),
        topic: quizCheck.rows[0].topic,
        difficulty: quizCheck.rows[0].difficulty,
        questions
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit quiz answers
exports.submitQuiz = async (req, res) => {
  const { id } = req.params;
  const { answers, timeSpent } = req.body;
  const userId = req.user.id;

  try {
    // Verify quiz belongs to user
    const quizCheck = await db.query(
      'SELECT * FROM quizzes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (quizCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Quiz not found or unauthorized' });
    }

    // Evaluate answers
    let score = 0;
    const answerResults = [];

    for (const answer of answers) {
      const { questionId, selectedOptionId } = answer;
      
      // Check if selected option is correct
      const optionCheck = await db.query(
        'SELECT is_correct FROM options WHERE id = $1 AND question_id = $2',
        [selectedOptionId, questionId]
      );

      if (optionCheck.rows.length > 0) {
        const isCorrect = optionCheck.rows[0].is_correct;
        if (isCorrect) score++;
        answerResults.push({ questionId, selectedOptionId, isCorrect });
      }
    }

    // Store quiz result
    const totalQuestions = answers.length;
    
    const resultInsert = await db.query(
      'INSERT INTO quiz_results (quiz_id, user_id, score, total_questions, time_taken) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [id, userId, score, totalQuestions, timeSpent]
    );
    
    const resultId = resultInsert.rows[0].id;

    // Store user answers
    for (const result of answerResults) {
      await db.query(
        'INSERT INTO user_answers (quiz_result_id, question_id, selected_option_id, is_correct) VALUES ($1, $2, $3, $4)',
        [resultId, result.questionId, result.selectedOptionId, result.isCorrect]
      );
    }

    // Return result summary
    res.json({
      status: 'success',
      data: {
        quizId: parseInt(id),
        score,
        totalQuestions,
        percentage: (score / totalQuestions) * 100,
        resultId
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's quiz history
exports.getQuizHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const history = await db.query(
      `SELECT q.id, q.topic, q.difficulty, q.created_at, 
       r.score, r.total_questions, r.completed_at, r.time_taken
       FROM quizzes q
       LEFT JOIN quiz_results r ON q.id = r.quiz_id
       WHERE q.user_id = $1
       ORDER BY q.created_at DESC`,
      [userId]
    );

    res.json({
      status: 'success',
      data: history.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get detailed quiz results and analysis
exports.getQuizResults = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Get quiz result
    const resultCheck = await db.query(
      `SELECT r.*, q.topic, q.difficulty, q.source_type
       FROM quiz_results r
       JOIN quizzes q ON r.quiz_id = q.id
       WHERE r.quiz_id = $1 AND r.user_id = $2`,
      [id, userId]
    );

    if (resultCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Quiz result not found' });
    }

    const result = resultCheck.rows[0];

    // Get detailed question and answer data - Now including explanations
    const detailQuery = await db.query(
      `SELECT q.id as question_id, q.question_text, q.explanation,
       o.id as option_id, o.option_text, o.is_correct,
       ua.is_correct as user_correct, ua.selected_option_id
       FROM questions q
       JOIN options o ON q.id = o.question_id
       LEFT JOIN user_answers ua ON q.id = ua.question_id AND ua.quiz_result_id = $1
       WHERE q.quiz_id = $2`,
      [result.id, id]
    );

    // Process data to group by question
    const questions = {};
    detailQuery.rows.forEach(row => {
      if (!questions[row.question_id]) {
        questions[row.question_id] = {
          id: row.question_id,
          question: row.question_text,
          explanation: row.explanation, // Include explanation
          options: [],
          userAnswer: row.selected_option_id,
          correct: row.user_correct
        };
      }
      
      questions[row.question_id].options.push({
        id: row.option_id,
        text: row.option_text,
        isCorrect: row.is_correct
      });
    });

    // Calculate strengths and weaknesses
    const score = result.score;
    const totalQuestions = result.total_questions;
    const percentage = (score / totalQuestions) * 100;

    let analysis = {
      score,
      totalQuestions,
      percentage,
      timeTaken: result.time_taken,
      strength: percentage >= 80 ? "Excellent understanding of the topic!" : 
                percentage >= 60 ? "Good grasp of the material" : 
                "More practice recommended",
      feedback: percentage >= 70 ? "Well done!" : 
                percentage >= 50 ? "Keep practicing to improve" : 
                "Consider reviewing this topic more thoroughly"
    };

    res.json({
      status: 'success',
      data: {
        quizId: parseInt(id),
        topic: result.topic,
        difficulty: result.difficulty,
        source_type: result.source_type,
        questions: Object.values(questions),
        analysis
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate a quiz from PDF document - Update to include explanations
exports.generatePDFQuiz = async (req, res) => {
  const userId = req.user.id;
  const { topic, difficulty = 'medium', numQuestions = 5 } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ message: 'PDF file is required' });
  }
  
  if (!topic) {
    return res.status(400).json({ message: 'Topic is required' });
  }
  
  try {
    const filePath = req.file.path;
    console.log(`Processing PDF at path: ${filePath}`);
    
    // Extract text from the PDF
    const pdfText = await extractTextFromPDF(filePath);
    console.log(`Extracted ${pdfText.length} characters from PDF`);
    
    if (pdfText.length < 100) {
      throw new Error('PDF content is too short or could not be properly extracted');
    }
    
    // Generate a quiz based on the PDF content - now with explanations
    console.log(`Generating quiz from PDF content on topic: ${topic}`);
    const quizData = await generateQuizFromPDF(pdfText, topic, difficulty, numQuestions);
    
    // Store the quiz in the database
    const quizResult = await db.query(
      'INSERT INTO quizzes (user_id, topic, difficulty, description, source_type, source_file_path) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [userId, topic, difficulty, quizData.description || `Quiz about ${topic}`, 'pdf', req.file.filename]
    );
    
    const quizId = quizResult.rows[0].id;
    
    // Add questions and options to database - now with explanations
    for (const item of quizData.questions) {
      const questionResult = await db.query(
        'INSERT INTO questions (quiz_id, question_text, correct_answer, explanation) VALUES ($1, $2, $3, $4) RETURNING id',
        [quizId, item.question, item.correctAnswer, item.explanation || "This answer is based on the PDF content."]
      );
      
      const questionId = questionResult.rows[0].id;
      
      // Add options
      for (const option of item.options) {
        await db.query(
          'INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, $2, $3)',
          [questionId, option, option === item.correctAnswer]
        );
      }
    }
    
    // Return the created quiz
    res.status(201).json({
      status: 'success',
      data: {
        quizId,
        topic,
        difficulty,
        description: quizData.description || `Quiz about ${topic}`,
        numQuestions: quizData.questions.length,
        source: 'pdf'
      }
    });
  } catch (err) {
    console.error('Error generating quiz from PDF:', err);
    
    // Check if the file exists and remove it on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log(`Removed uploaded file: ${req.file.path}`);
      } catch (unlinkErr) {
        console.error('Error removing uploaded file:', unlinkErr);
      }
    }
    
    res.status(500).json({ 
      message: 'Error generating quiz from PDF', 
      error: err.message,
      suggestion: 'Please try again with a different PDF or contact support.'
    });
  }
};

// Enhance user dashboard stats
exports.getUserQuizStats = async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Total quizzes created
    const totalQuizzes = await db.query(
      'SELECT COUNT(*) FROM quizzes WHERE user_id = $1',
      [userId]
    );
    
    // Total quizzes completed
    const completedQuizzes = await db.query(
      'SELECT COUNT(*) FROM quiz_results WHERE user_id = $1',
      [userId]
    );
    
    // Average score
    const averageScore = await db.query(
      'SELECT AVG(score * 100.0 / total_questions) as avg_score FROM quiz_results WHERE user_id = $1',
      [userId]
    );
    
    // Top performing topics
    const topPerformingTopics = await db.query(
      `SELECT q.topic, AVG(r.score * 100.0 / r.total_questions) as avg_score, COUNT(*) as attempts
       FROM quizzes q
       JOIN quiz_results r ON q.id = r.quiz_id
       WHERE r.user_id = $1
       GROUP BY q.topic
       ORDER BY avg_score DESC
       LIMIT 3`,
      [userId]
    );
    
    // Recent quiz activities
    const recentActivity = await db.query(
      `SELECT q.id, q.topic, q.difficulty, r.score, r.total_questions, 
              r.completed_at, r.time_taken
       FROM quiz_results r
       JOIN quizzes q ON r.quiz_id = q.id
       WHERE r.user_id = $1
       ORDER BY r.completed_at DESC
       LIMIT 5`,
      [userId]
    );
    
    // Quiz sources breakdown
    const quizSources = await db.query(
      `SELECT source_type, COUNT(*) as count
       FROM quizzes
       WHERE user_id = $1
       GROUP BY source_type`,
      [userId]
    );
    
    res.json({
      status: 'success',
      data: {
        totalQuizzes: parseInt(totalQuizzes.rows[0].count),
        completedQuizzes: parseInt(completedQuizzes.rows[0].count),
        averageScore: parseFloat(averageScore.rows[0]?.avg_score || 0).toFixed(2),
        topPerformingTopics: topPerformingTopics.rows,
        recentActivity: recentActivity.rows,
        quizSources: quizSources.rows
      }
    });
  } catch (err) {
    console.error('Error fetching user quiz stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
};