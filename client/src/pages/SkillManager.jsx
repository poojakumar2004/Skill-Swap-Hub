import React, { useState, useEffect } from 'react';
import http from '../services/http';
import './SkillManager.css';

const SkillManager = () => {
  const userEmail = (localStorage.getItem('userEmail') || '').trim();
  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsWanted, setSkillsWanted] = useState([]);
  const [newOffered, setNewOffered] = useState('');
  const [newWanted, setNewWanted] = useState('');

  useEffect(() => {
    if (!userEmail) return;

    const fetchSkills = async () => {
      try {
        const res = await http.get(`/skills/${encodeURIComponent(userEmail)}`);
        setSkillsOffered(res.data.skillsOffered || []);
        setSkillsWanted(res.data.skillsWanted || []);
      } catch (error) {
        console.error('Error fetching skills:', error);
      }
    };
    fetchSkills();
  }, [userEmail]);

  const saveSkills = async (offered, wanted) => {
    if (!userEmail) {
      alert('Please log in again.');
      return;
    }
    try {
      await http.put(`/skills/${encodeURIComponent(userEmail)}`, {
        skillsOffered: offered,
        skillsWanted: wanted,
      });
    } catch (error) {
      console.error('Failed to save skills:', error);
      alert('Failed to save skills. Please try again.');
    }
  };

  const addSkill = async (type) => {
    if (type === 'offered' && newOffered.trim()) {
      const newSkills = [...skillsOffered, newOffered.trim()];
      setSkillsOffered(newSkills);
      setNewOffered('');
      await saveSkills(newSkills, skillsWanted);
    } else if (type === 'wanted' && newWanted.trim()) {
      const newSkills = [...skillsWanted, newWanted.trim()];
      setSkillsWanted(newSkills);
      setNewWanted('');
      await saveSkills(skillsOffered, newSkills);
    }
  };

  const deleteSkill = async (type, index) => {
    if (type === 'offered') {
      const newSkills = skillsOffered.filter((_, i) => i !== index);
      setSkillsOffered(newSkills);
      await saveSkills(newSkills, skillsWanted);
    } else {
      const newSkills = skillsWanted.filter((_, i) => i !== index);
      setSkillsWanted(newSkills);
      await saveSkills(skillsOffered, newSkills);
    }
  };

  if (!userEmail) {
    return (
      <div className="skill-manager-container">
        <p>Please log in to manage skills.</p>
      </div>
    );
  }

  return (
    <div className="skill-manager-container">
      <h2 className="skill-manager-title">Skill Management</h2>

      <div className="skill-card">
        <h3>Skills I Can Teach</h3>
        <ul>
          {skillsOffered.map((skill, idx) => (
            <li key={idx}>
              {skill}
              <button onClick={() => deleteSkill('offered', idx)} className="del-btn">Remove</button>
            </li>
          ))}
        </ul>
        <div className="input-group">
          <input
            value={newOffered}
            onChange={(e) => setNewOffered(e.target.value)}
            placeholder="Add skill you offer"
          />
          <button onClick={() => addSkill('offered')} className="add-btn">Add</button>
        </div>
      </div>

      <div className="skill-card">
        <h3>Skills I Want to Learn</h3>
        <ul>
          {skillsWanted.map((skill, idx) => (
            <li key={idx}>
              {skill}
              <button onClick={() => deleteSkill('wanted', idx)} className="del-btn">Remove</button>
            </li>
          ))}
        </ul>
        <div className="input-group">
          <input
            value={newWanted}
            onChange={(e) => setNewWanted(e.target.value)}
            placeholder="Add skill you want"
          />
          <button onClick={() => addSkill('wanted')} className="add-btn">Add</button>
        </div>
      </div>
    </div>
  );
};

export default SkillManager;
