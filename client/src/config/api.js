// Use the same hostname the browser is on, so LAN devices hit the right server
const defaultBase = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? `http://${window.location.hostname}:5000`
  : 'http://localhost:5000';

export const API_BASE = import.meta.env.VITE_API_URL || defaultBase;

/** Prefix for uploaded files served by Express (`/uploads/...`). */
export function resolveUploadUrl(path) {
  if (!path) return '';
  if (String(path).startsWith('http')) return path;
  return `${API_BASE}${path}`;
}
