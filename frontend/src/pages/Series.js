import { useState, useEffect } from 'react';
import { series, universes } from '../api/client';

function Series() {
  const [seriesList, setSeriesList] = useState([]);
  const [universeList, setUniverseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '', universe_id: '', series_type: 'main', status: 'ongoing', notes: ''
  });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      const [sRes, uRes] = await Promise.all([series.getAll(), universes.getAll()]);
      setSeriesList(sRes.data);
      setUniverseList(uRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editId) {
        await series.update(editId, { ...form, universe_id: form.universe_id || null });
      } else {
        await series.create({ ...form, universe_id: form.universe_id || null });
      }
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', universe_id: '', series_type: 'main', status: 'ongoing', notes: '' });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  }

  function handleEdit(s) {
    setForm({
      name: s.name || '',
      universe_id: s.universe_id || '',
      series_type: s.series_type || 'main',
      status: s.status || 'ongoing',
      notes: s.notes || ''
    });
    setEditId(s.id);
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this series?')) return;
    try {
      await series.delete(id);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Series</h1>
        <button className="btn btn-primary" onClick={() => {
          setShowForm(!showForm);
          setEditId(null);
          setForm({ name: '', universe_id: '', series_type: 'main', status: 'ongoing', notes: '' });
        }}>
          {showForm ? 'Cancel' : '+ Add Series'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>{editId ? 'Edit Series' : 'Add Series'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Universe</label>
                <select value={form.universe_id} onChange={e => setForm({...form, universe_id: e.target.value})}>
                  <option value="">Select universe...</option>
                  {universeList.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select value={form.series_type} onChange={e => setForm({...form, series_type: e.target.value})}>
                  <option value="main">Main</option>
                  <option value="novella">Novella</option>
                  <option value="spinoff">Spinoff</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="ongoing">Ongoing</option>
                  <option value="complete">Complete</option>
                  <option value="hiatus">Hiatus</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Save'}</button>
          </form>
        </div>
      )}

      {seriesList.length === 0 ? (
        <div className="empty">No series yet.</div>
      ) : (
        <div className="grid">
          {seriesList.map(s => (
            <div key={s.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <span style={{
                  fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '20px',
                  background: s.status === 'complete' ? '#1a3d2e' : s.status === 'hiatus' ? '#3d2a1a' : '#1a1a3d',
                  color: s.status === 'complete' ? 'var(--accent)' : s.status === 'hiatus' ? 'var(--warning)' : '#6699ff'
                }}>{s.status}</span>
              </div>
              {s.universe_name && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{s.universe_name}</div>
              )}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{s.series_type}</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-ghost" onClick={() => handleEdit(s)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(s.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Series;