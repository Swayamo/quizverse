# QuizVerse - AI-powered Quiz Application

QuizVerse is a full-stack web application that uses AI to generate customized quizzes on any topic. Users can create quizzes, take them, and track their performance over time.

## Features

- 🧠 AI-generated quizzes on any topic
- 🎚️ Adjustable difficulty levels
- 📊 Performance tracking and statistics
- 🔐 User authentication
- 📱 Responsive design for all devices

## Tech Stack

### Frontend
- React
- React Router
- Axios
- CSS3

### Backend
- Node.js
- Express
- PostgreSQL
- JSON Web Tokens
- Google Generative AI (Gemini)

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL 
- Google Gemini API key

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/quiz_application.git
   cd quiz_application
   ```

2. Install backend dependencies
   ```
   npm install
   ```

3. Install frontend dependencies
   ```
   cd frontend
   npm install
   cd ..
   ```

4. Create a .env file in the root directory with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d

   # Database
   DB_HOST=your_db_host
   DB_PORT=5432
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name

   # Google Gemini API
   GEMINI_API_KEY=your_gemini_api_key
   ```

5. Set up the database
   ```
   npm run db:init
   ```

6. Run the development server (backend and frontend)
   ```
   npm run dev:both
   ```

7. The application will be available at:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## API Documentation

See the [Postman Test Routes](./postman_test_routes.md) documentation for API details.

## Deployment

1. Build the frontend
   ```
   npm run build
   ```

2. Start the production server
   ```
   npm start
   ```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[ISC](https://choosealicense.com/licenses/isc/)
