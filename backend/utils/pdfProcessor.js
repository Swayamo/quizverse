const fs = require('fs');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extract text content from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Text content of the PDF
 */
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Generate a quiz based on PDF content
 * @param {string} pdfContent - Text content from the PDF
 * @param {string} topic - Topic for the quiz
 * @param {string} difficulty - Difficulty level
 * @param {number} numQuestions - Number of questions to generate
 * @returns {Promise<Object>} - Generated quiz data
 */
async function generateQuizFromPDF(pdfContent, topic, difficulty = 'medium', numQuestions = 5) {
  try {
    // Configure the model - IMPORTANT: Using gemini-1.5-flash or gemini-1.0-pro instead of gemini-pro
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create prompt for quiz generation
    const prompt = `
    Given the following text extracted from a PDF document, generate a ${difficulty} level quiz about "${topic}" with ${numQuestions} multiple choice questions.
    
    Text from PDF:
    ${pdfContent.substring(0, 8000)} ${pdfContent.length > 8000 ? '... (text truncated)' : ''}
    
    Format the response as a valid JSON object with this exact structure:
    {
      "quiz": {
        "topic": "${topic}",
        "description": "Brief description of the quiz based on the PDF content",
        "questions": [
          {
            "question": "Question text",
            "options": ["Option1", "Option2", "Option3", "Option4"],
            "correctAnswer": "Correct option text"
          }
        ]
      }
    }
    
    Ensure questions are directly related to the content in the PDF. The output should be ONLY the JSON object.`;
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let textResponse = response.text();
    
    // Extract JSON from response
    const jsonStart = textResponse.indexOf('{');
    const jsonEnd = textResponse.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error("Could not find valid JSON in the AI response.");
    }
    
    const jsonString = textResponse.substring(jsonStart, jsonEnd);
    
    try {
      const parsedResponse = JSON.parse(jsonString);
      
      // Validate the structure
      if (!parsedResponse.quiz || !Array.isArray(parsedResponse.quiz.questions)) {
        throw new Error("Generated content doesn't match the expected structure.");
      }
      
      return parsedResponse.quiz;
    } catch (parseError) {
      console.error('JSON parsing error:', parseError, 'Response was:', jsonString.substring(0, 200));
      throw new Error('Failed to parse AI response as valid JSON');
    }
  } catch (error) {
    console.error('Error generating quiz from PDF:', error);
    
    // Fallback to a simple quiz generation if AI fails
    console.log('Using fallback quiz generation for PDF content');
    return generateFallbackPDFQuiz(pdfContent, topic, difficulty, numQuestions);
  }
}

/**
 * Generate a simple fallback quiz when AI generation fails
 */
function generateFallbackPDFQuiz(pdfContent, topic, difficulty, numQuestions = 5) {
  // Create a simple description based on the PDF content and topic
  const contentPreview = pdfContent.substring(0, 300).replace(/\n/g, ' ').trim();
  const description = `A ${difficulty} quiz about ${topic} based on the provided PDF content.`;
  
  // Extract some keywords from the PDF content for question generation
  const words = pdfContent.split(/\s+/).filter(word => word.length > 5);
  const keywords = [...new Set(words)].slice(0, 20);
  
  // Generate basic questions
  const questions = [];
  
  // Always add a question based on topic
  questions.push({
    question: `What is the main focus of this document related to ${topic}?`,
    options: [
      `Learning ${topic} concepts`, 
      `${topic} implementation details`, 
      `History of ${topic}`, 
      `${topic} best practices`
    ],
    correctAnswer: `${topic} implementation details`
  });
  
  // Add questions with keywords if we extracted enough
  if (keywords.length >= 3 && questions.length < numQuestions) {
    questions.push({
      question: `Which of the following terms is most relevant to ${topic}?`,
      options: [
        keywords[0], 
        keywords[Math.min(1, keywords.length-1)], 
        keywords[Math.min(2, keywords.length-1)], 
        "None of the above"
      ],
      correctAnswer: keywords[0]
    });
  }
  
  // Add generic topic questions to fill the required number
  const genericQuestions = [
    {
      question: `What is a common practice in ${topic}?`,
      options: ["Documentation", "Testing", "Implementation", "All of the above"],
      correctAnswer: "All of the above"
    },
    {
      question: `Which statement best describes ${topic}?`,
      options: [
        `A methodology for software development`, 
        `A programming language feature`, 
        `A design pattern`, 
        `A software tool`
      ],
      correctAnswer: `A methodology for software development`
    },
    {
      question: `What is important to consider when working with ${topic}?`,
      options: ["Performance", "Readability", "Maintainability", "All of these"],
      correctAnswer: "All of these"
    }
  ];
  
  // Add generic questions until we reach the requested number
  while (questions.length < numQuestions && genericQuestions.length > 0) {
    questions.push(genericQuestions.shift());
  }
  
  return {
    topic,
    description,
    questions: questions.slice(0, numQuestions)
  };
}

module.exports = {
  extractTextFromPDF,
  generateQuizFromPDF
};
