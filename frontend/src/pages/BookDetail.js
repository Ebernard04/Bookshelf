import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { books, authors, series } from '../api/client';

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [authorList, setAuthorList] = useState([]);
  const [seriesList, setSeriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        const [bRes, aRes, sRes] = await Promise.all([
          books.getOne(id), authors.getAll(), series.getAll()
        ]);
        setBook(bRes.data);
        setForm(bRes.data);
        setAuthorList(aRes.data);
        setSeriesList(sRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  async function handleSave() {
    try {
      await books.update(id, {
        ...form,
        rating_overall: form.rating_overall || null,
        pages: form.pages || null,
        current_page: form.current_page || null,
        author_id: form.author_id || null,
        series_id: form.series_id || null,
      });
      const res = await books.getOne(id);
      setBook(res.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this book?')) return;
    try {
      await books.delete(id);
      navigate('/books');
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (!book) return <div className="empty">Book not found.</div>;

  const readingDays = book.start_date && book.end_date
    ? Math.ceil((new Date(book.end_date) - new Date(book.start_date)) / (1000 * 60 * 60 * 24))
    : null;

  const progressPct = book.pages && book.current_page
    ? Math.round((book.current_page / book.pages) * 100)
    : null;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/books" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            ← Books
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-ghost" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit'}
          </button>
          {editing && <button className="btn btn-primary" onClick={handleSave}>Save</button>}
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      {editing ? (
        <div className="card">
          <div className="form-row">
            <div className="form-group">
              <label>Title</label>
              <input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Author</label>
              <select value={form.author_id || ''} onChange={e => setForm({ ...form, author_id: e.target.value })}>
                <option value="">Select author...</option>
                {authorList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Series</label>
              <select value={form.series_id || ''} onChange={e => setForm({ ...form, series_id: e.target.value })}>
                <option value="">Select series...</option>
                {seriesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status || ''} onChange={e => setForm({ ...form, status: e.target.value })}>
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
              <input type="number" min="1" max="5" value={form.rating_overall || ''}
                onChange={e => setForm({ ...form, rating_overall: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Format</label>
              <select value={form.format_read || ''} onChange={e => setForm({ ...form, format_read: e.target.value })}>
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
              <input type="date" value={form.start_date ? form.start_date.split('T')[0] : ''}
                onChange={e => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" value={form.end_date ? form.end_date.split('T')[0] : ''}
                onChange={e => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Pages</label>
              <input type="number" value={form.pages || ''}
                onChange={e => setForm({ ...form, pages: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Current Page</label>
              <input type="number" value={form.current_page || ''}
                onChange={e => setForm({ ...form, current_page: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Reading Notes</label>
            <textarea rows={8} value={form.reading_notes || ''}
              onChange={e => setForm({ ...form, reading_notes: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Post-Read Synthesis</label>
            <textarea rows={8} value={form.post_read_synthesis || ''}
              onChange={e => setForm({ ...form, post_read_synthesis: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Strengths / Weaknesses</label>
            <textarea rows={6} value={form.strengths_weaknesses || ''}
              onChange={e => setForm({ ...form, strengths_weaknesses: e.target.value })} />
          </div>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="would_reread" style={{ width: 'auto' }}
              checked={form.would_reread || false}
              onChange={e => setForm({ ...form, would_reread: e.target.checked })} />
            <label htmlFor="would_reread" style={{ color: 'var(--text-primary)' }}>Would Reread</label>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div className="card">
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div style={{
                width: '120px',
                height: '180px',
                background: '#0d1426',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                flexShrink: 0,
                overflow: 'hidden'
              }}>
                {book.cover_url
                  ? <img src={book.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#2a3d5a' }}>📖</div>
                }
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.3rem', lineHeight: 1.2 }}>{book.title}</h1>
                  {book.author_name && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                      by <span style={{ color: 'var(--text-primary)' }}>{book.author_name}</span>
                    </div>
                  )}
                  {book.series_name && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{book.series_name}{book.universe_name ? ` · ${book.universe_name}` : ''}</div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>
                  <span className={`badge badge-${book.status.toLowerCase().replace(' ', '_')}`}>{book.status}</span>
                  {book.rating_overall && (
                    <span className="stars">{'★'.repeat(book.rating_overall)}{'☆'.repeat(5 - book.rating_overall)}</span>
                  )}
                  {book.would_reread && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>↺ Would reread</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                {book.format_read && (
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Format</div>
                    <div style={{ fontSize: '0.85rem' }}>{book.format_read}</div>
                  </div>
                )}
                {book.start_date && (
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Started</div>
                    <div style={{ fontSize: '0.85rem' }}>{new Date(book.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                )}
                {book.end_date && (
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Finished</div>
                    <div style={{ fontSize: '0.85rem' }}>{new Date(book.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                )}
                {readingDays !== null && (
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Read in</div>
                    <div style={{ fontSize: '0.85rem' }}>{readingDays} {readingDays === 1 ? 'day' : 'days'}</div>
                  </div>
                )}
                {book.pages && (
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Pages</div>
                    <div style={{ fontSize: '0.85rem' }}>{book.pages}</div>
                  </div>
                )}
              </div>

              {book.status === 'Reading' && progressPct !== null && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    {book.current_page} / {book.pages} pages ({progressPct}%)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

          {book.reading_notes && (
        <div className="card">
          <div className="section-label">Reading Notes</div>
          <div style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <ReactMarkdown>{book.reading_notes}</ReactMarkdown>
          </div>
        </div>
      )}

      {book.post_read_synthesis && (
        <div className="card">
          <div className="section-label">Post-Read Synthesis</div>
          <div style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <ReactMarkdown>{book.post_read_synthesis}</ReactMarkdown>
          </div>
        </div>
      )}

      {book.strengths_weaknesses && (
        <div className="card">
          <div className="section-label">Strengths / Weaknesses</div>
          <div style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <ReactMarkdown>{book.strengths_weaknesses}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
    </div >
  );
}

export default BookDetail;