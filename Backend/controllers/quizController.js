import { query, getConnection } from '../config/db.js';
import { verifyToken } from '../utils/jwt.js';
import { notifyAdmins } from '../services/notificationService.js';

/**
 * Quiz Controller
 * Handles quiz retrieval, submission, and scoring
 */

/**
 * Get quizzes for a module
 * GET /api/quiz/quizzes/:moduleId
 */
export const getQuizzes = async (req, res) => {
  try {
    const { moduleId } = req.params;

    // Get quizzes for this module
    const quizzes = await query(
      `SELECT q.*, 
              (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.quiz_id) as question_count
       FROM quizzes q
       WHERE q.module_id = ?
       ORDER BY q.quiz_order ASC`,
      [moduleId]
    );

    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    console.error('Error getting quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get single quiz with questions
 * GET /api/quiz/:quizId
 */
export const getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    // Get quiz details
    const quizResult = await query(
      `SELECT q.*, i.name as instrument_name
       FROM quizzes q
       JOIN instruments i ON q.instrument_id = i.id
       WHERE q.id = ?`,
      [quizId]
    );
    const quiz = quizResult && quizResult[0];

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Get quiz questions with options
    const questions = await query(
      `SELECT qq.*, 
              (SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id', qo.id,
                  'option_text', qo.option_text,
                  'is_correct', qo.is_correct
                )
              )
              FROM quiz_options qo 
              WHERE qo.question_id = qq.id) as options
       FROM quiz_questions qq
       WHERE qq.quiz_id = ?
       ORDER BY qq.display_order ASC`,
      [quizId]
    );

    // Parse options JSON
    const questionsWithParsedOptions = questions.map(q => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : []
    }));

    res.json({
      success: true,
      data: {
        quiz,
        questions: questionsWithParsedOptions
      }
    });
  } catch (error) {
    console.error('Error getting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Submit quiz and calculate score
 * POST /api/quiz/submit
 * Body: { quizId, answers: [{questionId, selectedOptionId}], timeSpent }
 */
export const submitQuiz = async (req, res) => {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();

    const { quizId, answers, timeSpent } = req.body;

    // Get user from token
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      await connection.rollback();
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.id) {
      await connection.rollback();
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    const userId = decoded.id;

    // Get quiz details
    const [quiz] = await connection.execute(
      'SELECT * FROM quizzes WHERE id = ?',
      [quizId]
    );

    if (!quiz || quiz.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const quizData = quiz[0];

    // Get all questions with correct answers
    const [questions] = await connection.execute(
      `SELECT qq.id, qq.points,
              (SELECT qo.id FROM quiz_options qo 
               WHERE qo.question_id = qq.id AND qo.is_correct = 1 
               LIMIT 1) as correct_option_id
       FROM quiz_questions qq
       WHERE qq.quiz_id = ?`,
      [quizId]
    );

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    let maxPoints = 0;
    const answerDetails = [];

    questions.forEach(question => {
      maxPoints += question.points || 10;
      
      const userAnswer = answers.find(a => a.questionId === question.id);
      const isCorrect = userAnswer && 
                       userAnswer.selectedOptionId === question.correct_option_id;
      
      if (isCorrect) {
        correctAnswers++;
        totalPoints += question.points || 10;
      }

      answerDetails.push({
        questionId: question.id,
        correct: isCorrect,
        userAnswer: userAnswer?.selectedOptionId || null,
        correctAnswer: question.correct_option_id
      });
    });

    const accuracy = Math.round((correctAnswers / questions.length) * 100);

    // Save quiz attempt
    await connection.execute(
      `INSERT INTO user_quiz_attempts 
       (user_id, quiz_id, score, max_score, correct_answers, total_questions, 
        accuracy, time_spent, answers_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        quizId,
        totalPoints,
        maxPoints,
        correctAnswers,
        questions.length,
        accuracy,
        timeSpent || 0,
        JSON.stringify(answerDetails)
      ]
    );

    // Update user points (quiz points)
    const [userPoints] = await connection.execute(
      'SELECT * FROM user_points WHERE user_id = ?',
      [userId]
    );
    // Update user XP (user_xp table, not user_points)
    const [userXp] = await connection.execute(
      'SELECT * FROM user_xp WHERE student_id = ?',
      [userId]
    );

    if (userXp && userXp.length > 0) {
      await connection.execute(
        `UPDATE user_xp 
         SET total_xp = total_xp + ?, 
             total_quizzes_taken = total_quizzes_taken + 1,
             total_quizzes_passed = total_quizzes_passed + ?,
             updated_at = NOW()
         WHERE student_id = ?`,
        [totalPoints, isPassed ? 1 : 0, userId]
      );
    } else {
      await connection.execute(
        'INSERT INTO user_xp (student_id, total_xp, total_quizzes_taken, total_quizzes_passed) VALUES (?, ?, 1, ?)',
        [userId, totalPoints, isPassed ? 1 : 0]
      );
    }

    // Check and award achievements
    const achievements = await checkQuizAchievements(userId, accuracy, connection);

    // CHECK FOR LEVEL UP (NEW!)
    const levelUpData = await checkLevelUp(userId, connection);
    
    // CHECK FOR MODULE UNLOCKS (NEW!)
    let unlockedModules = [];
    if (levelUpData.leveledUp) {
      unlockedModules = await checkModuleUnlocks(userId, levelUpData.newLevel, connection);
    }

    await connection.commit();

    // Get updated user XP
    const updatedXpResult = await query(
      'SELECT * FROM user_xp WHERE student_id = ?',
      [userId]
    );
    const updatedXp = updatedXpResult && updatedXpResult[0];

    res.json({
      success: true,
      message: 'Quiz completed!',
      data: {
        score: totalPoints,
        maxScore: maxPoints,
        correctAnswers,
        totalQuestions: questions.length,
        accuracy,
        totalXp: updatedXp?.total_xp || totalPoints,
        currentLevel: updatedXp?.current_level || 1,
        xpToNextLevel: updatedXp?.xp_to_next_level || 500,
        levelUp: levelUpData.leveledUp,
        newLevel: levelUpData.leveledUp ? levelUpData.newLevel : null,
        unlockedModules,
        achievements,
        answerDetails
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

/**
 * Get user quiz statistics
 * GET /api/quiz/stats
 */
export const getUserQuizStats = async (req, res) => {
  try {
    // Get user from token
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    const userId = decoded.id;

    // Get quiz attempts
    const attempts = await query(
      `SELECT uqa.*, q.title as quiz_title, q.level, i.name as instrument_name
       FROM user_quiz_attempts uqa
       JOIN quizzes q ON uqa.quiz_id = q.id
       JOIN instruments i ON q.instrument_id = i.id
       WHERE uqa.user_id = ?
       ORDER BY uqa.completed_at DESC
       LIMIT 20`,
      [userId]
    );

    // Get stats
    const statsResult = await query(
      `SELECT 
        COUNT(*) as total_attempts,
        SUM(score) as total_points,
        AVG(accuracy) as average_accuracy,
        MAX(score) as highest_score,
        SUM(correct_answers) as total_correct,
        SUM(total_questions) as total_questions_attempted
       FROM user_quiz_attempts
       WHERE user_id = ?`,
      [userId]
    );
    const stats = statsResult && statsResult[0];

    res.json({
      success: true,
      data: {
        stats: stats || {},
        recentAttempts: attempts
      }
    });
  } catch (error) {
    console.error('Error getting quiz stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Check and award quiz-related achievements
 */
async function checkQuizAchievements(userId, accuracy, connection) {
  const newAchievements = [];

  try {
    // Get quiz stats
    const [stats] = await connection.execute(
      `SELECT COUNT(*) as total_quizzes, 
              AVG(accuracy) as avg_accuracy,
              COUNT(CASE WHEN accuracy = 100 THEN 1 END) as perfect_scores
       FROM user_quiz_attempts
       WHERE user_id = ?`,
      [userId]
    );

    const quizStats = stats[0];

    // Check for quiz achievements
    const achievementChecks = [
      { type: 'quizzes_completed', value: quizStats.total_quizzes },
      { type: 'perfect_quizzes', value: quizStats.perfect_scores }
    ];

    // Get all achievements
    const [allAchievements] = await connection.execute(
      'SELECT * FROM achievements WHERE condition_type IN (?, ?)',
      ['quizzes_completed', 'perfect_quizzes']
    );

    // Get user's existing achievements
    const [userAchievements] = await connection.execute(
      'SELECT achievement_id FROM user_achievements WHERE user_id = ?',
      [userId]
    );

    const earnedAchievementIds = userAchievements.map(ua => ua.achievement_id);

    // Check each achievement
    for (const achievement of allAchievements) {
      if (earnedAchievementIds.includes(achievement.id)) {
        continue;
      }

      const check = achievementChecks.find(c => c.type === achievement.condition_type);
      if (check && check.value >= achievement.condition_value) {
        // Award achievement
        await connection.execute(
          'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
          [userId, achievement.id]
        );

        newAchievements.push({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          badge_type: achievement.badge_type
        });

        // Notify admins
        try {
          await notifyAdmins(
            'gamification',
            `Achievement unlocked: ${achievement.name}`,
            `/frontend/views/admin/gamification.html`
          );
        } catch (notifError) {
          console.error('Error sending achievement notification:', notifError);
        }
      }
    }

    return newAchievements;
  } catch (error) {
    console.error('Error checking quiz achievements:', error);
    return newAchievements;
  }
}

/**
 * CHECK LEVEL UP (imported from lessonController for consistency)
 * Detects if student reached next level and updates their level
 * Called after XP is earned (quizzes)
 */
async function checkLevelUp(studentId, connection) {
  try {
    const [userXpResult] = await connection.execute(
      `SELECT xp_id, total_xp, current_level, xp_to_next_level 
       FROM user_xp 
       WHERE student_id = ?`,
      [studentId]
    );

    if (!userXpResult || userXpResult.length === 0) {
      return { leveledUp: false, newLevel: null };
    }

    const xp = userXpResult[0];
    const hasLeveledUp = xp.total_xp >= xp.xp_to_next_level;

    if (!hasLeveledUp) {
      return { leveledUp: false, newLevel: null };
    }

    // LEVEL UP!
    const newLevel = xp.current_level + 1;
    const newXpTarget = xp.xp_to_next_level + (50 * newLevel);

    await connection.execute(
      `UPDATE user_xp 
       SET current_level = ?, 
           xp_to_next_level = ?,
           updated_at = NOW()
       WHERE student_id = ?`,
      [newLevel, newXpTarget, studentId]
    );

    // CREATE LEVEL UP NOTIFICATION
    try {
      await connection.execute(
        `INSERT INTO notifications 
         (user_id, notification_type, title, message, related_entity_type, related_entity_id, created_at)
         VALUES (?, 'level_up', ?, ?, 'user_xp', ?, NOW())`,
        [
          studentId,
          `Level Up! 🎉`,
          `Congratulations! You reached level ${newLevel}!`,
          studentId
        ]
      );
    } catch (err) {
      console.error('Error creating level-up notification:', err);
    }

    console.log(`✅ Student ${studentId} leveled up to ${newLevel}`);
    return { leveledUp: true, newLevel };

  } catch (error) {
    console.error('Error checking level up:', error);
    return { leveledUp: false, newLevel: null };
  }
}

/**
 * CHECK MODULE UNLOCKS
 * After a level-up, checks if new modules are now available
 */
async function checkModuleUnlocks(studentId, newLevel, connection) {
  const unlockedModules = [];

  try {
    const [newUnlocks] = await connection.execute(
      `SELECT m.module_id, m.module_name, m.instrument, m.difficulty, 
              m.description, m.xp_reward, mu.required_level
       FROM modules m
       INNER JOIN module_unlocks mu ON m.module_id = mu.module_id
       WHERE mu.required_level = ? AND m.status = 'published'`,
      [newLevel]
    );

    for (const module of newUnlocks || []) {
      try {
        await connection.execute(
          `INSERT INTO notifications 
           (user_id, notification_type, title, message, related_entity_type, related_entity_id, created_at)
           VALUES (?, 'module_unlocked', ?, ?, 'module', ?, NOW())`,
          [
            studentId,
            `New Module Unlocked: ${module.module_name}`,
            `You reached level ${newLevel}! "${module.module_name}" is now available.`,
            module.module_id
          ]
        );

        unlockedModules.push({
          module_id: module.module_id,
          module_name: module.module_name,
          instrument: module.instrument,
          difficulty: module.difficulty,
          xp_reward: module.xp_reward,
          unlocked_at_level: newLevel
        });

        console.log(`✅ Module "${module.module_name}" unlocked for student ${studentId}`);
      } catch (err) {
        console.error(`Error creating unlock notification for module ${module.module_id}:`, err);
      }
    }

    return unlockedModules;

  } catch (error) {
    console.error('Error checking module unlocks:', error);
    return unlockedModules;
  }
}