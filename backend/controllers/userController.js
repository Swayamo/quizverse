const db = require('../config/db');

exports.getProfile = async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const { username, email } = req.body;

  try {
    const result = await db.query(
      'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email',
      [username, email, req.user.id]
    );

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const totalQuizzes = await db.query(
      'SELECT COUNT(*) FROM quizzes WHERE user_id = $1',
      [req.user.id]
    );

    const completedQuizzes = await db.query(
      'SELECT COUNT(*) FROM quiz_results WHERE user_id = $1',
      [req.user.id]
    );

    const averageScore = await db.query(
      'SELECT AVG(score * 100.0 / total_questions) as avg_score FROM quiz_results WHERE user_id = $1',
      [req.user.id]
    );

    const topTopics = await db.query(
      `SELECT q.topic, COUNT(*) as count
       FROM quizzes q
       JOIN quiz_results r ON q.id = r.quiz_id
       WHERE q.user_id = $1
       GROUP BY q.topic
       ORDER BY count DESC
       LIMIT 3`,
      [req.user.id]
    );

    res.json({
      status: 'success',
      data: {
        totalQuizzes: parseInt(totalQuizzes.rows[0].count),
        completedQuizzes: parseInt(completedQuizzes.rows[0].count),
        averageScore: parseFloat(averageScore.rows[0].avg_score || 0).toFixed(2),
        topTopics: topTopics.rows
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
