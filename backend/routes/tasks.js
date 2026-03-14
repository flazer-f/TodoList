import express from 'express';
import { isDbConnected, pool, readJsonDb, writeJsonDb } from '../db.js';
import { randomUUID } from 'crypto';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All task routes are protected - you must be logged in
router.use(authenticate);

// GET all tasks (only tasks belonging to the logged-in user)
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    if (isDbConnected) {
      // Join via user_tasks mapping table to get only this user's tasks
      const result = await pool.query(
        `SELECT t.* FROM public.tasks t
         INNER JOIN public.user_tasks ut ON t.id = ut.task_id
         WHERE ut.user_id = $1`,
        [userId]
      );
      res.json(result.rows);
    } else {
      const db = readJsonDb();
      // In fallback mode, filter tasks owned by this user
      const userTasks = db.user_tasks || [];
      const userTaskIds = userTasks.filter(ut => ut.user_id === userId).map(ut => ut.task_id);
      const tasks = (db.tasks || []).filter(t => userTaskIds.includes(t.id));
      res.json(tasks);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single task (only if it belongs to the logged-in user)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (isDbConnected) {
      const result = await pool.query(
        `SELECT t.* FROM public.tasks t
         INNER JOIN public.user_tasks ut ON t.id = ut.task_id
         WHERE t.id = $1 AND ut.user_id = $2`,
        [id, userId]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
      res.json(result.rows[0]);
    } else {
      const db = readJsonDb();
      const userTasks = db.user_tasks || [];
      const owned = userTasks.some(ut => ut.task_id === id && ut.user_id === userId);
      if (!owned) return res.status(404).json({ error: 'Task not found' });
      const task = (db.tasks || []).find(t => t.id === id);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json(task);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new task (automatically linked to the logged-in user)
router.post('/', async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const userId = req.user.id;

    if (isDbConnected) {
      // Insert task, then link it to the user in user_tasks
      const taskResult = await pool.query(
        'INSERT INTO public.tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *',
        [title, description || null, status || 'Incomplete']
      );
      const task = taskResult.rows[0];

      await pool.query(
        'INSERT INTO public.user_tasks (user_id, task_id) VALUES ($1, $2)',
        [userId, task.id]
      );

      res.status(201).json(task);
    } else {
      const db = readJsonDb();
      if (!db.user_tasks) db.user_tasks = [];

      const newTask = {
        id: randomUUID(),
        title,
        description,
        status: status || 'Incomplete'
      };
      db.tasks.push(newTask);
      db.user_tasks.push({ user_id: userId, task_id: newTask.id });
      writeJsonDb(db);
      res.status(201).json(newTask);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH (Edit) a task
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, status } = req.body;

    if (isDbConnected) {
      // Check ownership first
      const ownerCheck = await pool.query(
        'SELECT 1 FROM public.user_tasks WHERE task_id = $1 AND user_id = $2',
        [id, userId]
      );
      if (ownerCheck.rowCount === 0) return res.status(404).json({ error: 'Task not found' });

      const updates = [];
      const values = [];
      let idx = 1;

      if (title !== undefined) { updates.push(`title = $${idx++}`); values.push(title); }
      if (description !== undefined) { updates.push(`description = $${idx++}`); values.push(description); }
      if (status !== undefined) { updates.push(`status = $${idx++}`); values.push(status); }

      if (updates.length === 0) return res.status(400).json({ error: 'No fields provided' });

      values.push(id);
      const query = `UPDATE public.tasks SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`;
      const result = await pool.query(query, values);
      res.json(result.rows[0]);
    } else {
      const db = readJsonDb();
      const userTasks = db.user_tasks || [];
      const owned = userTasks.some(ut => ut.task_id === id && ut.user_id === userId);
      if (!owned) return res.status(404).json({ error: 'Task not found' });

      const index = (db.tasks || []).findIndex(t => t.id === id);
      if (index === -1) return res.status(404).json({ error: 'Task not found' });

      const updatedTask = { ...db.tasks[index], ...req.body };
      db.tasks[index] = updatedTask;
      writeJsonDb(db);
      res.json(updatedTask);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (isDbConnected) {
      const ownerCheck = await pool.query(
        'SELECT 1 FROM public.user_tasks WHERE task_id = $1 AND user_id = $2',
        [id, userId]
      );
      if (ownerCheck.rowCount === 0) return res.status(404).json({ error: 'Task not found' });

      await pool.query('DELETE FROM public.tasks WHERE id = $1', [id]);
      res.json({ message: 'Deleted successfully' });
    } else {
      const db = readJsonDb();
      const userTasks = db.user_tasks || [];
      const owned = userTasks.some(ut => ut.task_id === id && ut.user_id === userId);
      if (!owned) return res.status(404).json({ error: 'Task not found' });

      db.tasks = (db.tasks || []).filter(t => t.id !== id);
      db.user_tasks = userTasks.filter(ut => ut.task_id !== id);
      writeJsonDb(db);
      res.json({ message: 'Deleted successfully' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;