const express = require('express');
const router = express.Router();
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');
const { scorePair } = require('../utils/matchScore');

router.get('/match', protect, async (req, res) => {
  try {
    const me = await User.findById(req.user._id).lean();
    if (!me) {
      return res.status(404).json({ error: 'User not found' });
    }

    const others = await User.find({ _id: { $ne: req.user._id } })
      .select('-password')
      .lean();

    const matches = others
      .map((u) => {
        const skillsToTeach = u.skillsOffered || [];
        const skillsToLearn = u.skillsWanted || [];
        const score = scorePair(me, u);
        return {
          id: String(u._id),
          name: u.name,
          email: u.email,
          skillsToTeach,
          skillsToLearn,
          matchData: { score },
          rating: 4.5,
          experienceLevel: 'Member',
          totalSessions: 0,
          isOnline: false,
          lastSeen: '—',
          location: u.contact || '—'
        };
      })
      // Drop 0% and profiles with nothing to show (no offered/wanted skills)
      .filter(
        (m) =>
          Number(m.matchData.score) > 0 &&
          (m.skillsToTeach.length > 0 || m.skillsToLearn.length > 0)
      )
      .sort((a, b) => b.matchData.score - a.matchData.score)
      .slice(0, 24);

    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
