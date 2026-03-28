import { useState } from 'react';
import axios from 'axios';

function Settings() {
  const [enriching, setEnriching] = useState(false);
  const [enrichResult, setEnrichResult] = useState(null);
  const [enrichError, setEnrichError] = useState(null);

  async function handleEnrichAll() {
    if (!window.confirm('This will fetch covers and page counts for all books missing this data. It may take several minutes. Continue?')) return;
    setEnriching(true);
    setEnrichResult(null);
    setEnrichError(null);
    try {
      const res = await axios.post('/api/books/enrich-all');
      setEnrichResult(res.data);
    } catch (err) {
      setEnrichError(err.response?.data?.error || err.message);
    } finally {
      setEnriching(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="section-label">Data Management</div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Enrich Books from Google Books</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Automatically fetch covers, page counts and ISBNs for all books missing this data.
              Runs in the background — may take a few minutes.
            </div>
            {enrichResult && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--accent)' }}>
                ✓ {enrichResult.message}
              </div>
            )}
            {enrichError && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--danger)' }}>
                ✗ {enrichError}
              </div>
            )}
          </div>
          <button
            className="btn btn-primary"
            onClick={handleEnrichAll}
            disabled={enriching}
            style={{ marginLeft: '1.5rem', flexShrink: 0 }}>
            {enriching ? 'Starting...' : 'Enrich All Books'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;