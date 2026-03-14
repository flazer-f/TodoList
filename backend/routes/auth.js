import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { pool, isDbConnected, readJsonDb, writeJsonDb } from '../db.js';
import { randomUUID } from 'crypto';
dotenv.config();

const router = express.Router();
const SALT_ROUNDS = 10;

// POST /auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    if (isDbConnected) {
      // Check if user already exists
      const existing = await pool.query('SELECT id FROM public.users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'A user with this email already exists.' });
      }

      const result = await pool.query(
        'INSERT INTO public.users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
        [username, email, passwordHash]
      );
      const user = result.rows[0];

      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } else {
      // Fallback: save user in db.json
      const db = readJsonDb();
      if (!db.users) db.users = [];

      const existing = db.users.find(u => u.email === email);
      if (existing) {
        return res.status(409).json({ error: 'A user with this email already exists.' });
      }

      const newUser = { id: randomUUID(), username, email, password_hash: passwordHash };
      db.users.push(newUser);
      writeJsonDb(db);

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, username: newUser.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({ token, user: { id: newUser.id, username: newUser.username, email: newUser.email } });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    let user;

    if (isDbConnected) {
      const result = await pool.query('SELECT * FROM public.users WHERE email = $1', [email]);
      user = result.rows[0];
    } else {
      const db = readJsonDb();
      if (!db.users) db.users = [];
      user = db.users.find(u => u.email === email);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
