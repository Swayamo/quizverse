-- Create schema
CREATE SCHEMA IF NOT EXISTS public;

-- Drop existing tables
DROP TABLE IF EXISTS user_answers CASCADE;
DROP TABLE IF EXISTS quiz_results CASCADE;
DROP TABLE IF EXISTS options CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quizzes table
CREATE TABLE quizzes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  topic VARCHAR(100) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  description TEXT,
  source_type VARCHAR(20) DEFAULT 'ai_generated', -- e.g. 'pdf', 'ai_generated'
  source_file_path VARCHAR(255),                  -- PDF file path if any
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions table with support for MCQ and Short types
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  correct_answer TEXT,  -- Allow longer answers
  explanation TEXT,
  type VARCHAR(10) DEFAULT 'mcq' CHECK (type IN ('mcq', 'short'))  -- New column
);

-- Options table (only used for MCQs)
CREATE TABLE options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  option_text VARCHAR(255) NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE
);

-- Quiz results
CREATE TABLE quiz_results (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  time_taken INTEGER -- in seconds
);

-- User answers table
-- If short answer: selected_option_id will be NULL, short_answer will be used
CREATE TABLE user_answers (
  id SERIAL PRIMARY KEY,
  quiz_result_id INTEGER REFERENCES quiz_results(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id INTEGER REFERENCES options(id),
  short_answer TEXT,
  is_correct BOOLEAN DEFAULT FALSE
);
