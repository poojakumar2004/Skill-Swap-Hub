import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import http from '../services/http';
import { useToast } from '../components/Toast';
import { CONNECTIONS_CHANGED, emitConnectionsChanged } from '../utils/connectionEvents';
import { normalizeConnectionMap, connectionStatus } from '../utils/connectionMap';

const SkillMatchPage = () => {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState({});
  const toast = useToast();
  const { key } = useLocation();

  const loadAll = useCallback(async () => {
    try {
      const [mkt, conn] = await Promise.all([
        http.get('/marketplace'),
        http.get('/connections/all').catch(() => ({ data: {} }))
      ]);
      setListings(Array.isArray(mkt.data) ? mkt.data : []);
      setStatus(normalizeConnectionMap(conn.data));
      setError(null);
    } catch { setError('Could not load marketplace.'); }
  }, []);

  // Re-fetch every time user navigates to this page
  useEffect(() => { loadAll(); }, [key, loadAll]);

  const refreshConnections = useCallback(async () => {
    try {
      const conn = await http.get('/connections/all');
      setStatus(normalizeConnectionMap(conn.data));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onChange = () => refreshConnections();
    window.addEventListener(CONNECTIONS_CHANGED, onChange);
    const poll = setInterval(refreshConnections, 20000);
    return () => {
      window.removeEventListener(CONNECTIONS_CHANGED, onChange);
      clearInterval(poll);
    };
  }, [refreshConnections]);

  const filtered = listings.filter((l) => {
    const q = search.toLowerCase();
    return String(l.skillOffered || '').toLowerCase().includes(q) || String(l.skillWanted || '').toLowerCase().includes(q);
  });

  const connect = async (l) => {
    if (!l.userId) return;
    const uid = String(l.userId);
    const st = connectionStatus(status, uid);
    if (st === 'accepted' || st === 'pending') return;
    try {
      await http.post('/connections', { toUserId: l.userId });
      setStatus((p) => ({ ...p, [uid]: 'pending' }));
      emitConnectionsChanged();
      toast.success('Request sent!');
    } catch (err) {
      if (err.response?.status === 409) {
        const msg = String(err.response?.data?.error || '');
        const connected = /already connected/i.test(msg);
        setStatus((p) => ({ ...p, [uid]: connected ? 'accepted' : 'pending' }));
        emitConnectionsChanged();
      } else toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const label = (id) => {
    const s = connectionStatus(status, id);
    return s === 'accepted' ? 'Connected' : s === 'pending' ? 'Request sent' : 'Connect';
  };
  const dis = (id) => {
    const s = connectionStatus(status, id);
    return s === 'accepted' || s === 'pending';
  };
  const btnStyles = (id) => {
    const s = connectionStatus(status, id);
    if (s === 'accepted') return { ...S.btn, ...S.btnConnected };
    if (s === 'pending') return { ...S.btn, ...S.btnPending };
    return S.btn;
  };

  return (
    <div style={S.wrap}>
      <h1 style={S.title}>Marketplace</h1>
      <p style={S.sub}>Browse all users and their skill offerings. Unlike Matches, this is not ranked — use the search bar to find a specific skill you're looking for.</p>
      {error && <p style={{ textAlign: 'center', color: 'var(--danger)' }}>{error}</p>}

      <div style={{ maxWidth: 440, margin: '0 auto 1.5rem' }}>
        <input placeholder="Search skills..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%' }} />
      </div>

      {filtered.length === 0 && !error && <p style={S.empty}>No listings found.</p>}

      <div style={S.grid}>
        {filtered.map((l) => (
          <div key={l.id} style={S.card}>
            <h3 style={S.name}>{l.user}</h3>
            <div style={S.skills}>
              <div><span style={S.labelG}>Offers</span> <strong>{l.skillOffered}</strong></div>
              <div><span style={S.labelO}>Wants</span> <strong>{l.skillWanted}</strong></div>
            </div>
            <div style={S.meta}>{l.availability !== '—' ? `Available: ${l.availability}` : ''}</div>
            <button type="button" onClick={() => connect(l)} disabled={dis(l.userId) || !l.userId} style={btnStyles(l.userId)}>
              {label(l.userId)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const S = {
  wrap: { maxWidth: 1100, margin: '0 auto' },
  title: { fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)', textAlign: 'center', marginBottom: '0.15rem' },
  sub: { textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
  card: { background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' },
  name: { fontSize: '1.05rem', fontWeight: 600, color: 'var(--accent)', margin: '0 0 0.75rem', textAlign: 'center' },
  skills: { display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text)' },
  labelG: { color: 'var(--success)', fontWeight: 600, marginRight: 6 },
  labelO: { color: 'var(--warning)', fontWeight: 600, marginRight: 6 },
  meta: { fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.85rem' },
  btn: { width: '100%', padding: '0.55rem', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.2s, opacity 0.2s, filter 0.2s' },
  btnConnected: {
    background: 'var(--bg-hover)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
    cursor: 'not-allowed',
    opacity: 0.92,
    filter: 'grayscale(1)',
    boxShadow: 'none',
  },
  btnPending: {
    background: 'var(--warning-soft)',
    color: 'var(--warning)',
    border: '1px solid rgba(245,158,11,0.35)',
    cursor: 'not-allowed',
    opacity: 0.95,
    boxShadow: 'none',
  },
  empty: { textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' },
};

export default SkillMatchPage;
