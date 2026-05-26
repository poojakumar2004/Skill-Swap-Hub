import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ChatBox from '../components/ChatBox';

const cards = [
  { to: '/profile',       icon: '\u25CB', label: 'Profile',       desc: 'Update your info and skills', color: '#6366f1' },
  { to: '/marketplace',   icon: '\u25C6', label: 'Marketplace',   desc: 'Browse skill offerings',      color: '#8b5cf6' },
  { to: '/matches',       icon: '\u2606', label: 'Matches',       desc: 'Find learning partners',      color: '#ec4899' },
  { to: '/sessions',      icon: '\u25B7', label: 'Sessions',      desc: 'Book or create sessions',     color: '#f59e0b' },
  { to: '/chat',          icon: '\u25AC', label: 'Chat',          desc: 'Message your connections',     color: '#10b981' },
  { to: '/peer-learning', icon: '\u25CE', label: 'Peer Learning', desc: 'Video call with peers',       color: '#06b6d4' },
  { to: '/skills',        icon: '\u2699', label: 'Manage Skills', desc: 'Add or remove skills',        color: '#f97316' },
  { to: '/settings',      icon: '\u2638', label: 'Settings',      desc: 'Preferences & account',       color: '#64748b' },
];

const Dashboard = () => {
  const [showChat, setShowChat] = useState(false);
  const name = localStorage.getItem('userName') || 'there';

  return (
    <>
      <div style={S.wrap}>
        {/* Hero */}
        <div style={S.hero}>
          <h1 style={S.heroTitle}>Welcome back, {name}</h1>
          <p style={S.heroSub}>Grow, learn, and share skills with your peers.</p>
        </div>

        {/* Cards */}
        <div style={S.grid}>
          {cards.map((c) => (
            <Link key={c.to} to={c.to} style={S.card} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; }}>
              <div style={{ ...S.cardIcon, background: c.color + '14', color: c.color }}>{c.icon}</div>
              <div style={S.cardLabel}>{c.label}</div>
              <div style={S.cardDesc}>{c.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Chat FAB */}
      <button onClick={() => setShowChat(!showChat)} style={S.fab} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
        {showChat ? '\u2715' : '\u2709'} {showChat ? '' : 'SkillBot'}
      </button>

      {showChat && (
        <div style={S.chatWrap}>
          <ChatBox />
        </div>
      )}
    </>
  );
};

const S = {
  wrap: { maxWidth: 960, margin: '0 auto', animation: 'fadeIn 0.3s ease' },
  hero: { marginBottom: '2rem' },
  heroTitle: { fontSize: '1.85rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '0.25rem' },
  heroSub: { fontSize: '1rem', color: 'var(--text-muted)', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.85rem' },
  card: {
    display: 'flex', flexDirection: 'column', padding: '1.25rem',
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', textDecoration: 'none',
    boxShadow: 'var(--shadow-xs)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  cardIcon: {
    width: 38, height: 38, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem',
  },
  cardLabel: { fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.2rem' },
  cardDesc: { fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 },
  fab: {
    position: 'fixed', bottom: 20, right: 20,
    height: 48, padding: '0 1.25rem',
    background: 'var(--gradient-brand)', color: '#fff',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.9rem', fontWeight: 600,
    boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
    zIndex: 50,
    display: 'flex', alignItems: 'center', gap: 6,
    transition: 'transform 0.2s ease',
  },
  chatWrap: {
    position: 'fixed', bottom: 80, right: 20,
    width: 370, height: 500,
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 50, overflow: 'hidden',
    border: '1px solid var(--border)',
    animation: 'slideUp 0.25s ease',
  },
};

export default Dashboard;
