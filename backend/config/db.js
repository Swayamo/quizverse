const { Pool } = require('pg');
require('dotenv').config();

// Build database connection parameters
const connectionConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Default to public schema
  connectionTimeoutMillis: 5000,
  // Add SSL options for cloud databases like Neon
  ssl: {
    rejectUnauthorized: false
  }
};

// Use connectionString if provided, otherwise use individual parameters
const pool = process.env.DATABASE_URL 
  ? new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : new Pool(connectionConfig);

// Add connection event handlers for better debugging
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on PostgreSQL client', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
