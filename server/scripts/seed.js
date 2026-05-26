const mongoose = require('mongoose');
const UserSkill = require('../models/UserSkill');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to DB'))
  .catch(err => console.error('❌ DB error:', err));

const seedUser = new UserSkill({
  email: 'test@example.com',
  skillsOffered: ['JavaScript', 'HTML', 'CSS'],
  skillsWanted: ['React', 'MongoDB']
});

seedUser.save()
  .then(() => {
    console.log('✅ Test user inserted');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Insert error:', err);
    mongoose.disconnect();
  });
