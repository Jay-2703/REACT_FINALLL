import { query } from '../config/db.js';
import { isValidInstrument, isValidDifficulty, isValidStatus } from '../utils/validateEnums.js';

export const createModule = async (req, res) => {
  try {
    const {
      module_name,
      description,
      instrument,
      difficulty,
      required_level = 1,
      xp_reward = 1000,
      estimated_duration_minutes = 0,
      display_order = 1,
      status = 'draft',
      thumbnail_url = null,
    } = req.body;

    if (!module_name || !description) {
      return res.status(400).json({ success: false, message: 'module_name and description are required' });
    }
    if (!isValidInstrument(instrument)) {
      return res.status(400).json({ success: false, message: 'Invalid instrument' });
    }
    if (!isValidDifficulty(difficulty)) {
      return res.status(400).json({ success: false, message: 'Invalid difficulty' });
    }
    if (!isValidStatus(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const result = await query(
      `INSERT INTO modules 
        (module_name, description, instrument, difficulty, required_level, xp_reward, estimated_duration_minutes, display_order, status, thumbnail_url, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?, NOW())`,
      [module_name, description, instrument, difficulty, required_level, xp_reward, estimated_duration_minutes, display_order, status, thumbnail_url]
    );

    const moduleId = result.insertId;

    // insert unlock rule
    await query('INSERT INTO module_unlocks (module_id, required_level) VALUES (?,?)', [moduleId, required_level]);

    res.json({ success: true, data: { module_id: moduleId } });
  } catch (err) {
    console.error('Create module error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createLesson = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const {
      lesson_name,
      description,
      lesson_type = 'video',
      content_url = null,
      text_content = null,
      estimated_duration_minutes = 0,
      xp_reward = 100,
      lesson_order = 1,
      downloadable_resources = null,
    } = req.body;

    if (!lesson_name || !description) {
      return res.status(400).json({ success: false, message: 'lesson_name and description required' });
    }

    const validTypes = ['video', 'interactive', 'reading', 'practice'];
    if (!validTypes.includes(lesson_type)) {
      return res.status(400).json({ success: false, message: 'Invalid lesson_type' });
    }

    // ensure module exists
    const [mod] = await query('SELECT module_id FROM modules WHERE module_id = ?', [moduleId]);
    if (!mod) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const result = await query(
      `INSERT INTO lessons
        (module_id, lesson_name, description, lesson_type, content_url, text_content, estimated_duration_minutes, xp_reward, lesson_order, downloadable_resources, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?, NOW())`,
      [moduleId, lesson_name, description, lesson_type, content_url, text_content, estimated_duration_minutes, xp_reward, lesson_order, downloadable_resources]
    );

    res.json({ success: true, data: { lesson_id: result.insertId } });
  } catch (err) {
    console.error('Create lesson error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
