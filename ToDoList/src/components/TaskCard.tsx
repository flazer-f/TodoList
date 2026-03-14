import type { Task } from '../types';
import { Link } from 'react-router-dom';

interface Props {
  task: Task;
  onToggle: (id: string, currentStatus: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onToggle, onDelete }: Props) {
  const isComplete = task.status === 'Complete';

  return (
    <div className={`task-card ${isComplete ? 'completed' : ''}`}>
      <div className="task-content">
        <div 
          className={`checkbox-wrapper ${isComplete ? 'checked' : ''}`}
          onClick={() => onToggle(task.id, task.status)}
        >
          <i className="fi fi-rr-check"></i>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 className="task-title" style={{ margin: 0 }}>{task.title}</h3>
            <span className={`status-badge ${isComplete ? 'complete' : 'incomplete'}`}>
              {task.status}
            </span>
          </div>
          {task.description && (
            <p style={{ 
              margin: 0, 
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {task.description}
            </p>
          )}
        </div>
      </div>
      <div className="task-actions">
        <Link 
          to={`/edit/${task.id}`}
          className="btn-icon" 
          aria-label="Edit task"
        >
          <i className="fi fi-rr-pencil"></i>
        </Link>
        <button 
          className="btn-icon btn-danger" 
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
        >
          <i className="fi fi-rr-trash"></i>
        </button>
      </div>
    </div>
  );
}
