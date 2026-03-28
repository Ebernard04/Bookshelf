import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { books } from '../api/client';

function Dashboard() {
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await books.getAll();
        setAllBooks(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  const finished = allBooks.filter(b => b.status === 'Finished');
  const reading = allBooks.filter(b => b.status === 'Reading');
  const toRead = allBooks.filter(b => b.status === 'To Read');
  const abandoned = allBooks.filter(b => b.status === 'Abandoned');

  const avgRating = finished.filter(b => b.rating_overall).length
    ? (finished.reduce((sum, b) => sum + (b.rating_overall || 0), 0) / finished.filter(b => b.rating_overall).length).toFixed(1)
    : 'N/A';

  const recentlyFinished = [...finished]
    .filter(b => b.end_date)
    .sort((a, b) => new Date(b.end_date) - new Date(a.end_date))
    .slice(0, 6);

  const currentlyReading = reading.slice(0, 3);

  const fiveStars = finished.filter(b => b.rating_overall === 5);

  const stats = [
    { label: 'Total', value: allBooks.length, color: 'var(--text-primary)' },
    { label: 'Finished', value: finished.length, color: 'var(--accent)' },
    { label: 'Reading', value: reading.length, color: 'var(--gold)' },
    { label: 'To Read', value: toRead.length, color: 'var(--blue)' },
    { label: 'Abandoned', value: abandoned.length, color: 'var(--danger)' },
    { label: 'Avg Rating', value: avgRating, color: 'var(--gold)' },
    { label: '5 Stars', value: fiveStars.length, color: 'var(--gold)' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="section-label">Overview</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', marginBottom: '2.5rem' }}>
        {stats.map(stat => (
          <div key={stat.label} style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 600, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {currentlyReading.length > 0 && (
        <>
          <div className="section-label">Currently Reading</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
            {currentlyReading.map(book => (
              <Link key={book.id} to={`/books/${book.id}`} style={{ textDecoration: 'none' }}>
                <div className="card card-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: '0.2rem' }}>{book.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{book.author_name}</div>
                  </div>
                  {book.pages && book.current_page ? (
                    <div style={{ textAlign: 'right', minWidth: '140px' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                        {book.current_page} / {book.pages} pages
                      </div>
                      <div className="progress-bar" style={{ width: '140px' }}>
                        <div className="progress-fill" style={{ width: `${Math.min(100, (book.current_page / book.pages) * 100)}%` }} />
                      </div>
                    </div>
                  ) : (
                    <span className="badge badge-reading">Reading</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="section-label">Recently Finished</div>
      {recentlyFinished.length === 0 ? (
        <div className="empty">No finished books yet.</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {recentlyFinished.map((book, i) => (
            <Link key={book.id} to={`/books/${book.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.9rem 1.25rem',
                borderBottom: i < recentlyFinished.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>{book.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{book.author_name}{book.series_name ? ` · ${book.series_name}` : ''}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  {book.rating_overall && <span className="stars">{'★'.repeat(book.rating_overall)}{'☆'.repeat(5 - book.rating_overall)}</span>}
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', minWidth: '70px', textAlign: 'right' }}>
                    {new Date(book.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {fiveStars.length > 0 && (
        <>
          <div className="section-label" style={{ marginTop: '2.5rem' }}>5 Star Books</div>
          <div className="grid">
            {fiveStars.map(book => (
              <Link key={book.id} to={`/books/${book.id}`} style={{ textDecoration: 'none' }}>
                <div className="card card-hover">
                  <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{book.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{book.author_name}</div>
                  <span className="stars">★★★★★</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;