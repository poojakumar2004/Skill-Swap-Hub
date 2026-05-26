const express = require('express');
const router = express.Router();
const User = require('../models/User');
const LearningSession = require('../models/LearningSession');
const protect = require('../middleware/authMiddleware');

function sessionToClient(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    ...o,
    _id: String(o._id)
  };
}

// Create a new learning session (authenticated — stored with createdBy for reliable delete on account removal)
router.post('/sessions', protect, async (req, res) => {
  try {
    const { title, skill, duration, scheduledTime, description, price } = req.body;
    if (!title || !skill) {
      return res.status(400).json({ error: 'Title and skill are required' });
    }

    const instructorName = (req.body.instructor && String(req.body.instructor).trim())
      || req.user.name
      || 'Member';

    const session = await LearningSession.create({
      createdBy: req.user._id,
      title,
      instructor: instructorName,
      skill,
      duration: duration || '1 hour',
      scheduledTime: scheduledTime || '',
      description: description || '',
      price: price || 'Free'
    });

    res.status(201).json(sessionToClient(session));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/sessions', async (req, res) => {
  try {
    const list = await LearningSession.find().sort({ createdAt: 1 }).lean();
    res.json(list.map((s) => ({ ...s, _id: String(s._id) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/sessions/:id/book', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { userId = 'demo-user' } = req.body || {};

    // Don't let instructor book their own session
    const existing = await LearningSession.findById(sessionId);
    if (!existing) {
      return res.status(404).json({ error: 'Session not found' });
    }
    if (existing.instructor === userId || existing.instructor === req.body?.userName) {
      return res.status(400).json({ error: 'You cannot book your own session' });
    }

    const session = await LearningSession.findByIdAndUpdate(
      sessionId,
      { $addToSet: { bookedBy: userId } },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      message: 'Session booked successfully!',
      session: sessionToClient(session)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/skills/:userId', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.userId || '')
      .trim()
      .toLowerCase();
    if (!email) return res.status(400).json({ error: 'userId (email) is required' });

    const user = await User.findOne({ email }).select('skillsOffered skillsWanted');
    if (!user) {
      return res.json({ skillsOffered: [], skillsWanted: [] });
    }
    return res.json({
      skillsOffered: user.skillsOffered || [],
      skillsWanted: user.skillsWanted || []
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.put('/skills/:userId', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.userId || '')
      .trim()
      .toLowerCase();
    if (!email) return res.status(400).json({ error: 'userId (email) is required' });

    const { skillsOffered = [], skillsWanted = [] } = req.body || {};

    const user = await User.findOneAndUpdate(
      { email },
      { $set: { skillsOffered, skillsWanted } },
      { new: true }
    ).select('skillsOffered skillsWanted');

    return res.json({
      message: 'Skills updated successfully',
      skillsOffered: user?.skillsOffered || skillsOffered,
      skillsWanted: user?.skillsWanted || skillsWanted
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
