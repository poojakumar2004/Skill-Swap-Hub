/** Fired when connection state changes (accept/decline in header, etc.) */
export const CONNECTIONS_CHANGED = 'skillswap:connections-changed';

export function emitConnectionsChanged() {
  window.dispatchEvent(new CustomEvent(CONNECTIONS_CHANGED));
}
