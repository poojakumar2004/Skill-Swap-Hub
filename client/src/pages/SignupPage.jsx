import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/auth';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password) { setError('All fields are required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await registerUser({ name: name.trim(), email: email.trim(), password });
      if (res.data.token) localStorage.setItem('authToken', res.data.token);
      if (res.data.user) {
        localStorage.setItem('userEmail', res.data.user.email);
        localStorage.setItem('userName', res.data.user.name);
        if (res.data.user.id) localStorage.setItem('userId', res.data.user.id);
      }
      navigate('/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Signup failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={S.page}>
      <div style={S.left}>
        <div style={S.leftContent}>
          <div style={S.logo}>S</div>
          <h1 style={S.leftTitle}>Join SkillSwap</h1>
          <p style={S.leftSub}>Create an account and start exchanging skills with learners around the world.</p>
        </div>
      </div>
      <div style={S.right}>
        <form onSubmit={handleSignup} style={S.card}>
          <h2 style={S.title}>Create account</h2>
          <p style={S.sub}>It takes less than a minute</p>
          {error && <div style={S.error}>{error}</div>}

          <label style={S.label}>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required autoFocus />

          <label style={{ ...S.label, marginTop: 12 }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />

          <label style={{ ...S.label, marginTop: 12 }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} />

          <label style={{ ...S.label, marginTop: 12 }}>Confirm Password</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" required />

          <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? 0.6 : 1, marginTop: 20 }}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>

          <p style={S.footer}>Already have an account? <span onClick={() => navigate('/login')} style={S.link}>Sign in</span></p>
        </form>
      </div>
    </div>
  );
};

const S = {
  page: { minHeight: '100vh', display: 'flex' },
  left: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)',
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
  sub: { color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' },
  label: { display: 'block', fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 },
  btn: {
    width: '100%', padding: '0.7rem',
    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    color: '#fff', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.95rem',
    boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
  },
  error: { background: 'var(--danger-soft)', color: 'var(--danger)', padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center' },
  footer: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' },
  link: { color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 },
};

export default SignupPage;
