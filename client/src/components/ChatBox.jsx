import React, { useState, useEffect, useRef } from 'react';
import http from '../services/http';

const ChatBox = () => {
  const [messages, setMessages] = useState([
    { text: "Hi! I'm SkillBot. Ask me about skills, sessions, matches, or type Help.", sender: "bot", ts: new Date().toLocaleTimeString() },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text) => {
    const t = (text || input).trim();
    if (!t) return;
    setMessages((p) => [...p, { text: t, sender: "user", ts: new Date().toLocaleTimeString() }]);
    setInput("");
    setTyping(true);
    try {
      const r = await http.post('/chatbot', { message: t, userEmail: localStorage.getItem('userEmail') || '' });
      setMessages((p) => [...p, { text: r.data.reply, sender: "bot", ts: new Date().toLocaleTimeString() }]);
    } catch {
      setMessages((p) => [...p, { text: "Sorry, something went wrong.", sender: "bot", ts: new Date().toLocaleTimeString() }]);
    } finally { setTyping(false); }
  };

  const quick = ["Show my skills", "Find sessions", "How many users?", "Help"];

  return (
    <div style={S.wrap}>
      <div style={S.head}>SkillBot</div>

      <div style={S.msgs}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start', marginBottom: '0.4rem' }}>
            <div style={{
              maxWidth: '80%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', lineHeight: 1.4, wordBreak: 'break-word',
              background: m.sender === 'user' ? 'var(--accent)' : 'var(--bg-hover)',
              color: m.sender === 'user' ? '#fff' : 'var(--text)',
              borderRadius: m.sender === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
            }}>
              {m.text.split('\n').map((line, j) => <div key={j}>{line}</div>)}
            </div>
          </div>
        ))}
        {typing && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.25rem' }}>Typing...</div>}
        <div ref={endRef} />
      </div>

      {messages.length <= 2 && (
        <div style={S.quickWrap}>
          {quick.map((q, i) => (
            <button key={i} onClick={() => send(q)} style={S.quickBtn}>{q}</button>
          ))}
        </div>
      )}

      <div style={S.bar}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Ask anything..." style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} />
        <button onClick={() => send()} disabled={!input.trim()} style={{ ...S.sendBtn, opacity: input.trim() ? 1 : 0.4 }}>Send</button>
      </div>
    </div>
  );
};

const S = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-surface)' },
  head: { padding: '0.65rem 1rem', background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', flexShrink: 0 },
  msgs: { flex: 1, overflowY: 'auto', padding: '0.75rem', background: 'var(--bg-app)' },
  quickWrap: { display: 'flex', flexWrap: 'wrap', gap: '0.35rem', padding: '0.5rem 0.75rem', borderTop: '1px solid var(--border)' },
  quickBtn: { padding: '0.35rem 0.65rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', color: 'var(--text-secondary)' },
  bar: { display: 'flex', gap: '0.35rem', padding: '0.5rem 0.65rem', borderTop: '1px solid var(--border)', flexShrink: 0 },
  sendBtn: { padding: '0.45rem 0.85rem', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.82rem', flexShrink: 0 },
};

export default ChatBox;
