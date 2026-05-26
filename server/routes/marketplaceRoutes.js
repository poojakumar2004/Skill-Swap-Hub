const express = require('express');
const router = express.Router();
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');

router.get('/marketplace', protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('-password')
      .limit(100)
      .lean();

    const listings = users.map((u, idx) => ({
      id: String(u._id),
      userId: String(u._id),
      user: u.name || 'Member',
      email: u.email,
      skillOffered: (u.skillsOffered && u.skillsOffered[0]) || '—',
      skillWanted: (u.skillsWanted && u.skillsWanted[0]) || '—',
      experience: u.bio ? 'See profile' : '—',
      rating: 4.5,
      availability: u.availability || '—',
      skillsOffered: u.skillsOffered || [],
      skillsWanted: u.skillsWanted || []
    }));

    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
