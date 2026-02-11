// src/pages/Matches.jsx
import React, { useState, useEffect } from 'react';
import { userDataService } from '../services/userDataService';
import { getTopMatches } from '../utils/matchingAlgorithm';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMatches();
    
    // Subscribe to data changes
    const unsubscribe = userDataService.subscribe(() => {
      loadMatches();
    });
    
    return unsubscribe;
  }, []);

  const loadMatches = () => {
    try {
      const currentUser = userDataService.getCurrentUser();
      const allUsers = userDataService.getAllUsers();
      
      if (currentUser && allUsers) {
        const topMatches = getTopMatches(currentUser, allUsers, 8);
        setMatches(topMatches);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
      // Fallback to mock data if services fail
      setMatches([
        {
          id: 1,
          name: "Priya Sharma",
          skillsToTeach: ["React", "JavaScript"],
          skillsToLearn: ["Python", "Machine Learning"],
          matchData: { score: 92 },
          rating: 4.8,
          experienceLevel: "Intermediate",
          totalSessions: 25,
          isOnline: true,
          lastSeen: "Online",
          location: "Mumbai, India"
        },
        {
          id: 2,
          name: "Rahul Kumar",
          skillsToTeach: ["Python", "Data Science"],
          skillsToLearn: ["React", "UI/UX"],
          matchData: { score: 87 },
          rating: 4.6,
          experienceLevel: "Advanced",
          totalSessions: 42,
          isOnline: false,
          lastSeen: "2 hours ago",
          location: "Bangalore, India"
        }
      ]);
    }
    
    setLoading(false);
    setRefreshing(false);
  };

  const refreshMatches = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadMatches();
    }, 1000);
  };

  const handleConnect = (user) => {
    alert(`Connection request sent to ${user.name}! 🤝`);
  };

  const handleRequestSwap = (user) => {
    alert(`Skill swap request sent to ${user.name}! 📚`);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <h3>🔍 Finding your perfect matches...</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🔍 Your Smart Matches</h2>
        <div style={styles.headerInfo}>
          <p style={styles.subtitle}>
            Found {matches.length} compatible learning partners using AI matching
          </p>
          <button 
            onClick={refreshMatches} 
            disabled={refreshing}
            style={styles.refreshBtn}
          >
            {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Matches'}
          </button>
        </div>
      </div>
      
      <div style={styles.list}>
        {matches.map(user => (
          <div key={user.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.userInfo}>
                <h3 style={styles.userName}>{user.name}</h3>
                <div style={styles.onlineStatus}>
                  <span style={{
                    ...styles.statusDot,
                    backgroundColor: user.isOnline ? '#4CAF50' : '#9E9E9E'
                  }}></span>
                  {user.isOnline ? 'Online' : user.lastSeen}
                </div>
              </div>
              <div style={styles.matchScore}>
                <span style={styles.scoreValue}>{user.matchData?.score || 0}%</span>
                <span style={styles.scoreLabel}>Match</span>
              </div>
            </div>
            
            <div style={styles.skillsSection}>
              <div style={styles.skillGroup}>
                <strong>📚 Can Teach:</strong>
                <div style={styles.skillTags}>
                  {(user.skillsToTeach || []).map(skill => (
                    <span key={skill} style={styles.skillTag}>{skill}</span>
                  ))}
                </div>
              </div>
              <div style={styles.skillGroup}>
                <strong>🎯 Wants to Learn:</strong>
                <div style={styles.skillTags}>
                  {(user.skillsToLearn || []).map(skill => (
                    <span key={skill} style={{...styles.skillTag, ...styles.learnTag}}>{skill}</span>
                  ))}
                </div>
              </div>
            </div>
            
            <div style={styles.userStats}>
              <span>⭐ {user.rating || 4.0}/5</span>
              <span>📈 {user.experienceLevel || 'Intermediate'}</span>
              <span>🎓 {user.totalSessions || 0} sessions</span>
              <span>📍 {user.location || 'Location not specified'}</span>
            </div>
            
            <div style={styles.buttons}>
              <button 
                style={styles.connectBtn}
                onClick={() => handleConnect(user)}
              >
                🤝 Connect
              </button>
              <button 
                style={styles.swapBtn}
                onClick={() => handleRequestSwap(user)}
              >
                📚 Request Swap
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {matches.length === 0 && (
        <div style={styles.noMatches}>
          <h3>🔍 No matches found yet</h3>
          <p>Try adding more skills to your profile to find better matches!</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '2rem auto',
    backgroundColor: '#F0F4FF',
    borderRadius: '12px',
    boxShadow: '0 6px 18px rgba(68, 56, 80, 0.1)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#443850',
    minHeight: '90vh',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  headerInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#6c6c7d',
    margin: 0,
  },
  refreshBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  loading: {
    textAlign: 'center',
    padding: '4rem 0',
    fontSize: '1.2rem',
    color: '#6c6c7d',
  },
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    margin: '0 0 0.5rem 0',
    color: '#443850',
  },
  onlineStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: '#6c6c7d',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  matchScore: {
    textAlign: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: '8px',
    padding: '0.5rem',
    minWidth: '70px',
  },
  scoreValue: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#0ea5e9',
  },
  scoreLabel: {
    fontSize: '0.75rem',
    color: '#6c6c7d',
  },
  skillsSection: {
    marginBottom: '1rem',
  },
  skillGroup: {
    marginBottom: '0.75rem',
  },
  skillTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  skillTag: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  learnTag: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
  },
  userStats: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.5rem',
    marginBottom: '1rem',
    fontSize: '0.85rem',
    color: '#6c6c7d',
    flexWrap: 'wrap',
  },
  buttons: {
    display: 'flex',
    gap: '0.75rem',
  },
  connectBtn: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  swapBtn: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: 'white',
    color: '#6366f1',
    border: '2px solid #6366f1',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  noMatches: {
    textAlign: 'center',
    padding: '3rem',
    color: '#6c6c7d',
  },
};

export default Matches;
