/** Normalize Mongo id keys from /connections/all for reliable lookups */
export function normalizeConnectionMap(raw) {
  const out = {};
  if (raw && typeof raw === 'object') {
    for (const k of Object.keys(raw)) {
      out[String(k)] = raw[k];
    }
  }
  return out;
}

export function connectionStatus(map, rawId) {
  if (rawId == null || rawId === '') return undefined;
  return map[String(rawId)];
}
