const db = require('../config/db');

async function fixSchema() {
  try {
    console.log('Checking database schema...');
    
    const columnCheck = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='quizzes' AND column_name='topic'
    `);

    if (columnCheck.rows.length === 0) {
      console.log('Adding missing "topic" column to quizzes table...');
      await db.query(`ALTER TABLE quizzes ADD COLUMN topic VARCHAR(100) NOT NULL DEFAULT 'General Knowledge'`);
      console.log('Added "topic" column successfully');
    } else {
      console.log('Topic column already exists');
    }
    
    const difficultyCheck = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='quizzes' AND column_name='difficulty'
    `);
    
    if (difficultyCheck.rows.length === 0) {
      console.log('Adding missing "difficulty" column to quizzes table...');
      await db.query(`ALTER TABLE quizzes ADD COLUMN difficulty VARCHAR(20) NOT NULL DEFAULT 'medium'`);
      console.log('Added "difficulty" column successfully');
    } else {
      console.log('Difficulty column already exists');
    }

    console.log('Schema check complete');
    return true;
  } catch (err) {
    console.error('Error fixing database schema:', err);
    return false;
  }
}

if (require.main === module) {
  fixSchema()
    .then(success => {
      if (success) {
        console.log('Schema fix completed successfully');
      } else {
        console.log('Schema fix encountered errors');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Failed to run schema fix:', err);
      process.exit(1);
    });
}

module.exports = { fixSchema };
