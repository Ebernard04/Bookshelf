import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function Settings() {
  const [enriching, setEnriching] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    checkStatus();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  async function checkStatus() {
    try {
      const res = await axios.get('/api/books/enrich-status');
      setStatus(res.data);
      if (res.data.running) {
        setEnriching(true);
        startPolling();
      }
    } catch (err) {
      console.error(err);
    }
  }

  function startPolling() {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await axios.get('/api/books/enrich-status');
        setStatus(res.data);
        if (!res.data.running) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setEnriching(false);
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);
  }

  async function handleEnrichAll() {
    if (!window.confirm('This will fetch covers and page counts for all books missing this data. Continue?')) return;
    setEnriching(true);
    setError(null);
    try {
      const res = await axios.post('/api/books/enrich-all');
      setStatus(res.data);
      startPolling();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setEnriching(false);
    }
  }

  const pct = status?.total > 0
    ? Math.round(((status.completed + status.failed) / status.total) * 100)
    : 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="section-label">Data Management</div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Enrich Books from Google Books</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Automatically fetch covers, page counts and ISBNs for all books missing this data.
            </div>

            {status && status.total > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  <span>{status.completed} enriched · {status.failed} not found · {status.total} total</span>
                  <span>{pct}%</span>
                </div>
                <div className="progress-bar" style={{ height: '6px' }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: status.done ? 'var(--accent)' : 'var(--gold)' }} />
                </div>
                {status.done && (
                  <div style={{ marginTop: '0.6rem', fontSize: '0.85rem', color: 'var(--accent)' }}>
                    ✓ Enrichment complete — {status.completed} books updated
                  </div>
                )}
                {status.running && (
                  <div style={{ marginTop: '0.6rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Running in background — page will update automatically...
                  </div>
                )}
              </div>
            )}
            {status && status.total === 0 && status.done === false && (
                <div style={{ marginTop: '0.6rem', fontSize: '0.85rem', color: 'var(--accent)' }}>
                    ✓ All books are already enriched
                </div>
            )}

            {error && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--danger)' }}>✗ {error}</div>
            )}
          </div>

          <button
            className="btn btn-primary"
            onClick={handleEnrichAll}
            disabled={enriching}
            style={{ marginLeft: '1.5rem', flexShrink: 0 }}>
            {enriching ? 'Running...' : 'Enrich All Books'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;