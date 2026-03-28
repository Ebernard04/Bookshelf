import { useState, useEffect } from 'react';
import { authors } from '../api/client';

function Authors() {
  const [authorList, setAuthorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', nationality: '', notes: '', trusted_author: false });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      const res = await authors.getAll();
      setAuthorList(res.data);
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
        await authors.update(editId, form);
      } else {
        await authors.create(form);
      }
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', nationality: '', notes: '', trusted_author: false });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  }

  function handleEdit(author) {
    setForm({
      name: author.name || '',
      nationality: author.nationality || '',
      notes: author.notes || '',
      trusted_author: author.trusted_author || false
    });
    setEditId(author.id);
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this author?')) return;
    try {
      await authors.delete(id);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Authors</h1>
        <button className="btn btn-primary" onClick={() => {
          setShowForm(!showForm);
          setEditId(null);
          setForm({ name: '', nationality: '', notes: '', trusted_author: false });
        }}>
          {showForm ? 'Cancel' : '+ Add Author'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>{editId ? 'Edit Author' : 'Add Author'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Nationality</label>
                <input value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            </div>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="trusted" style={{ width: 'auto' }}
                checked={form.trusted_author}
                onChange={e => setForm({...form, trusted_author: e.target.checked})} />
              <label htmlFor="trusted" style={{ color: 'var(--text-primary)' }}>Trusted Author</label>
            </div>
            <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Save'}</button>
          </form>
        </div>
      )}

      {authorList.length === 0 ? (
        <div className="empty">No authors yet.</div>
      ) : (
        <div className="card">
          {authorList.map((author, i) => (
            <div key={author.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.75rem 0',
              borderBottom: i < authorList.length - 1 ? '1px solid var(--border)' : 'none'
            }}>
              <div>
                <div style={{ fontWeight: 500 }}>
                  {author.name}
                  {author.trusted_author && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--accent)' }}>✓ Trusted</span>
                  )}
                </div>
                {author.nationality && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{author.nationality}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-ghost" onClick={() => handleEdit(author)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(author.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Authors;