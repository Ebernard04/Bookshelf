import { useState, useEffect } from 'react';
import { universes, authors } from '../api/client';

function Universes() {
  const [universeList, setUniverseList] = useState([]);
  const [authorList, setAuthorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '', creator_id: '', themes: '', status: 'active', notes: ''
  });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      const [uRes, aRes] = await Promise.all([universes.getAll(), authors.getAll()]);
      setUniverseList(uRes.data);
      setAuthorList(aRes.data);
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
        await universes.update(editId, { ...form, creator_id: form.creator_id || null });
      } else {
        await universes.create({ ...form, creator_id: form.creator_id || null });
      }
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', creator_id: '', themes: '', status: 'active', notes: '' });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  }

  function handleEdit(u) {
    setForm({
      name: u.name || '',
      creator_id: u.creator_id || '',
      themes: u.themes || '',
      status: u.status || 'active',
      notes: u.notes || ''
    });
    setEditId(u.id);
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this universe?')) return;
    try {
      await universes.delete(id);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Universes</h1>
        <button className="btn btn-primary" onClick={() => {
          setShowForm(!showForm);
          setEditId(null);
          setForm({ name: '', creator_id: '', themes: '', status: 'active', notes: '' });
        }}>
          {showForm ? 'Cancel' : '+ Add Universe'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>{editId ? 'Edit Universe' : 'Add Universe'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Creator</label>
                <select value={form.creator_id} onChange={e => setForm({...form, creator_id: e.target.value})}>
                  <option value="">Select author...</option>
                  {authorList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="active">Active</option>
                  <option value="complete">Complete</option>
                  <option value="dormant">Dormant</option>
                </select>
              </div>
              <div className="form-group">
                <label>Themes</label>
                <input value={form.themes} onChange={e => setForm({...form, themes: e.target.value})} />
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

      {universeList.length === 0 ? (
        <div className="empty">No universes yet.</div>
      ) : (
        <div className="grid">
          {universeList.map(u => (
            <div key={u.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 600 }}>{u.name}</div>
                <span style={{
                  fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '20px',
                  background: u.status === 'complete' ? '#1a3d2e' : u.status === 'dormant' ? '#3d2a1a' : '#1a1a3d',
                  color: u.status === 'complete' ? 'var(--accent)' : u.status === 'dormant' ? 'var(--warning)' : '#6699ff'
                }}>{u.status}</span>
              </div>
              {u.creator_name && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>by {u.creator_name}</div>
              )}
              {u.themes && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{u.themes}</div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-ghost" onClick={() => handleEdit(u)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(u.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Universes;