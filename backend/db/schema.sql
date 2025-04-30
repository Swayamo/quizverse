-- First create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS public;

-- Then proceed with table creation
DROP TABLE IF EXISTS user_answers CASCADE;
DROP TABLE IF EXISTS quiz_results CASCADE;
DROP TABLE IF EXISTS options CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quizzes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  topic VARCHAR(100) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  description TEXT,
  source_type VARCHAR(20) DEFAULT 'ai_generated',
  source_file_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  correct_answer VARCHAR(255) NOT NULL
  explanation TEXT
);

CREATE TABLE options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  option_text VARCHAR(255) NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE
);

CREATE TABLE quiz_results (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  time_taken INTEGER -- in seconds
);

CREATE TABLE user_answers (
  id SERIAL PRIMARY KEY,
  quiz_result_id INTEGER REFERENCES quiz_results(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id INTEGER REFERENCES options(id),
  is_correct BOOLEAN DEFAULT FALSE
);
