import React, { useState, useEffect } from "react";
import http from "../services/http";
import { resolveUploadUrl } from "../config/api";

const Profile = () => {
  const [form, setForm] = useState({
    name: "", email: "", bio: "", contact: "",
    skillsOffered: [], skillsWanted: [],
    availability: "", profilePic: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [wantedInput, setWantedInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");
    setForm((p) => ({ ...p, name: name || "", email: email || "", contact: email || "" }));
  }, []);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) return;
    http.get(`/users/userprofile/${encodeURIComponent(email)}`)
      .then((res) => {
        const d = res.data || {};
        setForm((p) => ({ ...p, ...d,
          skillsOffered: Array.isArray(d.skillsOffered) ? d.skillsOffered : p.skillsOffered,
          skillsWanted: Array.isArray(d.skillsWanted) ? d.skillsWanted : p.skillsWanted,
        }));
      }).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const add = (type, val, setVal) => { if (!val.trim()) return; setForm((p) => ({ ...p, [type]: [...p[type], val.trim()] })); setVal(""); };
  const remove = (type, i) => setForm((p) => ({ ...p, [type]: p[type].filter((_, idx) => idx !== i) }));

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Max 2 MB"); return; }
    const fd = new FormData(); fd.append("avatar", file);
    try {
      const { data } = await http.post("/users/profile/avatar", fd);
      const pic = data.profilePic || data.user?.profilePic;
      if (pic) setForm((p) => ({ ...p, profilePic: pic }));
    } catch { alert("Upload failed"); }
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!form.name.trim()) { alert("Name is required"); return; }
    setSaving(true);
    try { await http.post("/users/profile", form); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    catch { alert("Save failed"); }
    finally { setSaving(false); }
  };

  const picUrl = resolveUploadUrl(form.profilePic);

  return (
    <div style={S.wrap}>
      <div style={S.card}>
        <h2 style={S.heading}>My Profile</h2>

        {picUrl && (
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <img src={picUrl} alt="Avatar" style={S.avatar} />
          </div>
        )}

        <Field label="Profile photo">
          <input type="file" accept="image/*" onChange={handleAvatar} />
        </Field>

        <Field label="Name *">
          <input name="name" value={form.name} onChange={handleChange} required style={{ width: '100%' }} />
        </Field>

        <Field label="Bio">
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} style={{ width: '100%', resize: 'vertical' }} />
        </Field>

        <Field label="Contact">
          <input name="contact" value={form.contact} onChange={handleChange} style={{ width: '100%' }} />
        </Field>

        <Field label="Skills Offered">
          <div style={S.inputRow}>
            <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add('skillsOffered', skillInput, setSkillInput))} placeholder="e.g. React" style={{ flex: 1 }} />
            <button type="button" onClick={() => add('skillsOffered', skillInput, setSkillInput)} style={S.addBtn}>Add</button>
          </div>
          <Tags items={form.skillsOffered} color="var(--accent)" onRemove={(i) => remove('skillsOffered', i)} />
        </Field>

        <Field label="Skills Wanted">
          <div style={S.inputRow}>
            <input value={wantedInput} onChange={(e) => setWantedInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add('skillsWanted', wantedInput, setWantedInput))} placeholder="e.g. Python" style={{ flex: 1 }} />
            <button type="button" onClick={() => add('skillsWanted', wantedInput, setWantedInput)} style={S.addBtn}>Add</button>
          </div>
          <Tags items={form.skillsWanted} color="var(--warning)" onRemove={(i) => remove('skillsWanted', i)} />
        </Field>

        <Field label="Availability">
          <input name="availability" value={form.availability} onChange={handleChange} placeholder="Weekends, Evenings..." style={{ width: '100%' }} />
        </Field>

        <button onClick={handleSave} disabled={saving} style={{ ...S.saveBtn, opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving..." : saved ? "Saved!" : "Save Profile"}
        </button>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div style={{ marginBottom: '1rem' }}>
    <label style={S.label}>{label}</label>
    {children}
  </div>
);

const Tags = ({ items, color, onRemove }) => (
  <div style={S.tags}>
    {items.map((s, i) => (
      <span key={i} onClick={() => onRemove(i)} style={{ ...S.tag, background: color, color: '#fff' }} title="Click to remove">
        {s} &times;
      </span>
    ))}
  </div>
);

const S = {
  wrap: { display: "flex", justifyContent: "center", padding: "0.5rem 0" },
  card: { background: "var(--bg-surface)", padding: "2rem", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow)", width: "100%", maxWidth: 520, border: "1px solid var(--border)" },
  heading: { textAlign: "center", fontSize: "1.4rem", fontWeight: 700, color: "var(--accent)", marginBottom: "1.25rem" },
  avatar: { width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--accent)" },
  label: { display: "block", fontWeight: 600, fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.3rem" },
  inputRow: { display: "flex", gap: "0.5rem" },
  addBtn: { padding: "0.5rem 1rem", background: "var(--accent)", color: "#fff", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "0.85rem", flexShrink: 0 },
  tags: { display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 },
  tag: { display: "inline-block", padding: "3px 10px", borderRadius: "var(--radius-full)", fontSize: "0.78rem", cursor: "pointer", fontWeight: 500 },
  saveBtn: { width: "100%", marginTop: "0.5rem", padding: "0.7rem", background: "var(--accent)", color: "#fff", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "0.95rem" },
};

export default Profile;
