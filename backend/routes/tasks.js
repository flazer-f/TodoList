import express from 'express';
import { isDbConnected, pool, readJsonDb, writeJsonDb } from '../db.js';
import { randomUUID } from 'crypto';

const router = express.Router();

// GET all tasks
router.get('/', async (req, res) => {
  try {
    if (isDbConnected) {
      const result = await pool.query('SELECT * FROM public.tasks');
      res.json(result.rows);
    } else {
      const db = readJsonDb();
      res.json(db.tasks || []);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single task
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected) {
      const result = await pool.query('SELECT * FROM public.tasks WHERE id = $1', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
      res.json(result.rows[0]);
    } else {
      const db = readJsonDb();
      const task = db.tasks.find(t => t.id === id);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json(task);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, status } = req.body;
    
    if (isDbConnected) {
      const result = await pool.query(
        'INSERT INTO public.tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *',
        [title, description || null, status || 'Incomplete']
      );
      res.status(201).json(result.rows[0]);
    } else {
      const db = readJsonDb();
      const newTask = {
        id: randomUUID(),
        title,
        description,
        status: status || 'Incomplete'
      };
      db.tasks.push(newTask);
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
    const { title, description, status } = req.body;

    if (isDbConnected) {
      // Build dynamic query for Postgres
      const updates = [];
      const values = [];
      let idx = 1;

      if (title !== undefined) { updates.push(`title = $${idx++}`); values.push(title); }
      if (description !== undefined) { updates.push(`description = $${idx++}`); values.push(description); }
      if (status !== undefined) { updates.push(`status = $${idx++}`); values.push(status); }

      if (updates.length === 0) return res.status(400).json({ error: 'No fields provided' });

      // Add ID to values
      values.push(id);
      
      const query = `UPDATE public.tasks SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`;
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
      res.json(result.rows[0]);
    } else {
      const db = readJsonDb();
      const index = db.tasks.findIndex(t => t.id === id);
      
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
    
    if (isDbConnected) {
      const result = await pool.query('DELETE FROM public.tasks WHERE id = $1 RETURNING *', [id]);
      if (result.rowCount === 0) return res.status(404).json({ error: 'Task not found' });
      res.json({ message: 'Deleted successfully' });
    } else {
      const db = readJsonDb();
      const initialLength = db.tasks.length;
      db.tasks = db.tasks.filter(t => t.id !== id);
      
      if (db.tasks.length === initialLength) return res.status(404).json({ error: 'Task not found' });
      
      writeJsonDb(db);
      res.json({ message: 'Deleted successfully' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
