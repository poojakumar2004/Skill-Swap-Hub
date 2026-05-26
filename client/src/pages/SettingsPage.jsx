import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../services/http';
import { useTheme } from '../context/ThemeContext';

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [deleteStep, setDeleteStep] = useState(0);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [settings, setSettings] = useState({
    emailNotifications: true, matchAlerts: true, sessionReminders: true,
    profileVisibility: 'public', showEmail: false, theme: theme || 'light'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    http.get('/users/settings').then((r) => setSettings((p) => ({ ...p, ...r.data }))).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggle = (k) => { setSettings((p) => ({ ...p, [k]: !p[k] })); setSaved(false); };
  const select = (k, v) => { setSettings((p) => ({ ...p, [k]: v })); if (k === 'theme') setTheme(v); setSaved(false); };

  const save = async () => {
    setSaving(true);
    try { const r = await http.put('/users/settings', settings); setSettings((p) => ({ ...p, ...r.data })); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    catch { alert('Failed to save.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div style={S.wrap}>
      <h1 style={S.title}>Settings</h1>

      <Section title="Notifications">
        <Toggle label="Email Notifications" desc="Receive email updates" value={settings.emailNotifications} onToggle={() => toggle('emailNotifications')} />
        <Toggle label="Match Alerts" desc="New skill match found" value={settings.matchAlerts} onToggle={() => toggle('matchAlerts')} />
        <Toggle label="Session Reminders" desc="Before scheduled sessions" value={settings.sessionReminders} onToggle={() => toggle('sessionReminders')} />
      </Section>

      <Section title="Privacy">
        <Row label="Profile Visibility" desc="Who can see your profile">
          <select value={settings.profileVisibility} onChange={(e) => select('profileVisibility', e.target.value)}>
            <option value="public">Public</option>
            <option value="connections">Connections Only</option>
            <option value="private">Private</option>
          </select>
        </Row>
        <Toggle label="Show Email" desc="Let others see your email" value={settings.showEmail} onToggle={() => toggle('showEmail')} />
      </Section>

      <Section title="Appearance">
        <Row label="Theme" desc="Light or dark mode">
          <select value={settings.theme} onChange={(e) => select('theme', e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </Row>
      </Section>

      <button onClick={save} disabled={saving} style={{ ...S.saveBtn, opacity: saving ? 0.6 : 1 }}>
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
      </button>

      {/* Danger zone */}
      <div style={S.danger}>
        <h3 style={S.dangerTitle}>Danger Zone</h3>
        {deleteStep === 0 && (
          <Row label="Delete Account" desc="Permanently remove all data">
            <button onClick={() => setDeleteStep(1)} style={S.dangerBtn}>Delete</button>
          </Row>
        )}
        {deleteStep === 1 && (
          <div style={{ padding: '0.5rem 0' }}>
            <p style={{ color: 'var(--danger)', fontWeight: 600, margin: '0 0 0.4rem' }}>Are you sure? This cannot be undone.</p>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button onClick={() => setDeleteStep(2)} style={{ ...S.dangerBtn, background: 'var(--danger)', color: '#fff' }}>Yes, delete my account</button>
              <button onClick={() => setDeleteStep(0)} style={{ padding: '0.4rem 0.8rem', background: 'var(--bg-hover)', color: 'var(--text)', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
            </div>
          </div>
        )}
        {deleteStep === 2 && (
          <div style={{ padding: '0.5rem 0' }}>
            <p style={{ color: 'var(--danger)', fontWeight: 600, margin: '0 0 0.4rem' }}>Enter password to confirm</p>
            {deleteError && <p style={{ color: 'var(--danger)', fontSize: '0.82rem', margin: '0 0 0.4rem' }}>{deleteError}</p>}
            <input type="password" placeholder="Your password" value={deletePassword} onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(''); }} style={{ width: '100%', marginBottom: '0.6rem' }} />
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button disabled={deleting} onClick={async () => {
                if (!deletePassword) { setDeleteError('Password required'); return; }
                setDeleting(true); setDeleteError('');
                try { await http.post('/users/account/delete', { password: deletePassword.trim() }); localStorage.clear(); alert('Account deleted.'); navigate('/login'); }
                catch (err) { setDeleteError(err.response?.data?.error || 'Failed'); }
                finally { setDeleting(false); }
              }} style={{ ...S.dangerBtn, background: 'var(--danger)', color: '#fff', opacity: deleting ? 0.6 : 1 }}>
                {deleting ? 'Deleting...' : 'Delete Forever'}
              </button>
              <button onClick={() => { setDeleteStep(0); setDeletePassword(''); setDeleteError(''); }} style={{ padding: '0.4rem 0.8rem', background: 'var(--bg-hover)', color: 'var(--text)', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div style={S.section}>
    <h3 style={S.sectionTitle}>{title}</h3>
    {children}
  </div>
);

const Row = ({ label, desc, children }) => (
  <div style={S.row}>
    <div><div style={S.label}>{label}</div><div style={S.desc}>{desc}</div></div>
    {children}
  </div>
);

const Toggle = ({ label, desc, value, onToggle }) => (
  <div style={S.row}>
    <div><div style={S.label}>{label}</div><div style={S.desc}>{desc}</div></div>
    <div onClick={onToggle} style={{ ...S.toggle, background: value ? 'var(--accent)' : 'var(--border)' }}>
      <div style={{ ...S.knob, transform: value ? 'translateX(18px)' : 'translateX(0)' }} />
    </div>
  </div>
);

const S = {
  wrap: { maxWidth: 640, margin: '0 auto' },
  title: { fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.5rem' },
  section: { background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1rem', border: '1px solid var(--border)' },
  sectionTitle: { fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent)', margin: '0 0 0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border-light)' },
  label: { fontWeight: 500, fontSize: '0.9rem', color: 'var(--text)' },
  desc: { fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 1 },
  toggle: { width: 40, height: 22, borderRadius: 11, cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 },
  knob: { width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: 2, transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.18)' },
  saveBtn: { width: '100%', padding: '0.7rem', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '1.5rem' },
  danger: { background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid var(--danger)', marginTop: '0.5rem' },
  dangerTitle: { fontSize: '0.95rem', fontWeight: 600, color: 'var(--danger)', margin: '0 0 0.75rem' },
  dangerBtn: { padding: '0.4rem 0.8rem', background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.82rem' },
};

export default SettingsPage;
