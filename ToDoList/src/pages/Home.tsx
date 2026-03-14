import { useEffect, useState } from 'react';
import { getTasks, updateTask, deleteTask } from '../api';
import type { Task } from '../types';
import TaskCard from '../components/TaskCard';
import { Link } from 'react-router-dom';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter, Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Complete' | 'Incomplete'>('All');
  const [sortBy, setSortBy] = useState<'Default' | 'Name' | 'Status'>('Default');

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

  // Compute filtered and sorted tasks
  const filteredAndSortedTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'All' || task.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'Name') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'Status') {
        return a.status.localeCompare(b.status);
      }
      return 0; // Default: insertion order (as returned by API)
    });

  if (loading) return <div className="loading-state">Loading tasks...</div>;

  return (
    <div>
      <div className="header page-header">
        <h2>Your Tasks <span className="task-count">({tasks.length})</span></h2>
        <Link to="/add" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <i className="fi fi-rr-plus"></i> New Task
        </Link>
      </div>

      <div className="filter-bar">
        <div className="search-input">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
            <option value="All" className="select-option">All Statuses</option>
            <option value="Incomplete" className="select-option">Incomplete</option>
            <option value="Complete" className="select-option">Complete</option>
          </select>
        </div>
        <div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
            <option value="Default" className="select-option">Sort by Default</option>
            <option value="Name" className="select-option">Sort by Name</option>
            <option value="Status" className="select-option">Sort by Status</option>
          </select>
        </div>
      </div>

      {filteredAndSortedTasks.length === 0 ? (
        <div className="empty-state">
          <i className="fi fi-rr-clipboard-list-check"></i>
          <p>No tasks found. Try adjusting your filters or search.</p>
        </div>
      ) : (
        <div className="task-list">
          {filteredAndSortedTasks.map(task => (
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
