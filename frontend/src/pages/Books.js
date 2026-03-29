import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { books, authors, series } from '../api/client';

function Books() {
  const [bookList, setBookList] = useState([]);
  const [authorList, setAuthorList] = useState([]);
  const [seriesList, setSeriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', author_id: '', series_id: '', status: 'To Read',
    rating_overall: '', would_reread: false, start_date: '', end_date: '',
    format_read: '', pages: '', current_page: '', reading_notes: '',
    post_read_synthesis: '', strengths_weaknesses: ''
  });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      const [bRes, aRes, sRes] = await Promise.all([
        books.getAll(), authors.getAll(), series.getAll()
      ]);
      setBookList(bRes.data);
      setAuthorList(aRes.data);
      setSeriesList(sRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await books.create({
        ...form,
        rating_overall: form.rating_overall || null,
        pages: form.pages || null,
        current_page: form.current_page || null,
        author_id: form.author_id || null,
        series_id: form.series_id || null,
      });
      setShowForm(false);
      setForm({
        title: '', author_id: '', series_id: '', status: 'To Read',
        rating_overall: '', would_reread: false, start_date: '', end_date: '',
        format_read: '', pages: '', current_page: '', reading_notes: '',
        post_read_synthesis: '', strengths_weaknesses: ''
      });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = bookList
    .filter(b => filter === 'all' || b.status === filter)
    .filter(b =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.author_name || '').toLowerCase().includes(search.toLowerCase())
    );

  const statusCounts = {
    all: bookList.length,
    Finished: bookList.filter(b => b.status === 'Finished').length,
    Reading: bookList.filter(b => b.status === 'Reading').length,
    'To Read': bookList.filter(b => b.status === 'To Read').length,
    Abandoned: bookList.filter(b => b.status === 'Abandoned').length,
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Books</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Book'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>Add New Book</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Title *</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Author</label>
                <select value={form.author_id} onChange={e => setForm({ ...form, author_id: e.target.value })}>
                  <option value="">Select author...</option>
                  {authorList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Series</label>
                <select value={form.series_id} onChange={e => setForm({ ...form, series_id: e.target.value })}>
                  <option value="">Select series...</option>
                  {seriesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option>To Read</option>
                  <option>Reading</option>
                  <option>Finished</option>
                  <option>Abandoned</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Rating (1-5)</label>
                <input type="number" min="1" max="5" value={form.rating_overall}
                  onChange={e => setForm({ ...form, rating_overall: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Format</label>
                <select value={form.format_read} onChange={e => setForm({ ...form, format_read: e.target.value })}>
                  <option value="">Select...</option>
                  <option>ebook</option>
                  <option>physical</option>
                  <option>audiobook</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Pages</label>
                <input type="number" value={form.pages} onChange={e => setForm({ ...form, pages: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Current Page</label>
                <input type="number" value={form.current_page} onChange={e => setForm({ ...form, current_page: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Reading Notes</label>
              <textarea value={form.reading_notes} onChange={e => setForm({ ...form, reading_notes: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Post-Read Synthesis</label>
              <textarea value={form.post_read_synthesis} onChange={e => setForm({ ...form, post_read_synthesis: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Strengths / Weaknesses</label>
              <textarea value={form.strengths_weaknesses} onChange={e => setForm({ ...form, strengths_weaknesses: e.target.value })} />
            </div>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="would_reread" style={{ width: 'auto' }}
                checked={form.would_reread}
                onChange={e => setForm({ ...form, would_reread: e.target.checked })} />
              <label htmlFor="would_reread" style={{ color: 'var(--text-primary)' }}>Would Reread</label>
            </div>
            <button type="submit" className="btn btn-primary">Save Book</button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Search books or authors..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '260px' }}
        />
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[['all', 'All'], ['Finished', 'Finished'], ['Reading', 'Reading'], ['To Read', 'To Read'], ['Abandoned', 'Abandoned']].map(([val, label]) => (
            <button key={val}
              className={`btn ${filter === val ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(val)}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}>
              {label} <span style={{ opacity: 0.6, marginLeft: '3px' }}>{statusCounts[val]}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">No books found.</div>
      ) : (
        <div className="grid">
          {filtered.map(book => (
            <Link key={book.id} to={`/books/${book.id}`} style={{ textDecoration: 'none' }}>
              <div className="card card-hover" style={{ height: '100%' }}>
                <div style={{
                  height: '140px',
                  background: '#0d1426',
                  borderRadius: 'var(--radius)',
                  marginBottom: '0.75rem',
                  overflow: 'hidden',
                  border: '1px solid var(--border)'
                }}>
                  {book.cover_url
                    ? <img src={book.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2a3d5a', fontSize: '2rem' }}>📖</div>
                  }
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span className={`badge badge-${book.status.toLowerCase().replace(' ', '_')}`}>{book.status}</span>
                  {book.rating_overall && <span className="stars">{'★'.repeat(book.rating_overall)}</span>}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {book.title}
                </div>
                {book.author_name && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>{book.author_name}</div>
                )}
                {book.series_name && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{book.series_name}</div>
                )}
                {book.status === 'Reading' && book.pages && book.current_page && (
                  <div style={{ marginTop: '0.6rem' }}>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.min(100, (book.current_page / book.pages) * 100)}%` }} />
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                      {book.current_page} / {book.pages} pages
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Books;