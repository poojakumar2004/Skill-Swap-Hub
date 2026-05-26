// Dynamic User Data Service for SkillSwap
// Provides real-time user data and matching capabilities

class UserDataService {
  constructor() {
    this.users = [];
    this.currentUser = null;
    this.subscribers = [];
    this.initialized = false;
  }

  // Initialize with sample data
  initialize() {
    if (this.initialized) return;
    
    this.currentUser = this.getCurrentUserFromStorage() || this.createSampleCurrentUser();
    this.users = this.generateDynamicUsers();
    this.initialized = true;
    this.notifySubscribers();
  }

  // Get current user from localStorage or create default
  getCurrentUserFromStorage() {
    try {
      const user = localStorage.getItem('skillswap_user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error loading user from storage:', error);
      return null;
    }
  }

  // Create a sample current user
  createSampleCurrentUser() {
    const currentUser = {
      id: 'current-user',
      name: 'Alex Thompson',
      email: 'alex@skillswap.com',
      skillsToTeach: ['React', 'JavaScript', 'Node.js'],
      skillsToLearn: ['Python', 'Machine Learning', 'Docker'],
      experienceLevel: 'Intermediate',
      location: 'San Francisco, CA',
      bio: 'Full-stack developer passionate about learning new technologies',
      rating: 4.8,
      totalSessions: 25,
      joinedDate: '2024-01-15'
    };
    
    // Save to localStorage
    localStorage.setItem('skillswap_user', JSON.stringify(currentUser));
    return currentUser;
  }

  // Generate dynamic users with relevant skills
  generateDynamicUsers() {
    const skillCategories = {
      'Programming': ['React', 'Vue.js', 'Angular', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Node.js', 'Go'],
      'Design': ['UI/UX', 'Photoshop', 'Illustrator', 'Figma', 'Adobe XD', 'Sketch', 'Graphic Design'],
      'Data Science': ['Machine Learning', 'Data Analysis', 'Python', 'R', 'SQL', 'Tableau', 'Power BI'],
      'DevOps': ['Docker', 'Kubernetes', 'AWS', 'Azure', 'Jenkins', 'CI/CD', 'Linux'],
      'Marketing': ['Digital Marketing', 'SEO', 'Content Writing', 'Social Media', 'Email Marketing'],
      'Business': ['Project Management', 'Agile', 'Scrum', 'Leadership', 'Public Speaking', 'Negotiation']
    };

    const names = [
      'Priya Sharma', 'Rahul Kumar', 'Anjali Patel', 'Vikram Singh', 'Sneha Reddy',
      'Arjun Gupta', 'Kavya Nair', 'Ravi Verma', 'Pooja Joshi', 'Sanjay Mehta',
      'Divya Agarwal', 'Kiran Shah', 'Neha Bansal', 'Amit Chopra', 'Richa Saxena'
    ];

    const locations = [
      'Mumbai, India', 'Bangalore, India', 'Delhi, India', 'Chennai, India', 'Hyderabad, India',
      'Pune, India', 'Kolkata, India', 'Ahmedabad, India', 'Jaipur, India', 'Indore, India'
    ];

    const experienceLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

    return names.map((name, index) => {
      const allSkills = Object.values(skillCategories).flat();
      const skillsToTeach = this.getRandomSkills(allSkills, 2, 4);
      const skillsToLearn = this.getRandomSkills(
        allSkills.filter(skill => !skillsToTeach.includes(skill)), 
        1, 3
      );

      return {
        id: `user-${index + 1}`,
        name,
        skillsToTeach,
        skillsToLearn,
        experienceLevel: experienceLevels[Math.floor(Math.random() * experienceLevels.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        rating: +(3.5 + Math.random() * 1.5).toFixed(1),
        totalSessions: Math.floor(Math.random() * 50) + 5,
        isOnline: Math.random() > 0.3,
        lastSeen: this.generateLastSeen(),
        bio: this.generateBio(skillsToTeach[0]),
        joinedDate: this.generateJoinedDate()
      };
    });
  }

  // Helper methods
  getRandomSkills(skills, min, max) {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...skills].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  generateLastSeen() {
    const minutes = Math.floor(Math.random() * 60);
    if (minutes < 5) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  generateBio(primarySkill) {
    const bios = [
      `Passionate ${primarySkill} developer looking to expand my skills`,
      `${primarySkill} enthusiast with a love for teaching and learning`,
      `Experienced in ${primarySkill}, always eager to share knowledge`,
      `${primarySkill} professional seeking to learn new technologies`
    ];
    return bios[Math.floor(Math.random() * bios.length)];
  }

  generateJoinedDate() {
    const start = new Date(2023, 0, 1);
    const end = new Date();
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate.toISOString().split('T')[0];
  }

  // Public methods
  getCurrentUser() {
    if (!this.initialized) this.initialize();
    return this.currentUser;
  }

  getAllUsers() {
    if (!this.initialized) this.initialize();
    return this.users;
  }

  updateCurrentUser(updates) {
    this.currentUser = { ...this.currentUser, ...updates };
    localStorage.setItem('skillswap_user', JSON.stringify(this.currentUser));
    this.notifySubscribers();
  }

  // Subscription pattern for real-time updates
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  // Get matches for a user (will integrate with matching algorithm)
  getMatches(user) {
    return this.users.filter(u => u.id !== user.id).slice(0, 10);
  }
}

// Export singleton instance
export const userDataService = new UserDataService();
