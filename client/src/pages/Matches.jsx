import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import http from '../services/http';
import { useToast } from '../components/Toast';
import { CONNECTIONS_CHANGED, emitConnectionsChanged } from '../utils/connectionEvents';
import { normalizeConnectionMap, connectionStatus } from '../utils/connectionMap';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sent, setSent] = useState({});
  const toast = useToast();
  const { key } = useLocation(); // changes on every navigation to this page

  const loadAll = useCallback(async () => {
    try {
      const [matchRes, connRes] = await Promise.all([
        http.get('/match'),
        http.get('/connections/all').catch(() => ({ data: {} }))
      ]);
      const raw = Array.isArray(matchRes.data) ? matchRes.data : [];
      setMatches(
        raw.filter(
          (u) =>
            Number(u.matchData?.score) > 0 &&
            ((u.skillsToTeach || []).length > 0 || (u.skillsToLearn || []).length > 0)
        )
      );
      setSent(normalizeConnectionMap(connRes.data));
    } catch { setMatches([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  // Re-fetch every time user navigates to this page
  useEffect(() => { loadAll(); }, [key, loadAll]);

  const refreshConnections = useCallback(async () => {
    try {
      const connRes = await http.get('/connections/all');
      setSent(normalizeConnectionMap(connRes.data));
    } catch {
      /* ignore */
    }
  }, []);

  // Stay in sync after notifications accept/decline, and when the other user accepts (sender side)
  useEffect(() => {
    const onChange = () => refreshConnections();
    window.addEventListener(CONNECTIONS_CHANGED, onChange);
    const poll = setInterval(refreshConnections, 20000);
    return () => {
      window.removeEventListener(CONNECTIONS_CHANGED, onChange);
      clearInterval(poll);
    };
  }, [refreshConnections]);

  const connect = async (user) => {
    if (!user.id) return;
    const st = connectionStatus(sent, user.id);
    if (st === 'accepted' || st === 'pending') return;
    try {
      await http.post('/connections', { toUserId: user.id });
      setSent((p) => ({ ...p, [String(user.id)]: 'pending' }));
      emitConnectionsChanged();
      toast.success('Connection request sent!');
    } catch (err) {
      if (err.response?.status === 409) {
        const msg = String(err.response?.data?.error || '');
        const connected = /already connected/i.test(msg);
        setSent((p) => ({ ...p, [String(user.id)]: connected ? 'accepted' : 'pending' }));
        emitConnectionsChanged();
      } else toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const btnLabel = (id) => {
    const s = connectionStatus(sent, id);
    if (s === 'accepted') return 'Connected';
    if (s === 'pending') return 'Request sent';
    return 'Connect';
  };

  const btnStyles = (id) => {
    const s = connectionStatus(sent, id);
    if (s === 'accepted') return { ...S.btn, ...S.btnConnected };
    if (s === 'pending') return { ...S.btn, ...S.btnPending };
    return S.btn;
  };

  if (loading) return <div style={S.empty}>Finding your matches...</div>;

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <div>
          <h2 style={S.title}>Skill Matches</h2>
          <p style={S.sub}>Personalized recommendations based on your skill overlap. Users who teach what you want to learn (and vice versa) rank higher.</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>{matches.length} compatible partners found</p>
        </div>
        <button onClick={() => { setRefreshing(true); loadAll(); }} disabled={refreshing} style={S.refreshBtn}>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {matches.length === 0 ? (
        <div style={S.empty}>No matches yet. Add skills to your profile to find partners.</div>
      ) : (
        <div style={S.grid}>
          {matches.map((u) => {
            const st = connectionStatus(sent, u.id);
            const dis = st === 'accepted' || st === 'pending';
            return (
              <div key={u.id} style={S.card}>
                <div style={S.cardTop}>
                  <div>
                    <h3 style={S.name}>{u.name}</h3>
                    <span style={S.meta}>{u.location || u.email || '—'}</span>
                  </div>
                  <div style={S.score}>
                    <span style={S.scoreNum}>{u.matchData?.score || 0}%</span>
                    <span style={S.scoreLabel}>Match</span>
                  </div>
                </div>

                <div style={S.skills}>
                  <div style={{ marginBottom: '0.4rem' }}>
                    <span style={S.skillLabel}>Teaches:</span>
                    {(u.skillsToTeach || []).map((s) => <span key={s} style={S.tag}>{s}</span>)}
                  </div>
                  <div>
                    <span style={S.skillLabel}>Wants:</span>
                    {(u.skillsToLearn || []).map((s) => <span key={s} style={S.tagWarn}>{s}</span>)}
                  </div>
                </div>

                <button type="button" onClick={() => connect(u)} disabled={dis} style={btnStyles(u.id)}>
                  {btnLabel(u.id)}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const S = {
  wrap: { maxWidth: 1100, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' },
  title: { fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.15rem' },
  sub: { fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 },
  refreshBtn: { padding: '0.45rem 1rem', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius)', fontSize: '0.85rem', fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' },
  card: { background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' },
  name: { fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', margin: 0 },
  meta: { fontSize: '0.8rem', color: 'var(--text-muted)' },
  score: { textAlign: 'center', background: 'var(--accent-soft)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.6rem', minWidth: 56 },
  scoreNum: { display: 'block', fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent)' },
  scoreLabel: { fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' },
  skills: { marginBottom: '0.85rem', fontSize: '0.85rem' },
  skillLabel: { color: 'var(--text-secondary)', fontWeight: 600, marginRight: '0.4rem' },
  tag: { display: 'inline-block', background: 'var(--accent-soft)', color: 'var(--accent-text)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', marginRight: 4, marginBottom: 4 },
  tagWarn: { display: 'inline-block', background: 'rgba(217,119,6,0.1)', color: 'var(--warning)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', marginRight: 4, marginBottom: 4 },
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
  empty: { textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '1rem' },
};

export default Matches;
