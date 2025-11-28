import { query, getConnection } from '../config/db.js';
import { verifyToken } from '../utils/jwt.js';
import { notifyAdmins } from '../services/notificationService.js';

/**
 * Lesson Controller
 * Handles learning modules, lessons, progress, and gamification
 */

/**
 * Get all instruments (from modules table)
 * GET /api/lessons/instruments
 */
export const getInstruments = async (req, res) => {
  try {
    // Get unique instruments from modules table
    const instruments = await query(
      `SELECT DISTINCT instrument FROM modules WHERE status = 'published' ORDER BY instrument ASC`
    );

    // Format as objects if needed
    const formattedInstruments = instruments.map((row, idx) => ({
      id: idx + 1,
      name: row.instrument,
      display_order: idx + 1
    }));

    res.json({
      success: true,
      data: formattedInstruments
    });
  } catch (error) {
    console.error('Error getting instruments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all active badges definitions
 * GET /api/lessons/badges
 */
export const getAllBadges = async (req, res) => {
  try {
    const badges = await query(
      'SELECT badge_id, badge_name, description, badge_type, criteria, xp_reward, badge_icon_url, rarity, is_active FROM badges WHERE is_active = 1 ORDER BY badge_id ASC'
    );

    res.json({
      success: true,
      data: badges,
    });
  } catch (error) {
    console.error('Error getting all badges:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Get all modules for an instrument
 * GET /api/lessons/modules/:instrument
 */
export const getModules = async (req, res) => {
  try {
    const { instrument } = req.params;

    // Get modules with lesson count for this instrument
    const modules = await query(
      `SELECT m.*, COUNT(l.lesson_id) as lesson_count
       FROM modules m
       LEFT JOIN lessons l ON m.module_id = l.module_id
       WHERE m.instrument = ? AND m.status = 'published'
       GROUP BY m.module_id
       ORDER BY m.required_level ASC, m.display_order ASC`,
      [instrument]
    );

    res.json({
      success: true,
      data: modules
    });
  } catch (error) {
    console.error('Error getting modules:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all lessons for a module
 * GET /api/lessons/modules/:instrument/:moduleId
 */
export const getModuleLessons = async (req, res) => {
  try {
    const { instrument, moduleId } = req.params;

    // Get module
    const [module] = await query(
      'SELECT * FROM modules WHERE module_id = ? AND instrument = ?',
      [moduleId, instrument]
    );

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Get lessons
    const lessons = await query(
      'SELECT * FROM lessons WHERE module_id = ? ORDER BY lesson_order ASC',
      [moduleId]
    );

    res.json({
      success: true,
      data: {
        module,
        lessons
      }
    });
  } catch (error) {
    console.error('Error getting module lessons:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get single lesson content
 * GET /api/lessons/lesson/:lessonId
 */
export const getLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const [lesson] = await query(
      `SELECT l.*, m.module_name, m.required_level, m.instrument
       FROM lessons l
       JOIN modules m ON l.module_id = m.module_id
       WHERE l.lesson_id = ?`,
      [lessonId]
    );

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Error getting lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Mark lesson as complete
 * POST /api/lessons/complete
 */
export const completeLesson = async (req, res) => {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();

    const { lessonId } = req.body;

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

    const studentId = decoded.id;

    // Check if lesson exists
    const [lessons] = await connection.execute(
      'SELECT * FROM lessons WHERE lesson_id = ?',
      [lessonId]
    );

    if (!lessons || lessons.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    const lesson = lessons[0];

    // Check if already completed
    const [existing] = await connection.execute(
      'SELECT * FROM lesson_progress WHERE student_id = ? AND lesson_id = ?',
      [studentId, lessonId]
    );

    if (existing && existing.length > 0) {
      await connection.rollback();
      return res.json({
        success: true,
        message: 'Lesson already completed',
        alreadyCompleted: true
      });
    }

    // Mark lesson as complete
    const xpEarned = lesson.xp_reward || 100;
    await connection.execute(
      'INSERT INTO lesson_progress (student_id, lesson_id, status, progress_percentage, xp_earned, completed_at) VALUES (?, ?, "completed", 100, ?, NOW())',
      [studentId, lessonId, xpEarned]
    );

    // Update user XP
    const [userXp] = await connection.execute(
      'SELECT * FROM user_xp WHERE student_id = ?',
      [studentId]
    );

    if (userXp && userXp.length > 0) {
      await connection.execute(
        `UPDATE user_xp 
         SET total_xp = total_xp + ?, 
             total_lessons_completed = total_lessons_completed + 1,
             updated_at = NOW()
         WHERE student_id = ?`,
        [xpEarned, studentId]
      );
    } else {
      await connection.execute(
        'INSERT INTO user_xp (student_id, total_xp, current_level, total_lessons_completed) VALUES (?, ?, 1, 1)',
        [studentId, xpEarned]
      );
    }

    // Check and award badges
    const newBadges = await checkAndAwardBadges(studentId, connection);

    // CHECK FOR LEVEL UP (NEW!)
    const levelUpData = await checkLevelUp(studentId, connection);
    
    // CHECK FOR MODULE UNLOCKS (NEW!)
    let unlockedModules = [];
    if (levelUpData.leveledUp) {
      unlockedModules = await checkModuleUnlocks(studentId, levelUpData.newLevel, connection);
    }

    await connection.commit();

    // Get updated user XP
    const [updatedXp] = await query(
      'SELECT * FROM user_xp WHERE student_id = ?',
      [studentId]
    );

    // Get student name for notification
    const [student] = await query(
      'SELECT first_name, last_name FROM users WHERE id = ?',
      [studentId]
    );
    const studentName = student ? `${student.first_name} ${student.last_name}`.trim() : 'Student';

    // Send admin notification for lesson completion
    try {
      await notifyAdmins(
        'lesson_completed',
        `LESSON COMPLETED\nStudent: ${studentName}\nLesson: ${lesson.lesson_name}\nXP Earned: +${xpEarned}\nTotal XP: ${updatedXp?.total_xp || xpEarned}\nLevel: ${updatedXp?.current_level || 1}`,
        `/admin/users`
      );
    } catch (notifErr) {
      console.warn('Warning: Failed to send admin lesson completion notification:', notifErr.message);
    }

    // Send admin notification for badge achievements
    if (newBadges && newBadges.length > 0) {
      try {
        const badgeDetails = newBadges.map(b => `${b.badge_name}`).join(', ');
        await notifyAdmins(
          'badge_earned',
          `BADGES EARNED\nStudent: ${studentName}\nBadges: ${badgeDetails}`,
          `/admin/users`
        );
      } catch (notifErr) {
        console.warn('Warning: Failed to send admin badge notification:', notifErr.message);
      }
    }

    // Send admin notification for level up
    if (levelUpData.leveledUp) {
      try {
        await notifyAdmins(
          'level_up',
          `LEVEL UP\nStudent: ${studentName}\nNew Level: ${levelUpData.newLevel}\nTotal XP: ${updatedXp?.total_xp || xpEarned}`,
          `/admin/users`
        );
      } catch (notifErr) {
        console.warn('Warning: Failed to send admin level up notification:', notifErr.message);
      }
    }

    res.json({
      success: true,
      message: 'Lesson completed!',
      data: {
        xpEarned,
        totalXp: updatedXp?.total_xp || xpEarned,
        currentLevel: updatedXp?.current_level || 1,
        xpToNextLevel: updatedXp?.xp_to_next_level || 500,
        levelUp: levelUpData.leveledUp,
        newLevel: levelUpData.leveledUp ? levelUpData.newLevel : null,
        unlockedModules,
        badges: newBadges
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error completing lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

/**
 * Get user progress
 * GET /api/lessons/progress
 */
export const getUserProgress = async (req, res) => {
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

    const studentId = decoded.id;

    // Get user XP
    let [userXp] = await query(
      'SELECT * FROM user_xp WHERE student_id = ?',
      [studentId]
    );

    // If no XP record exists, create one with zeros
    if (!userXp || userXp.length === 0) {
      await query(
        'INSERT INTO user_xp (student_id, total_xp, current_level) VALUES (?, 0, 1)',
        [studentId]
      );
      [userXp] = await query(
        'SELECT * FROM user_xp WHERE student_id = ?',
        [studentId]
      );
    }

    userXp = userXp[0];

    // Get completed lessons
    const completedLessons = await query(
      `SELECT lp.*, l.lesson_name, l.module_id, l.xp_reward, m.module_name, m.instrument
       FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.lesson_id
       JOIN modules m ON l.module_id = m.module_id
       WHERE lp.student_id = ? AND lp.status = 'completed'
       ORDER BY lp.completed_at DESC`,
      [studentId]
    );

    // Get user badges
    const userBadges = await query(
      `SELECT ub.*, b.badge_name, b.description, b.badge_icon_url
       FROM user_badges ub
       JOIN badges b ON ub.badge_id = b.badge_id
       WHERE ub.student_id = ?
       ORDER BY ub.earned_at DESC`,
      [studentId]
    );

    // Calculate progress percentages
    const [totalLessonsResult] = await query('SELECT COUNT(*) as total FROM lessons');
    const totalLessonsCount = totalLessonsResult.total || 0;
    const completedCount = completedLessons.length;
    const progressPercentage = totalLessonsCount > 0 
      ? Math.round((completedCount / totalLessonsCount) * 100) 
      : 0;

    res.json({
      success: true,
      data: {
        xp: {
          total_xp: userXp.total_xp,
          current_level: userXp.current_level,
          xp_to_next_level: userXp.xp_to_next_level,
          current_streak_days: userXp.current_streak_days
        },
        completedLessons: completedCount,
        totalLessons: totalLessonsCount,
        progressPercentage,
        completedLessonsList: completedLessons,
        badges: userBadges
      }
    });
  } catch (error) {
    console.error('Error getting user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Check and award badges
 */
async function checkAndAwardBadges(studentId, connection) {
  const newBadges = [];

  try {
    // Get user stats
    const [userXpResult] = await connection.execute(
      'SELECT * FROM user_xp WHERE student_id = ?',
      [studentId]
    );

    if (!userXpResult || userXpResult.length === 0) {
      return newBadges;
    }

    const userXp = userXpResult[0];

    // Get all badges
    const [allBadges] = await connection.execute(
      'SELECT * FROM badges WHERE is_active = 1',
      []
    );

    // Get user's existing badges
    const [userBadgesResult] = await connection.execute(
      'SELECT badge_id FROM user_badges WHERE student_id = ?',
      [studentId]
    );

    const earnedBadgeIds = userBadgesResult.map(ub => ub.badge_id);

    // Check each badge
    for (const badge of allBadges) {
      // Skip if already earned
      if (earnedBadgeIds.includes(badge.badge_id)) {
        continue;
      }

      let shouldAward = false;

      // Simple criteria matching
      if (badge.badge_type === 'milestone') {
        // Award if total_lessons_completed matches criteria
        if (userXp.total_lessons_completed >= 1) {
          shouldAward = true;
        }
      } else if (badge.badge_type === 'streak') {
        // Award if streak matches
        if (userXp.current_streak_days >= 7) {
          shouldAward = true;
        }
      }

      if (shouldAward) {
        // Award badge
        await connection.execute(
          'INSERT INTO user_badges (student_id, badge_id, earned_at) VALUES (?, ?, NOW())',
          [studentId, badge.badge_id]
        );

        newBadges.push({
          id: badge.badge_id,
          name: badge.badge_name,
          description: badge.description,
          icon: badge.badge_icon_url
        });
      }
    }

    return newBadges;
  } catch (error) {
    console.error('Error checking badges:', error);
    return newBadges;
  }
}

/**
 * CHECK LEVEL UP
 * Detects if student reached next level and updates their level
 * Called after XP is earned (lessons, quizzes, etc.)
 * 
 * LEVEL CALCULATION:
 * Each level requires exponentially more XP
 * Level 1: 0-499 XP
 * Level 2: 500-1249 XP (need 750 more)
 * Level 3: 1250-2499 XP (need 1250 more)
 * Formula: xp_to_next_level = xp_to_next_level + (50 * N)
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
      // Continue even if notification fails
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
 * Queries module_unlocks table to find modules unlocked at this level
 * Creates notifications for newly unlocked modules
 * 
 * FLOW:
 * 1. Find all modules that require current_level
 * 2. Create notifications for each
 * 3. Return list of unlocked module info
 */
async function checkModuleUnlocks(studentId, newLevel, connection) {
  const unlockedModules = [];

  try {
    // Query module_unlocks to find modules unlocked at this level
    const [newUnlocks] = await connection.execute(
      `SELECT m.module_id, m.module_name, m.instrument, m.difficulty, 
              m.description, m.xp_reward, mu.required_level
       FROM modules m
       INNER JOIN module_unlocks mu ON m.module_id = mu.module_id
       WHERE mu.required_level = ? AND m.status = 'published'`,
      [newLevel]
    );

    // For each newly unlocked module, create notification
    for (const module of newUnlocks || []) {
      try {
        // Create notification
        await connection.execute(
          `INSERT INTO notifications 
           (user_id, notification_type, title, message, related_entity_type, related_entity_id, created_at)
           VALUES (?, 'module_unlocked', ?, ?, 'module', ?, NOW())`,
          [
            studentId,
            `New Module Unlocked: ${module.module_name}`,
            `You reached level ${newLevel}! "${module.module_name}" is now available. ${module.description ? module.description : ''}`,
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
        // Continue even if one notification fails
      }
    }

    return unlockedModules;

  } catch (error) {
    console.error('Error checking module unlocks:', error);
    return unlockedModules;
  }
}

