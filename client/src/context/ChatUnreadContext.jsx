import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import http from '../services/http';

const ChatUnreadContext = createContext({ unread: 0, refresh: async () => {} });

export function ChatUnreadProvider({ children }) {
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const r = await http.get('/chat/unread');
      setUnread(Number(r.data?.unread) || 0);
    } catch {
      setUnread(0);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    const onVis = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [refresh]);

  return (
    <ChatUnreadContext.Provider value={{ unread, refresh }}>
      {children}
    </ChatUnreadContext.Provider>
  );
}

export function useChatUnread() {
  return useContext(ChatUnreadContext);
}
