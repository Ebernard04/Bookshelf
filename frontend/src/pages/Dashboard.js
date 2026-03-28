import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { books } from '../api/client';

function Dashboard() {
  const [stats, setStats] = useState({
    total: 0, finished: 0, reading: 0, to_read: 0, abandoned: 0
  });
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await books.getAll();
        const all = res.data;
        setStats({
          total: all.length,
          finished: all.filter(b => b.status === 'Finished').length,
          reading: all.filter(b => b.status === 'Reading').length,
          to_read: all.filter(b => b.status === 'To Read').length,
          abandoned: all.filter(b => b.status === 'Abandoned').length,
        });
        const recent = all
          .filter(b => b.end_date)
          .sort((a, b) => new Date(b.end_date) - new Date(a.end_date))
          .slice(0, 5);
        setRecentBooks(recent);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  const avgRating = recentBooks.length
    ? (recentBooks.reduce((sum, b) => sum + (b.rating_overall || 0), 0) / recentBooks.length).toFixed(1)
    : 'N/A';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Books', value: stats.total },
          { label: 'Finished', value: stats.finished },
          { label: 'Reading', value: stats.reading },
          { label: 'To Read', value: stats.to_read },
          { label: 'Abandoned', value: stats.abandoned },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--accent)' }}>{stat.value}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Recently Finished</h2>
      {recentBooks.length === 0 ? (
        <div className="empty">No finished books yet — start reading!</div>
      ) : (
        <div className="card">
          {recentBooks.map((book, i) => (
            <div key={book.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.75rem 0',
              borderBottom: i < recentBooks.length - 1 ? '1px solid var(--border)' : 'none'
            }}>
              <div>
                <Link to={`/books/${book.id}`} style={{ fontWeight: 500 }}>{book.title}</Link>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{book.author_name}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="stars">{'★'.repeat(book.rating_overall || 0)}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(book.end_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;