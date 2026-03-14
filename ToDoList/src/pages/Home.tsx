import { useEffect, useState } from 'react';
import { getTasks, updateTask, deleteTask } from '../api';
import type { Task } from '../types';
import TaskCard from '../components/TaskCard';
import { Link } from 'react-router-dom';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Complete' ? 'Incomplete' : 'Complete';
    
    // Optimistic update
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    
    try {
      await updateTask(id, { status: newStatus });
    } catch (err) {
      loadTasks(); // Revert
    }
  };

  const handleDelete = async (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    try {
      await deleteTask(id);
    } catch (err) {
      loadTasks(); // Revert
    }
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '4rem'}}>Loading tasks...</div>;

  return (
    <div>
      <div className="header" style={{ marginBottom: '1.5rem', alignItems: 'center' }}>
        <h2>Your Tasks <span style={{color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 'normal'}}>({tasks.length})</span></h2>
        <Link to="/add" className="btn btn-primary">
          <i className="fi fi-rr-plus"></i> New Task
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <i className="fi fi-rr-clipboard-list-check"></i>
          <p>No tasks found. Get started by adding one!</p>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onToggle={handleToggle} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
