import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) { setError('Email and password are required'); return; }
    setLoading(true);
    try {
      const res = await loginUser({ email: email.trim(), password: password.trim() });
      localStorage.setItem('userEmail', res.data.user.email);
      localStorage.setItem('userName', res.data.user.name);
      if (res.data.user?.id) localStorage.setItem('userId', res.data.user.id);
      if (res.data.token) localStorage.setItem('authToken', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally { setLoading(false); }
  };

  return (
    <div style={S.page}>
      <div style={S.left}>
        <div style={S.leftContent}>
          <div style={S.logo}>S</div>
          <h1 style={S.leftTitle}>SkillSwap</h1>
          <p style={S.leftSub}>Learn anything. Teach everything. Connect with peers who share your passion for growth.</p>
        </div>
      </div>
      <div style={S.right}>
        <form onSubmit={handleLogin} style={S.card}>
          <h2 style={S.title}>Sign in</h2>
          <p style={S.sub}>Welcome back to SkillSwap</p>
          {error && <div style={S.error}>{error}</div>}

          <label style={S.label}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus />

          <label style={{ ...S.label, marginTop: 12 }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required />

          <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? 0.6 : 1, marginTop: 20 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p style={S.footer}>Don't have an account? <span onClick={() => navigate('/register')} style={S.link}>Create one</span></p>
        </form>
      </div>
    </div>
  );
};

const S = {
  page: { minHeight: '100vh', display: 'flex' },
  left: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)',
    padding: '2rem',
  },
  leftContent: { maxWidth: 380, color: '#fff' },
  logo: {
    width: 48, height: 48, borderRadius: 14,
    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem',
  },
  leftTitle: { fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.75rem', color: '#fff', letterSpacing: '-0.03em' },
  leftSub: { fontSize: '1.05rem', lineHeight: 1.6, opacity: 0.85, color: '#fff' },
  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', padding: '2rem' },
  card: { width: '100%', maxWidth: 380 },
  title: { fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: 2 },
  sub: { color: 'var(--text-muted)', marginBottom: '1.75rem', fontSize: '0.9rem' },
  label: { display: 'block', fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 },
  btn: {
    width: '100%', padding: '0.7rem',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.95rem',
    boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
  },
  error: { background: 'var(--danger-soft)', color: 'var(--danger)', padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center' },
  footer: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' },
  link: { color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 },
};

export default LoginPage;
