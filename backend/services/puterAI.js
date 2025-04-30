const axios = require('axios');

class PuterAI {
  constructor() {
    // Optionally use an API key if you have one.
    // If you haven't set up a key, this value will be null
    this.apiKey = process.env.PUTER_API_KEY || null;
    this.baseURL = 'https://api.puter.com/v2/';
  }

  async generateCompletion(prompt) {
    try {
      // Build request headers and include API key if available
      const headers = {
        'Content-Type': 'application/json'
      };
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      // POST the prompt to generate text
      const response = await axios.post(
        `${this.baseURL}generate`,
        {
          prompt,
          max_tokens: 2000,
          temperature: 0.7
        },
        { headers }
      );

      // Expecting the generated text to be in response.data.generated_text
      return response.data.generated_text;
    } catch (error) {
      // Log error message with additional info if available
      console.error('Puter AI Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async generateQuiz(topic, difficulty, numQuestions) {
    // Create a prompt for generating the quiz
    const prompt = `
      Generate a ${difficulty} difficulty quiz with ${numQuestions} multiple-choice questions about ${topic}.
      Each question should have 4 options with only one correct answer.
      Format your response as a JSON array with objects having the structure:
      {"question": "Question text", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": "Correct option text"}
    `.trim();

    try {
      const result = await this.generateCompletion(prompt);
      
      // Attempt to find a JSON array in the returned text
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("Failed to parse response as valid JSON");
    } catch (error) {
      console.error('Failed to generate quiz with Puter AI:', error);
      throw error;
    }
  }
}

module.exports = new PuterAI();
