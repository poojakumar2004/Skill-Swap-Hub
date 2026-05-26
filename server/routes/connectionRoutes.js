const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const ConnectionRequest = require('../models/ConnectionRequest');
const User = require('../models/User');

// Send a connection request
router.post('/connections', protect, async (req, res) => {
  try {
    const { toUserId, message = '' } = req.body;

    if (!toUserId) {
      return res.status(400).json({ error: 'toUserId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (String(req.user._id) === String(toUserId)) {
      return res.status(400).json({ error: 'Cannot send request to yourself' });
    }

    const targetUser = await User.findById(toUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Max 20 pending outgoing requests
    const pendingCount = await ConnectionRequest.countDocuments({
      from: req.user._id,
      status: 'pending'
    });
    if (pendingCount >= 20) {
      return res.status(429).json({ error: 'Too many pending requests (max 20). Wait for some to be accepted or declined.' });
    }

    // Check both directions — A→B or B→A
    const existing = await ConnectionRequest.findOne({
      $or: [
        { from: req.user._id, to: toUserId },
        { from: toUserId, to: req.user._id }
      ]
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(409).json({ error: 'Already connected' });
      }
      if (existing.status === 'pending') {
        return res.status(409).json({ error: 'Request already pending' });
      }
      // If declined, allow re-sending by updating the old record
      existing.from = req.user._id;
      existing.to = toUserId;
      existing.status = 'pending';
      existing.message = message;
      await existing.save();
      return res.status(200).json(existing);
    }

    const request = await ConnectionRequest.create({
      from: req.user._id,
      to: toUserId,
      message
    });

    res.status(201).json(request);
  } catch (err) {
    console.error('Connection error:', err);
    const msg = err.code === 11000
      ? 'Request already exists'
      : err.message || 'Server error';
    res.status(500).json({ error: msg });
  }
});

// Get incoming pending requests
router.get('/connections/incoming', protect, async (req, res) => {
  try {
    const requests = await ConnectionRequest.find({
      to: req.user._id,
      status: 'pending'
    })
      .populate('from', 'name email skillsOffered skillsWanted profilePic')
      .sort({ createdAt: -1 })
      .lean();

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get outgoing requests (all statuses)
router.get('/connections/outgoing', protect, async (req, res) => {
  try {
    const requests = await ConnectionRequest.find({ from: req.user._id })
      .populate('to', 'name email skillsOffered skillsWanted profilePic')
      .sort({ createdAt: -1 })
      .lean();

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get ALL my connections (both directions, all statuses) — for button state
router.get('/connections/all', protect, async (req, res) => {
  try {
    const myId = req.user._id;
    const requests = await ConnectionRequest.find({
      $or: [{ from: myId }, { to: myId }]
    }).lean();

    const map = {};
    const my = String(myId);
    requests.forEach((r) => {
      const otherId = String(r.from) === my ? String(r.to) : String(r.from);
      map[otherId] = r.status;
    });

    res.json(map);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept or decline a request
router.patch('/connections/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Status must be accepted or declined' });
    }

    const request = await ConnectionRequest.findOne({
      _id: req.params.id,
      to: req.user._id
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    request.status = status;
    await request.save();

    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
