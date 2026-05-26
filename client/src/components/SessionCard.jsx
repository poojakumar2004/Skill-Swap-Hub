import React, { useState } from 'react';

const SessionCard = ({ session, onBook }) => {
  const [isBooking, setIsBooking] = useState(false);

  const handleBookClick = async () => {
    setIsBooking(true);
    await onBook(session._id);
    setIsBooking(false);
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{session.title}</h3>
      <p style={styles.instructor}><strong>Instructor:</strong> {session.instructor}</p>
      <p style={styles.skill}><strong>Skill:</strong> {session.skill}</p>
      <p style={styles.duration}><strong>Duration:</strong> {session.duration}</p>
      <p style={styles.time}><strong>Time:</strong> {session.scheduledTime}</p>
      <p style={styles.description}>{session.description}</p>
      
      <div style={styles.footer}>
        <span style={styles.price}>{session.price || 'Free'}</span>
        <button 
          onClick={handleBookClick} 
          disabled={isBooking}
          style={{
            ...styles.bookButton,
            backgroundColor: isBooking ? '#ccc' : '#3E54AC',
            cursor: isBooking ? 'not-allowed' : 'pointer'
          }}
        >
          {isBooking ? 'Booking...' : 'Book Session'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 6px 15px rgba(62, 84, 172, 0.12)',
    border: '1px solid #E0E4FF',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
  },
  title: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#3E54AC',
    marginBottom: '0.5rem',
  },
  instructor: {
    color: '#2C2C2C',
    marginBottom: '0.3rem',
  },
  skill: {
    color: '#2C2C2C',
    marginBottom: '0.3rem',
  },
  duration: {
    color: '#2C2C2C',
    marginBottom: '0.3rem',
  },
  time: {
    color: '#2C2C2C',
    marginBottom: '0.5rem',
  },
  description: {
    color: '#666',
    fontSize: '0.95rem',
    lineHeight: '1.4',
    marginBottom: '1rem',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#00b894',
  },
  bookButton: {
    backgroundColor: '#3E54AC',
    color: '#fff',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
};

export default SessionCard;
