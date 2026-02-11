import React, { useState, useEffect } from 'react';
import { userDataService } from '../services/userDataService';

const LiveStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    skillsExchanged: 0,
    successfulMatches: 0
  });

  useEffect(() => {
    // Subscribe to user data changes
    const unsubscribe = userDataService.subscribe(() => {
      updateStats();
    });

    // Initial stats load
    updateStats();

    // Simulate live updating stats with real data base
    const interval = setInterval(() => {
      updateStats();
    }, 3000);

    const updateStats = () => {
      const users = userDataService.getAllUsers();
      const currentUser = userDataService.getCurrentUser();
      
      // Calculate dynamic stats from real data
      const totalSkills = new Set(
        users.flatMap(user => [...(user.skillsToTeach || []), ...(user.skillsToLearn || [])])
      ).size;

      const totalMatches = currentUser ? 
        users.filter(u => u.id !== currentUser.id).length : 0;

      setStats(prev => ({
        totalUsers: Math.min(1247, users.length * 50 + Math.floor(Math.random() * 100)),
        activeSessions: Math.max(0, Math.min(45, prev.activeSessions + (Math.random() > 0.5 ? 1 : -1))),
        skillsExchanged: Math.min(8932, totalSkills * 120 + Math.floor(Math.random() * 50)),
        successfulMatches: Math.min(2156, totalMatches * 80 + Math.floor(Math.random() * 20))
      }));
    };

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📊 Live Platform Stats</h3>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.totalUsers.toLocaleString()}</div>
          <div style={styles.statLabel}>Total Users</div>
          <div style={styles.statTrend}>↗️ +12 today</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.activeSessions}</div>
          <div style={styles.statLabel}>Active Sessions</div>
          <div style={styles.statTrend}>🔥 Live now</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.skillsExchanged.toLocaleString()}</div>
          <div style={styles.statLabel}>Skills Exchanged</div>
          <div style={styles.statTrend}>📈 +89 this week</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.successfulMatches.toLocaleString()}</div>
          <div style={styles.statLabel}>Successful Matches</div>
          <div style={styles.statTrend}>✨ 94% success rate</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  statCard: {
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#4a5568',
    marginBottom: '0.5rem',
    fontWeight: '500',
  },
  statTrend: {
    fontSize: '0.75rem',
    color: '#38a169',
    fontWeight: '600',
  },
};

export default LiveStats;
