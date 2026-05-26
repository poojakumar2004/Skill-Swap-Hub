import React, { useEffect, useState } from 'react';
import http from '../services/http';

const SessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [tab, setTab] = useState('available');
  const [loading, setLoading] = useState(true);
  const email = localStorage.getItem('userEmail') || '';
  const name = localStorage.getItem('userName') || '';
  const userId = localStorage.getItem('userId') || '';

  const isSessionICreated = (s) =>
    (userId && s.createdBy && String(s.createdBy) === userId) || s.instructor === name;
  const [form, setForm] = useState({ title: '', skill: '', duration: '1 hour', scheduledTime: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    try { const r = await http.get('/sessions'); setSessions(r.data || []); }
    catch {} finally { setLoading(false); }
  };

  const book = async (id) => {
    try { await http.post(`/sessions/${id}/book`, { userId: email }); await fetch(); }
    catch { alert('Could not book session.'); }
  };

  const create = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.skill.trim()) { alert('Title and skill required'); return; }
    setCreating(true);
    try { await http.post('/sessions', { ...form, instructor: name }); setForm({ title: '', skill: '', duration: '1 hour', scheduledTime: '', description: '' }); setTab('available'); await fetch(); }
    catch { alert('Failed to create session.'); }
    finally { setCreating(false); }
  };

  const booked = (s) => s.bookedBy?.includes(email);
  const mine = sessions.filter((s) => booked(s) || isSessionICreated(s));

  if (loading) return <div style={S.empty}>Loading sessions...</div>;

  return (
    <div style={S.wrap}>
      <h1 style={S.title}>Learning Sessions</h1>

      <div style={S.tabs}>
        {['available', 'mine', 'create'].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ ...S.tab, ...(tab === t ? S.tabActive : {}) }}>
            {t === 'available' ? 'Available' : t === 'mine' ? 'My Sessions' : 'Create'}
          </button>
        ))}
      </div>

      {tab === 'available' && (
        sessions.length === 0 ? <div style={S.empty}>No sessions yet. Create one!</div> : (
          <div style={S.grid}>
            {sessions.map((s) => (
              <div key={s._id} style={S.card}>
                <h3 style={S.cardTitle}>{s.title}</h3>
                <div style={S.cardMeta}>{s.skill} &middot; {s.instructor}</div>
                {s.duration && <div style={S.cardMeta}>{s.duration}</div>}
                {s.scheduledTime && <div style={S.cardMeta}>{s.scheduledTime}</div>}
                {s.description && <p style={S.cardDesc}>{s.description}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem' }}>{s.price || 'Free'}</span>
                  {isSessionICreated(s) ? (
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Your session</span>
                  ) : (
                    <button onClick={() => book(s._id)} disabled={booked(s)} style={{ ...S.btn, opacity: booked(s) ? 0.5 : 1, cursor: booked(s) ? 'not-allowed' : 'pointer', width: 'auto', padding: '0.4rem 1rem' }}>
                      {booked(s) ? 'Booked' : 'Book'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'mine' && (
        mine.length === 0 ? <div style={S.empty}>No sessions booked or created yet.</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {mine.map((s) => (
              <div key={s._id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>{s.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{s.skill} &middot; {s.instructor}</div>
                </div>
                <span style={{ padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, background: isSessionICreated(s) ? 'var(--accent-soft)' : 'rgba(5,150,105,0.1)', color: isSessionICreated(s) ? 'var(--accent)' : 'var(--success)' }}>
                  {isSessionICreated(s) ? 'Your session' : 'Booked'}
                </span>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'create' && (
        <form onSubmit={create} style={S.form}>
          <label style={S.label}>Title *</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required style={{ width: '100%' }} />
          <label style={{ ...S.label, marginTop: '0.75rem' }}>Skill *</label>
          <input value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })} required style={{ width: '100%' }} />
          <label style={{ ...S.label, marginTop: '0.75rem' }}>Duration</label>
          <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 1 hour" style={{ width: '100%' }} />
          <label style={{ ...S.label, marginTop: '0.75rem' }}>Scheduled Time</label>
          <input value={form.scheduledTime} onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })} placeholder="e.g. Saturday 3 PM" style={{ width: '100%' }} />
          <label style={{ ...S.label, marginTop: '0.75rem' }}>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ width: '100%', resize: 'vertical' }} />
          <button type="submit" disabled={creating} style={{ ...S.btn, marginTop: '1rem', opacity: creating ? 0.6 : 1 }}>
            {creating ? 'Creating...' : 'Create Session'}
          </button>
        </form>
      )}
    </div>
  );
};

const S = {
  wrap: { maxWidth: 900, margin: '0 auto' },
  title: { fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)', textAlign: 'center', marginBottom: '1rem' },
  tabs: { display: 'flex', justifyContent: 'center', gap: '0.35rem', marginBottom: '1.5rem' },
  tab: { padding: '0.45rem 1.1rem', borderRadius: 'var(--radius)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, border: '1px solid var(--border)' },
  tabActive: { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1rem' },
  card: { background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' },
  cardTitle: { fontSize: '1.05rem', fontWeight: 600, color: 'var(--accent)', margin: '0 0 0.3rem' },
  cardMeta: { fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.15rem' },
  cardDesc: { fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.45 },
  btn: { width: '100%', padding: '0.55rem', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.9rem' },
  form: { maxWidth: 480, margin: '0 auto', background: 'var(--bg-surface)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' },
  label: { display: 'block', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' },
  empty: { textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' },
};

export default SessionsPage;
