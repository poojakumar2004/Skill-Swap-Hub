import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardProfile from '../pages/DashboardProfile';
import { useToast } from './Toast';
import http from '../services/http';
import { emitConnectionsChanged } from '../utils/connectionEvents';
import { ChatUnreadProvider, useChatUnread } from '../context/ChatUnreadContext';

const NAV = [
  { to: '/dashboard',     icon: '\u25A0', label: 'Dashboard' },
  { to: '/profile',       icon: '\u25CB', label: 'Profile' },
  { to: '/marketplace',   icon: '\u25C6', label: 'Marketplace' },
  { to: '/matches',       icon: '\u2606', label: 'Matches' },
  { to: '/sessions',      icon: '\u25B7', label: 'Sessions' },
  { to: '/chat',          icon: '\u25AC', label: 'Chat' },
  { to: '/peer-learning', icon: '\u25CE', label: 'Peer Learning' },
  { to: '/skills',        icon: '\u2699', label: 'Skills' },
  { to: '/settings',      icon: '\u2638', label: 'Settings' },
];

function MainLayoutInner({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const toast = useToast();
  const isDash = pathname === '/dashboard';
  const { unread: unreadChats } = useChatUnread();

  const [notifs, setNotifs] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const fetchNotifs = () => http.get('/connections/incoming').then((r) => setNotifs(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    fetchNotifs();
    const id1 = setInterval(fetchNotifs, 10000);
    return () => clearInterval(id1);
  }, []);

  const accept = async (id) => {
    try {
      await http.patch(`/connections/${id}`, { status: 'accepted' });
      setNotifs((p) => p.filter((n) => n._id !== id));
      emitConnectionsChanged();
      toast.success('Connection accepted! You can now chat.');
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const decline = async (id) => {
    try {
      await http.patch(`/connections/${id}`, { status: 'declined' });
      setNotifs((p) => p.filter((n) => n._id !== id));
      emitConnectionsChanged();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  return (
    <div style={S.shell}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={S.brand}>
          <span style={S.brandIcon}>S</span>
          <span>SkillSwap</span>
        </div>
        <nav style={S.nav}>
          {NAV.map(({ to, icon, label }) => {
            const active = pathname === to;
            const showBadge = to === '/chat' && unreadChats > 0;
            return (
              <Link key={to} to={to} style={{ ...S.navLink, ...(active ? S.navActive : {}), position: 'relative' }}>
                <span style={{ ...S.navIcon, color: active ? 'var(--accent)' : 'var(--text-sidebar)' }}>{icon}</span>
                <span>{label}</span>
                {showBadge && (
                  <span style={S.chatBadge}>{unreadChats > 9 ? '9+' : unreadChats}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div style={S.sidebarFooter}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-sidebar)' }}>SkillSwap v1.0</div>
        </div>
      </aside>

      {/* Main */}
      <div style={S.main}>
        <header style={S.topbar}>
          <div style={S.topLeft}>
            {!isDash && (
              <button onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/dashboard'))} style={S.backBtn}>
                &larr;
              </button>
            )}
            <span style={S.crumb}>
              {pathname.split('/').filter(Boolean).map((seg, i) => (
                <span key={i}>{i > 0 && <span style={{ margin: '0 6px', color: 'var(--border)' }}>/</span>}{seg}</span>
              ))}
            </span>
          </div>
          <div style={S.topRight}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowNotif(!showNotif)} style={S.notifBtn}>
                <span style={S.bellIcon}>&#9932;</span>
                {notifs.length > 0 && <span style={S.badge}>{notifs.length}</span>}
              </button>
              {showNotif && (
                <div style={S.dropdown}>
                  <div style={S.dropdownHead}>Notifications</div>
                  {notifs.length === 0 ? (
                    <div style={S.dropdownEmpty}>All caught up!</div>
                  ) : notifs.map((n) => (
                    <div key={n._id} style={S.notifItem}>
                      <div style={S.notifText}><strong>{n.from?.name || 'Someone'}</strong> wants to connect</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => accept(n._id)} style={S.acceptBtn}>Accept</button>
                        <button onClick={() => decline(n._id)} style={S.declineBtn}>Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DashboardProfile />
          </div>
        </header>

        <div style={S.content}>
          {unreadChats > 0 && pathname !== '/chat' && (
            <div style={S.msgBanner} role="status">
              <Link to="/chat" style={S.msgBannerLink}>
                <strong>{unreadChats}</strong> unread message{unreadChats === 1 ? '' : 's'} from your connections —{' '}
                <span style={S.msgBannerCta}>Open Chat</span>
              </Link>
            </div>
          )}
          <div style={{ animation: 'fadeIn 0.25s ease' }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function MainLayout({ children }) {
  return (
    <ChatUnreadProvider>
      <MainLayoutInner>{children}</MainLayoutInner>
    </ChatUnreadProvider>
  );
}

const S = {
  shell: { display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' },

  /* Sidebar */
  sidebar: {
    width: 230, flexShrink: 0,
    background: 'var(--bg-sidebar)',
    display: 'flex', flexDirection: 'column',
    padding: '1.25rem 0.65rem',
    borderRight: '1px solid rgba(255,255,255,0.06)',
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: 10,
    color: '#fff', fontSize: '1.15rem', fontWeight: 800,
    padding: '0.25rem 0.75rem 1.25rem',
    letterSpacing: '-0.03em',
  },
  brandIcon: {
    width: 30, height: 30, borderRadius: 8,
    background: 'var(--gradient-brand)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.85rem', fontWeight: 800, color: '#fff',
  },
  nav: { display: 'flex', flexDirection: 'column', gap: 2, flex: 1 },
  navLink: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '0.5rem 0.75rem',
    borderRadius: 8,
    fontSize: '0.87rem', fontWeight: 500,
    textDecoration: 'none',
    color: 'var(--text-sidebar)',
    transition: 'all 0.15s ease',
  },
  navActive: {
    background: 'var(--sidebar-active)',
    color: 'var(--text-sidebar-active)',
    fontWeight: 600,
  },
  navIcon: { fontSize: '0.7rem', width: 18, textAlign: 'center' },
  chatBadge: {
    marginLeft: 'auto',
    minWidth: 18, height: 18,
    background: '#ef4444', color: '#fff',
    fontSize: '0.6rem', fontWeight: 700,
    borderRadius: '9px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 4px',
    lineHeight: 1,
  },
  sidebarFooter: { padding: '1rem 0.75rem 0', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto' },

  /* Topbar */
  main: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' },
  topbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 1.5rem', height: 56, flexShrink: 0,
    background: 'var(--bg-topbar)',
    borderBottom: '1px solid var(--border)',
  },
  topLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  backBtn: {
    width: 32, height: 32,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-hover)', color: 'var(--text-secondary)',
    fontSize: '0.9rem', border: '1px solid var(--border)',
  },
  crumb: { fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'capitalize' },
  topRight: { display: 'flex', alignItems: 'center', gap: 8 },
  notifBtn: {
    position: 'relative',
    width: 36, height: 36,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-hover)', color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
  },
  bellIcon: { fontSize: '1.05rem' },
  badge: {
    position: 'absolute', top: -4, right: -4,
    minWidth: 17, height: 17,
    background: 'var(--danger)', color: '#fff',
    fontSize: '0.6rem', fontWeight: 700,
    borderRadius: 'var(--radius-full)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 4px',
    border: '2px solid var(--bg-topbar)',
  },

  /* Dropdown */
  dropdown: {
    position: 'absolute', right: 0, top: 44,
    width: 320,
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 1000, overflow: 'hidden',
    animation: 'slideUp 0.2s ease',
  },
  dropdownHead: {
    padding: '0.75rem 1rem',
    fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)',
    borderBottom: '1px solid var(--border)',
  },
  dropdownEmpty: { padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' },
  notifItem: { padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-light)' },
  notifText: { fontSize: '0.88rem', color: 'var(--text)', marginBottom: 6 },
  acceptBtn: {
    padding: '0.3rem 0.75rem',
    background: 'var(--success)', color: '#fff',
    borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', fontWeight: 600,
  },
  declineBtn: {
    padding: '0.3rem 0.75rem',
    background: 'var(--bg-hover)', color: 'var(--text-secondary)',
    borderRadius: 'var(--radius-sm)', fontSize: '0.78rem',
    border: '1px solid var(--border)',
  },

  /* Content */
  content: { flex: 1, padding: '1.5rem', overflow: 'auto' },
  msgBanner: {
    marginBottom: '1rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-lg)',
    background: 'var(--accent-soft)',
    border: '1px solid rgba(99,102,241,0.35)',
  },
  msgBannerLink: {
    color: 'var(--accent-text)',
    textDecoration: 'none',
    fontSize: '0.92rem',
    display: 'block',
  },
  msgBannerCta: { fontWeight: 700, textDecoration: 'underline' },
};
