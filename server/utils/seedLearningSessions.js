const LearningSession = require('../models/LearningSession');

const DEFAULT_SESSIONS = [
  {
    title: 'React Fundamentals',
    instructor: 'Sarah Johnson',
    skill: 'React.js',
    duration: '2 hours',
    scheduledTime: 'Today 3:00 PM',
    description:
      'Learn the basics of React including components, props, and state management.',
    price: 'Free',
    bookedBy: []
  },
  {
    title: 'JavaScript ES6+ Features',
    instructor: 'Mike Chen',
    skill: 'JavaScript',
    duration: '1.5 hours',
    scheduledTime: 'Tomorrow 10:00 AM',
    description:
      'Master modern JavaScript features like arrow functions, destructuring, and async/await.',
    price: 'Free',
    bookedBy: []
  },
  {
    title: 'UI/UX Design Principles',
    instructor: 'Emily Davis',
    skill: 'UI/UX Design',
    duration: '3 hours',
    scheduledTime: 'Friday 2:00 PM',
    description:
      'Understand user-centered design principles and create intuitive interfaces.',
    price: 'Free',
    bookedBy: []
  }
];

async function seedLearningSessionsIfEmpty() {
  const n = await LearningSession.countDocuments();
  if (n === 0) {
    await LearningSession.insertMany(DEFAULT_SESSIONS);
    console.log('📅 Seeded default learning sessions');
  }
}

module.exports = { seedLearningSessionsIfEmpty };
