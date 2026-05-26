const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const protect = require('../middleware/authMiddleware');
const { registerUser, loginUser } = require('../controllers/authController');
const User = require('../models/User');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 80,
  standardHeaders: true,
  legacyHeaders: false
});

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '') || '.jpg';
    const safe = `avatar-${req.user._id}-${Date.now()}${ext}`;
    cb(null, safe);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\//.test(file.mimetype)) {
      return cb(new Error('Only image uploads are allowed'));
    }
    cb(null, true);
  }
});

function validateProfilePayload(body) {
  const errors = [];
  const { name, bio, contact, skillsOffered, skillsWanted, availability, portfolioLink } = body || {};

  if (name != null && String(name).length > 120) errors.push('name is too long');
  if (bio != null && String(bio).length > 4000) errors.push('bio is too long');
  if (contact != null && String(contact).length > 500) errors.push('contact is too long');
  if (availability != null && String(availability).length > 500) errors.push('availability is too long');
  if (portfolioLink != null && String(portfolioLink).length > 2000) errors.push('portfolioLink is too long');

  if (skillsOffered != null && !Array.isArray(skillsOffered)) errors.push('skillsOffered must be an array');
  if (skillsWanted != null && !Array.isArray(skillsWanted)) errors.push('skillsWanted must be an array');

  if (Array.isArray(skillsOffered) && skillsOffered.length > 80) errors.push('too many skillsOffered');
  if (Array.isArray(skillsWanted) && skillsWanted.length > 80) errors.push('too many skillsWanted');

  return errors;
}

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);

router.get('/profile', protect, (req, res) => {
  res.json(req.user);
});

router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

router.post(
  '/profile/avatar',
  protect,
  (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Upload failed' });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const publicPath = `/uploads/${req.file.filename}`;
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { profilePic: publicPath },
        { new: true }
      ).select('-password');
      return res.json({ profilePic: publicPath, user });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

router.post('/profile', async (req, res) => {
  try {
    const {
      email,
      name,
      bio,
      contact,
      skillsOffered,
      skillsWanted,
      availability,
      portfolioLink,
      skillVerificationStatus,
      profilePic
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const ve = validateProfilePayload(req.body);
    if (ve.length) {
      return res.status(400).json({ error: ve.join('; ') });
    }

    let user = await User.findOne({ email: String(email).toLowerCase().trim() });

    if (user) {
      user.name = name || user.name;
      user.bio = bio ?? user.bio;
      user.contact = contact ?? user.contact;
      user.skillsOffered = skillsOffered || user.skillsOffered;
      user.skillsWanted = skillsWanted || user.skillsWanted;
      user.availability = availability ?? user.availability;
      user.portfolioLink = portfolioLink ?? user.portfolioLink;
      user.skillVerificationStatus = skillVerificationStatus || user.skillVerificationStatus;
      user.profilePic = profilePic || user.profilePic;

      await user.save();

      return res.status(200).json({
        message: 'Profile updated successfully',
        user
      });
    }

    user = new User({
      email: String(email).toLowerCase().trim(),
      name: name || 'Member',
      password: crypto.randomBytes(24).toString('hex'),
      bio,
      contact,
      skillsOffered: skillsOffered || [],
      skillsWanted: skillsWanted || [],
      availability,
      portfolioLink,
      skillVerificationStatus,
      profilePic
    });

    await user.save();

    return res.status(201).json({
      message: 'Profile created successfully',
      user
    });
  } catch (err) {
    console.error('REAL ERROR:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

router.get('/userprofile/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email || '')
      .trim()
      .toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user settings
router.get('/settings', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('settings name email');
    res.json(user?.settings || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user settings
router.put('/settings', protect, async (req, res) => {
  try {
    const allowed = [
      'emailNotifications',
      'matchAlerts',
      'sessionReminders',
      'profileVisibility',
      'showEmail',
      'theme'
    ];

    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        update[`settings.${key}`] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true }
    ).select('settings');

    res.json(user.settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete account — password confirmation (403 on wrong password so client 401 interceptor does not log user out)
async function handleDeleteAccount(req, res) {
  try {
    const raw = req.body?.password;
    const password = raw != null ? String(raw).trim() : '';
    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(403).json({ error: 'Incorrect password' });
    }

    const userId = user._id;

    const ChatMessage = require('../models/ChatMessage');
    const ChatThreadRead = require('../models/ChatThreadRead');
    const ConnectionRequest = require('../models/ConnectionRequest');
    const LearningSession = require('../models/LearningSession');

    await Promise.all([
      ConnectionRequest.deleteMany({ $or: [{ from: userId }, { to: userId }] }),
      ChatThreadRead.deleteMany({ userId: userId }),
      ChatMessage.deleteMany({ threadKey: { $regex: String(userId) } }),
      LearningSession.updateMany({}, { $pull: { bookedBy: user.email } }),
      // Remove sessions this user created (by id — survives name changes)
      LearningSession.deleteMany({ createdBy: userId }),
      // Legacy rows without createdBy: match display name only when creator field missing
      LearningSession.deleteMany({
        $and: [
          { instructor: user.name },
          { $or: [{ createdBy: { $exists: false } }, { createdBy: null }] }
        ]
      }),
    ]);

    if (user.profilePic && !String(user.profilePic).startsWith('http')) {
      const rel = String(user.profilePic).replace(/^\//, '');
      const picPath = path.join(__dirname, '..', rel);
      fs.unlink(picPath, () => {});
    }

    await User.findByIdAndDelete(userId);

    return res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
}

// POST preferred: JSON body is reliably delivered (some stacks mishandle DELETE + body)
router.post('/account/delete', protect, handleDeleteAccount);
router.delete('/account', protect, handleDeleteAccount);

module.exports = router;
