import type { Task } from './types';

const API_URL = 'http://localhost:5001/tasks';
const AUTH_URL = 'http://localhost:5001/auth';

// Get the stored JWT token from localStorage
const getToken = () => localStorage.getItem('token');

// Always returns a headers object (empty if no token)
const authHeader = (): Record<string, string> => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// ---- Tasks ----

export const getTasks = async (): Promise<Task[]> => {
  const res = await fetch(API_URL, {
    headers: { ...authHeader() },
  });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
};

export const getTask = async (id: string): Promise<Task> => {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) throw new Error('Failed to fetch task');
  return res.json();
};

export const addTask = async (task: Omit<Task, 'id'>): Promise<Task> => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error('Failed to add task');
  return res.json();
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
};

export const deleteTask = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() },
  });
  if (!res.ok) throw new Error('Failed to delete task');
};

// ---- Auth ----

export const login = async (email: string, password: string) => {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data; // { token, user }
};

export const register = async (username: string, email: string, password: string) => {
  const res = await fetch(`${AUTH_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data; // { token, user }
};
