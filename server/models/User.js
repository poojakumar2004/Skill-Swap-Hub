const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  skillsOffered: [String],
  skillsWanted: [String],
  availability: String,
  portfolioLink: String,
  profilePic: { type: String, default: '' },
  bio: String,
  contact: String,
  skillVerificationStatus: { type: String, default: 'Pending' },
  settings: {
    emailNotifications: { type: Boolean, default: true },
    matchAlerts: { type: Boolean, default: true },
    sessionReminders: { type: Boolean, default: true },
    profileVisibility: { type: String, enum: ['public', 'connections', 'private'], default: 'public' },
    showEmail: { type: Boolean, default: false },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' }
  }
}, {
  timestamps: true
});

// ✅ FIXED password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();   // 🔥 IMPORTANT FIX
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);