import React, { useState, useEffect } from 'react';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Simulate real-time notifications
    const notificationTypes = [
      { type: 'match', message: 'New skill match found! 🎯', icon: '🔔' },
      { type: 'message', message: 'New message from Priya Sharma 💬', icon: '📨' },
      { type: 'session', message: 'Session starting in 5 minutes ⏰', icon: '🎥' },
      { type: 'achievement', message: 'You completed your first skill swap! 🏆', icon: '🎉' },
      { type: 'request', message: 'New connection request from Rahul Kumar 🤝', icon: '👋' }
    ];

    const addNotification = () => {
      const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const newNotification = {
        id: Date.now(),
        ...randomNotification,
        timestamp: new Date().toLocaleTimeString()
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep only 5 notifications

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    };

    // Add initial notification
    setTimeout(addNotification, 2000);

    // Random notifications every 8-15 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance
        addNotification();
      }
    }, Math.random() * 7000 + 8000);

    return () => clearInterval(interval);
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div style={styles.container}>
      {notifications.map((notification, index) => (
        <div 
          key={notification.id} 
          style={{
            ...styles.notification,
            top: `${20 + index * 80}px`,
            animationDelay: `${index * 0.1}s`
          }}
          onClick={() => removeNotification(notification.id)}
        >
          <div style={styles.notificationIcon}>
            {notification.icon}
          </div>
          <div style={styles.notificationContent}>
            <div style={styles.notificationMessage}>
              {notification.message}
            </div>
            <div style={styles.notificationTime}>
              {notification.timestamp}
            </div>
          </div>
          <div style={styles.closeBtn}>×</div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    top: '0',
    right: '20px',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  notification: {
    position: 'absolute',
    right: '0',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    border: '1px solid #e2e8f0',
    minWidth: '300px',
    maxWidth: '400px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    cursor: 'pointer',
    pointerEvents: 'all',
    animation: 'slideInRight 0.3s ease-out',
    transition: 'all 0.3s ease',
  },
  notificationIcon: {
    fontSize: '1.5rem',
    minWidth: '2rem',
    textAlign: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#2d3748',
    marginBottom: '0.25rem',
    lineHeight: '1.4',
  },
  notificationTime: {
    fontSize: '0.75rem',
    color: '#718096',
  },
  closeBtn: {
    fontSize: '1.2rem',
    color: '#a0aec0',
    cursor: 'pointer',
    lineHeight: '1',
    minWidth: '1rem',
    textAlign: 'center',
  },
};

// Add CSS animation keyframes
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(styleSheet);

export default NotificationSystem;
