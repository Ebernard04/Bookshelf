import { useState, useEffect } from 'react';
import { readingLog, books } from '../api/client';

function ReadingLog() {
  const [log, setLog] = useState([]);
  const [bookList, setBookList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    log_date: new Date().toISOString().split('T')[0],
    event_type: 'started',
    book_id: '',
    note: ''
  });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      const [lRes, bRes] = await Promise.all([readingLog.getAll(), books.getAll()]);
      setLog(lRes.data);
      setBookList(bRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await readingLog.create({ ...form, book_id: form.book_id || null });
      setShowForm(false);
      setForm({
        log_date: new Date().toISOString().split('T')[0],
        event_type: 'started',
        book_id: '',
        note: ''
      });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this log entry?')) return;
    try {
      await readingLog.delete(id);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  }

  const eventColors = {
    started: { bg: '#1a1a3d', color: '#6699ff' },
    finished: { bg: '#1a3d2e', color: '#4ecca3' },
    note: { bg: '#2d2a1a', color: '#f5a623' },
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reading Log</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Entry'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Add Log Entry</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={form.log_date}
                  onChange={e => setForm({...form, log_date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Event</label>
                <select value={form.event_type} onChange={e => setForm({...form, event_type: e.target.value})}>
                  <option value="started">Started</option>
                  <option value="finished">Finished</option>
                  <option value="note">Note</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Book</label>
              <select value={form.book_id} onChange={e => setForm({...form, book_id: e.target.value})}>
                <option value="">Select book...</option>
                {bookList.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Note</label>
              <textarea value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary">Save Entry</button>
          </form>
        </div>
      )}

      {log.length === 0 ? (
        <div className="empty">No log entries yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {log.map(entry => (
            <div key={entry.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '90px', fontSize: '0.85rem', color: 'var(--text-muted)', paddingTop: '0.2rem' }}>
                  {new Date(entry.log_date).toLocaleDateString()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{
                      fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '20px',
                      background: eventColors[entry.event_type]?.bg,
                      color: eventColors[entry.event_type]?.color
                    }}>{entry.event_type}</span>
                    {entry.book_title && (
                      <span style={{ fontWeight: 500 }}>{entry.book_title}</span>
                    )}
                  </div>
                  {entry.note && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{entry.note}</div>
                  )}
                </div>
              </div>
              <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                onClick={() => handleDelete(entry.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReadingLog;