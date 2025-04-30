const { pool } = require('../config/db');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Connection successful!');
    console.log(`Server time: ${result.rows[0].now}`);
    return true;
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.log('\nPossible solutions:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check your database credentials in .env file');
    console.log('3. Try connecting with a PostgreSQL client to verify credentials');
    
    if (err.message.includes('insecure')) {
      console.log('\nFor SSL issues:');
      console.log('Option 1: Set PGSSLMODE=disable in your .env file');
      console.log('Option 2: Update your PostgreSQL configuration to allow non-SSL connections');
      console.log('Option 3: Set up proper SSL certificates for your PostgreSQL instance');
    }
    
    return false;
  } finally {
    pool.end();
  }
}

// Run if script is executed directly
if (require.main === module) {
  testConnection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Error in test script:', err);
      process.exit(1);
    });
}

module.exports = { testConnection };
