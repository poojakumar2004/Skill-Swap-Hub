import React, { useState, useEffect } from 'react';
import http from '../services/http';
import { useToast } from '../components/Toast';

const PeerLearning = () => {
  const [sessions, setSessions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatedLinks, setGeneratedLinks] = useState({});
  const toast = useToast();

  useEffect(() => {
    (async () => {
      try {
        const [sR, mR] = await Promise.allSettled([http.get('/sessions'), http.get('/match')]);
        if (sR.status === 'fulfilled') {
          const email = localStorage.getItem('userEmail') || '';
          setSessions((sR.value.data || []).filter((s) => s.bookedBy?.includes(email)));
        }
        if (mR.status === 'fulfilled') setMatches((mR.value.data || []).slice(0, 6));
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const generateLink = (key) => {
    const link = 'https://meet.google.com/new';
    setGeneratedLinks((p) => ({ ...p, [key]: link }));
  };

  const copyLink = (key) => {
    const link = generatedLinks[key];
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      toast.success('Meeting link copied! Paste it in Chat to invite your peer.');
    }).catch(() => {
      // Fallback for older browsers
      toast.info('Link: ' + link);
    });
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div style={S.wrap}>
      <h2 style={S.title}>Peer Learning</h2>
      <p style={S.sub}>Start a video session with your learning partners</p>

      {/* How it works */}
      <div style={S.howTo}>
        <div style={S.howToTitle}>How it works</div>
        <div style={S.steps}>
          <div style={S.step}><span style={S.stepNum}>1</span> Generate a meeting link below</div>
          <div style={S.step}><span style={S.stepNum}>2</span> Copy the link</div>
          <div style={S.step}><span style={S.stepNum}>3</span> Paste it in <strong>Chat</strong> to share with your peer</div>
          <div style={S.step}><span style={S.stepNum}>4</span> Both of you open the link — it starts a Google Meet call</div>
        </div>
      </div>

      {/* Booked Sessions */}
      <h3 style={S.section}>Your Booked Sessions</h3>
      {sessions.length === 0 ? (
        <div style={S.empty}>No booked sessions. Visit Sessions to book one.</div>
      ) : (
        sessions.map((s) => {
          const key = `session-${s._id}`;
          const link = generatedLinks[key];
          return (
            <div key={s._id} style={S.card}>
              <div style={S.cardRow}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>{s.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{s.skill} &middot; {s.instructor}</div>
                </div>
                {!link ? (
                  <button onClick={() => generateLink(key)} style={S.genBtn}>Generate Link</button>
                ) : (
                  <button onClick={() => copyLink(key)} style={S.copyBtn}>Copy Link</button>
                )}
              </div>
              {link && (
                <div style={S.linkBox}>
                  <div style={S.linkUrl}>{link}</div>
                  <div style={S.linkHint}>Share this link via Chat with your session peers</div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Matched Peers */}
      <h3 style={{ ...S.section, marginTop: '1.5rem' }}>Start a Session with a Match</h3>
      {matches.length === 0 ? (
        <div style={S.empty}>No matches yet. Add skills to find partners.</div>
      ) : (
        <div style={S.grid}>
          {matches.map((p) => {
            const key = `peer-${p.id}`;
            const link = generatedLinks[key];
            return (
              <div key={p.id} style={S.peerCard}>
                <div style={{ fontWeight: 600, color: 'var(--accent)', marginBottom: '0.3rem' }}>{p.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Teaches: {(p.skillsToTeach || []).join(', ') || '—'}
                </div>
                <span style={S.badge}>{p.matchData?.score || 0}% match</span>

                {!link ? (
                  <button onClick={() => generateLink(key)} style={{ ...S.genBtn, width: '100%', marginTop: '0.6rem' }}>
                    Generate Meeting Link
                  </button>
                ) : (
                  <div style={{ marginTop: '0.6rem' }}>
                    <div style={{ ...S.linkUrl, fontSize: '0.75rem', marginBottom: '0.4rem' }}>{link}</div>
                    <button onClick={() => copyLink(key)} style={{ ...S.copyBtn, width: '100%' }}>
                      Copy Link
                    </button>
                    <div style={{ ...S.linkHint, marginTop: '0.3rem' }}>
                      Send this to {p.name} via Chat
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const S = {
  wrap: { maxWidth: 800, margin: '0 auto', animation: 'fadeIn 0.25s ease' },
  title: { fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)', textAlign: 'center', marginBottom: '0.15rem' },
  sub: { textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' },

  howTo: {
    background: 'var(--accent-soft)', border: '1px solid var(--accent)',
    borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: '1.5rem',
  },
  howToTitle: { fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent)', marginBottom: '0.5rem' },
  steps: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  step: { display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--text-secondary)' },
  stepNum: {
    width: 22, height: 22, borderRadius: '50%',
    background: 'var(--accent)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
  },

  section: { fontSize: '1rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border)' },
  empty: { background: 'var(--bg-surface)', borderRadius: 'var(--radius)', padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', marginBottom: '0.5rem' },

  card: { background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '0.6rem', border: '1px solid var(--border)' },
  cardRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' },
  peerCard: { background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: '1rem', textAlign: 'center', border: '1px solid var(--border)' },
  badge: { display: 'inline-block', background: 'var(--accent-soft)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600 },

  genBtn: { padding: '0.45rem 1rem', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.85rem', flexShrink: 0 },
  copyBtn: { padding: '0.45rem 1rem', background: 'var(--success)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.85rem', flexShrink: 0 },

  linkBox: { marginTop: '0.75rem', padding: '0.65rem 0.85rem', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)' },
  linkUrl: { fontSize: '0.8rem', color: 'var(--accent)', wordBreak: 'break-all', fontFamily: 'monospace' },
  linkHint: { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontStyle: 'italic' },
};

export default PeerLearning;
