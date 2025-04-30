# Quiz Application API Routes for Postman Testing

## Base URL
- Local Development: `http://localhost:5000`

## Authentication Routes

### Register a new user
- **URL**: `{{base_url}}/api/auth/register`
- **Method**: POST
- **Body** (JSON):
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

### Login
- **URL**: `{{base_url}}/api/auth/login`
- **Method**: POST
- **Body** (JSON):
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
- **Response includes**: JWT token (save this for authenticated requests)

## Quiz Routes (Requires Authentication)

For all authenticated routes, add this header:
- **Headers**:
  - `Authorization`: `Bearer YOUR_JWT_TOKEN`

### Generate a New Quiz
- **URL**: `{{base_url}}/api/quizzes/generate`
- **Method**: POST
- **Body** (JSON):
```json
{
  "topic": "JavaScript Fundamentals",
  "difficulty": "medium",
  "numQuestions": 5
}
```

### Get a Specific Quiz
- **URL**: `{{base_url}}/api/quizzes/{{quiz_id}}`
- **Method**: GET
- **Response**: Quiz with questions and options

### Submit Quiz Answers
- **URL**: `{{base_url}}/api/quizzes/{{quiz_id}}/submit`
- **Method**: POST
- **Body** (JSON):
```json
{
  "answers": [
    {
      "questionId": 1,
      "selectedOptionId": 3
    },
    {
      "questionId": 2,
      "selectedOptionId": 7
    }
    // Add all question and selected option pairs
  ],
  "timeSpent": 180
}
```

### Get Quiz History
- **URL**: `{{base_url}}/api/quizzes/history`
- **Method**: GET
- **Response**: List of all quizzes taken by the user

### Get Quiz Results/Analysis
- **URL**: `{{base_url}}/api/quizzes/{{quiz_id}}/results`
- **Method**: GET
- **Response**: Detailed quiz results with analysis

## User Routes (Requires Authentication)

### Get User Profile
- **URL**: `{{base_url}}/api/users/profile`
- **Method**: GET
- **Response**: User profile information

### Update User Profile
- **URL**: `{{base_url}}/api/users/profile`
- **Method**: PUT
- **Body** (JSON):
```json
{
  "username": "updatedUsername",
  "email": "updated@example.com"
}
```

### Get User Statistics
- **URL**: `{{base_url}}/api/users/stats`
- **Method**: GET
- **Response**: User quiz statistics

## Testing Tips

1. First, register a new user or login to get a JWT token
2. Set the token in your request headers for authenticated routes
3. Create a quiz, then use the returned quiz ID for subsequent requests
4. Follow the flow: generate quiz → get quiz → submit answers → view results

## Environment Variables for Postman

To simplify testing, set up environment variables in Postman:
- `base_url`: Your server URL (e.g., `http://localhost:5000`)
- `jwt_token`: The JWT token received after login
- `quiz_id`: ID of a generated quiz
