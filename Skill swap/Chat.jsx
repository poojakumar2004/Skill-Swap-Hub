import React, { useState, useEffect } from 'react';

const Chat = ({ user1, user2 }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/chat?user1=${user1}&user2=${user2}`);
        const data = await res.json();
        setMessages(data.messages);
      } catch (err) {
        console.error("Failed to fetch chat", err);
      }
    };
    fetchChat();
  }, [user1, user2]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;

    try {
      const res = await fetch('http://localhost:5000/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1, user2, sender: user1, text: newMsg }),
      });
      if (!res.ok) throw new Error("Failed to send");

      const updatedChat = await res.json();
      setMessages(updatedChat.messages);
      setNewMsg("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', textAlign: 'left' }}>
      <h3>Chat between {user1} and {user2}</h3>
      <div style={{ border: '1px solid #ccc', height: '300px', overflowY: 'auto', padding: '0.5rem' }}>
        {messages.map((m, i) => (
          <p key={i}><b>{m.sender === user1 ? "You" : m.sender}:</b> {m.text}</p>
        ))}
      </div>
      <input
        type="text"
        value={newMsg}
        onChange={e => setNewMsg(e.target.value)}
        placeholder="Type message..."
        style={{ width: '80%' }}
      />
      <button onClick={sendMessage} style={{ width: '18%', marginLeft: '2%' }}>Send</button>
    </div>
  );
};

export default Chat;
