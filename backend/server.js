import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testDbConnection } from './db.js';
import tasksRouter from './routes/tasks.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use('/tasks', tasksRouter);

// Database Test and Server Boot
const startServer = async () => {
  await testDbConnection(); // Sets `isDbConnected` flag inside db.js
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
