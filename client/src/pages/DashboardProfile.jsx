import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import http from "../services/http";
import { resolveUploadUrl } from "../config/api";

const DashboardProfile = () => {
  const [profile, setProfile] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!email) return;
    http.get(`/users/userprofile/${encodeURIComponent(email)}`).then((r) => setProfile(r.data)).catch(() => {});
  }, [email]);

  const logout = () => { localStorage.clear(); navigate("/login"); };

  const src = resolveUploadUrl(profile?.profilePic) || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const displayName = profile?.name || localStorage.getItem("userName") || "User";

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-hover)", padding: "4px 10px 4px 4px", borderRadius: "var(--radius-full)", border: "1px solid var(--border)", cursor: "pointer" }}
      >
        <img src={src} alt="" style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover" }} />
        <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text)" }}>{displayName}</span>
      </button>

      {open && (
        <div style={S.drop}>
          <div style={{ padding: "0.75rem 0.85rem", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)" }}>{displayName}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{profile?.email || email}</div>
          </div>
          {[{ label: "Profile", to: "/profile" }, { label: "Settings", to: "/settings" }].map((item) => (
            <button key={item.to} onClick={() => { setOpen(false); navigate(item.to); }} style={S.dropBtn}>
              {item.label}
            </button>
          ))}
          <div style={{ borderTop: "1px solid var(--border)", margin: "2px 0" }} />
          <button onClick={logout} style={{ ...S.dropBtn, color: "var(--danger)" }}>Logout</button>
        </div>
      )}
    </div>
  );
};

const S = {
  drop: {
    position: "absolute", right: 0, top: 42, width: 200,
    background: "var(--bg-elevated)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-lg)",
    border: "1px solid var(--border)",
    zIndex: 1000, overflow: "hidden",
    animation: "slideUp 0.15s ease",
  },
  dropBtn: {
    width: "100%", padding: "0.5rem 0.85rem",
    background: "none", textAlign: "left",
    color: "var(--text)", fontSize: "0.88rem",
    display: "block",
  },
};

export default DashboardProfile;
