import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTask, updateTask } from '../api';

export default function EditTask() {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Complete' | 'Incomplete'>('Incomplete');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        if (id) {
          const task = await getTask(id);
          setTitle(task.title);
          setDescription(task.description || '');
          setStatus(task.status);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !id) return;

    setSubmitting(true);
    try {
      await updateTask(id, { title, description, status });
      navigate('/');
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-state">Loading task...</div>;

  return (
    <div>
      <div className="page-header">
        <button className="btn-icon" onClick={() => navigate(-1)} aria-label="Go back">
          <i className="fi fi-rr-arrow-left"></i>
        </button>
        <h2>Edit Task</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
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
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add some details about this task..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'Complete' | 'Incomplete')}
          >
            <option value="Incomplete" style={{ color: '#000' }}>Incomplete</option>
            <option value="Complete" style={{ color: '#000' }}>Complete</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
