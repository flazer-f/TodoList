import type { Task } from './types';

const API_URL = 'http://localhost:3001/tasks';

export const getTasks = async (): Promise<Task[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
};

export const getTask = async (id: string): Promise<Task> => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch task');
  return res.json();
};

export const addTask = async (task: Omit<Task, 'id'>): Promise<Task> => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error('Failed to add task');
  return res.json();
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
};

export const deleteTask = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete task');
};
