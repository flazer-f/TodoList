import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonFilePath = path.join(__dirname, '../ToDoList/db.json');

// Initialize Pool (it might fail if credentials are wrong or DB is down)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export let isDbConnected = false;

// Function to test the connection on boot
export const testDbConnection = async () => {
  try {
    const client = await pool.connect();
    isDbConnected = true;
    console.log('✅ Connected to PostgreSQL Database.');
    client.release();
  } catch (err) {
    isDbConnected = false;
    console.warn('⚠️ Could not connect to PostgreSQL Database. Falling back to db.json');
  }
};

// ==========================================
// Fallback JSON Logic
// ==========================================

export const readJsonDb = () => {
  try {
    const data = fs.readFileSync(jsonFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON DB', err);
    return { tasks: [] }; // Default empty state
  }
};

export const writeJsonDb = (data) => {
  try {
    // Preserve the formatting from json-server
    fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing JSON DB', err);
  }
};
