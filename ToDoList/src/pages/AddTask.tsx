import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addTask } from '../api';


export default function AddTask() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Complete' | 'Incomplete'>('Incomplete');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await addTask({ title, description, status });
      navigate('/');
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="btn-icon" onClick={() => navigate(-1)}>
          <i className="fi fi-rr-arrow-left"></i>
        </button>
        <h2>Create New Task</h2>
      </div>
      
      <form onSubmit={handleSubmit} style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--card-border)', backdropFilter: 'blur(10px)' }}>
        <div className="form-group">
          <label htmlFor="title">Task Title</label>
          <input 
            type="text" 
            id="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g. Redesign landing page" 
            required 
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (optional)</label>
          <textarea 
            id="description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Add some details about this task..."
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--card-border)',
              background: 'var(--card-bg)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              minHeight: '100px',
              resize: 'vertical'
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Initial Status</label>
          <select 
            id="status" 
            value={status} 
            onChange={(e) => setStatus(e.target.value as 'Complete' | 'Incomplete')}
          >
            <option value="Incomplete" style={{color: '#000'}}>Incomplete</option>
            <option value="Complete" style={{color: '#000'}}>Complete</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
          <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--card-border)' }} onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
