import React, { useState, useEffect, useRef, useCallback } from 'react';
import http from '../services/http';
import { useChatUnread } from '../context/ChatUnreadContext';

const Chat = () => {
  const { refresh: refreshUnread } = useChatUnread();
  const [contacts, setContacts] = useState([]);
  const [sel, setSel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [myId, setMyId] = useState(() => localStorage.getItem('userId') || '');
  const endRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (myId) return;
    http.get('/users/me').then((r) => {
      const id = String(r.data?._id ?? r.data?.id ?? '');
      if (id) { localStorage.setItem('userId', id); setMyId(id); }
    }).catch(() => {});
  }, [myId]);

  useEffect(() => {
    http.get('/chat/contacts').then((r) => setContacts(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const refreshContacts = useCallback(() => http.get('/chat/contacts').then((r) => setContacts(r.data || [])).catch(() => {}), []);

  const selectContact = useCallback((c) => {
    setSel(c);
    // Optimistically zero-out the unread count for this contact so
    // the badge and dot disappear immediately instead of waiting for
    // the full mark-as-read round-trip.
    setContacts((prev) => prev.map((x) => x.id === c.id ? { ...x, unread: 0 } : x));
    // Fire mark-as-read + refresh in the background (no await needed).
    http.post('/chat/read', { user2: c.id })
      .then(() => refreshUnread())
      .catch(() => {});
  }, [refreshUnread]);

  useEffect(() => {
    if (!sel) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await http.get(`/chat?user2=${sel.id}`);
        if (cancelled) return;
        setMessages(r.data.messages || []);
        await refreshUnread();
        if (cancelled) return;
        await refreshContacts();
      } catch {
        /* ignore */
      }
    };
    tick();
    pollRef.current = setInterval(tick, 3000);
    return () => { cancelled = true; clearInterval(pollRef.current); };
  }, [sel, refreshUnread, refreshContacts]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!msg.trim() || !sel) return;
    setSending(true);
    try {
      const r = await http.post('/chat/send', { user2: sel.id, text: msg.trim() });
      setMessages(r.data.messages || []);
      setMsg('');
      await refreshUnread();
      await refreshContacts();
    } catch {
      /* ignore */
    } finally {
      setSending(false);
    }
  };

  const mine = (m) => String(m.sender) === String(myId);
  const time = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div style={S.shell}>
      {/* Contacts */}
      <div style={S.panel}>
        <div style={S.panelHead}>Messages</div>
        {contacts.length === 0 ? (
          <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No contacts yet. Connect from Matches first.
          </div>
        ) : contacts.map((c) => (
          <div key={c.id} onClick={() => selectContact(c)} style={{ ...S.contact, background: sel?.id === c.id ? 'var(--accent-soft)' : 'transparent' }}>
            <div style={{ position: 'relative' }}>
              <div style={S.avatar}>{c.name?.charAt(0)?.toUpperCase() || '?'}</div>
              {c.unread > 0 && sel?.id !== c.id && (
                <span style={S.unreadDot}>{c.unread > 9 ? '9+' : c.unread}</span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: c.unread > 0 && sel?.id !== c.id ? 700 : 600, fontSize: '0.9rem', color: 'var(--text)' }}>{c.name}</div>
              <div style={{ fontSize: '0.78rem', color: c.unread > 0 && sel?.id !== c.id ? 'var(--text)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: c.unread > 0 && sel?.id !== c.id ? 600 : 400 }}>
                {c.lastMessage || 'No messages yet'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat */}
      <div style={S.chatArea}>
        {!sel ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Select a conversation
          </div>
        ) : (
          <>
            <div style={S.chatHead}>
              <div style={{ ...S.avatar, width: 32, height: 32, fontSize: '0.8rem', background: 'rgba(255,255,255,0.15)' }}>{sel.name?.charAt(0)?.toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{sel.name}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{(sel.skills || []).join(', ') || 'SkillSwap member'}</div>
              </div>
            </div>

            <div style={S.messages}>
              {messages.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Say hello!</div>}
              {messages.map((m, i) => {
                const me = mine(m);
                return (
                  <div key={m.id || i} style={{ display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', marginBottom: '0.5rem' }}>
                    {!me && <div style={{ ...S.avatar, width: 26, height: 26, fontSize: '0.65rem', marginRight: 6, marginTop: 2, flexShrink: 0 }}>{sel.name?.charAt(0)?.toUpperCase()}</div>}
                    <div style={{ maxWidth: '65%' }}>
                      <div style={{
                        padding: '0.5rem 0.8rem', fontSize: '0.88rem', lineHeight: 1.45, wordBreak: 'break-word',
                        background: me ? 'var(--accent)' : 'var(--bg-surface)',
                        color: me ? '#fff' : 'var(--text)',
                        borderRadius: me ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        boxShadow: 'var(--shadow-sm)',
                        border: me ? 'none' : '1px solid var(--border)',
                      }}>{m.text}</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 2, textAlign: me ? 'right' : 'left', padding: '0 4px' }}>{time(m.createdAt)}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            <div style={S.inputBar}>
              <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())} placeholder="Type a message..." style={{ flex: 1 }} />
              <button onClick={send} disabled={!msg.trim() || sending} style={{ ...S.sendBtn, opacity: !msg.trim() || sending ? 0.4 : 1 }}>
                {sending ? '...' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const S = {
  shell: { display: 'flex', height: 'calc(100vh - 120px)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-surface)' },
  panel: { width: 280, flexShrink: 0, borderRight: '1px solid var(--border)', overflowY: 'auto' },
  panelHead: { padding: '0.85rem 1rem', fontWeight: 700, fontSize: '1rem', color: 'var(--accent)', borderBottom: '1px solid var(--border)' },
  contact: { display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 0.85rem', cursor: 'pointer', borderBottom: '1px solid var(--border-light)', transition: 'background 0.12s' },
  avatar: { width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 },
  unreadDot: {
    position: 'absolute', top: -2, right: -4,
    minWidth: 16, height: 16,
    background: '#ef4444', color: '#fff',
    fontSize: '0.55rem', fontWeight: 700,
    borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 3px',
    border: '2px solid var(--bg-surface)',
  },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  chatHead: { display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 1rem', background: 'var(--accent)', color: '#fff', flexShrink: 0 },
  messages: { flex: 1, overflowY: 'auto', padding: '0.85rem', background: 'var(--bg-app)' },
  inputBar: { display: 'flex', gap: '0.4rem', padding: '0.6rem 0.85rem', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' },
  sendBtn: { padding: '0.5rem 1rem', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.85rem', flexShrink: 0 },
};

export default Chat;
