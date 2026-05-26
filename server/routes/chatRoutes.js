const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const ChatThreadRead = require('../models/ChatThreadRead');
const ConnectionRequest = require('../models/ConnectionRequest');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');

function pairKey(user1, user2) {
  return [String(user1), String(user2)].sort().join('||');
}

/** Match legacy messages where `sender` may be stored as string or ObjectId. */
function senderIsOther(otherId) {
  const s = String(otherId);
  if (mongoose.isValidObjectId(s)) {
    return { $in: [s, new mongoose.Types.ObjectId(s)] };
  }
  return s;
}

/**
 * Cursor time "after" the latest message so `createdAt > lastReadAt` does not
 * spuriously count the latest row (BSON / driver rounding made strict `>` unreliable).
 */
function readCursorAfterLatest(latest) {
  if (!latest?.createdAt) return new Date();
  return new Date(new Date(latest.createdAt).getTime() + 1);
}

/** Advance this user's read cursor past the latest message in the thread (or now if empty). */
async function bumpReadCursor(userId, threadKey) {
  const latest = await ChatMessage.findOne({ threadKey }).sort({ createdAt: -1 }).lean();
  const at = readCursorAfterLatest(latest);
  await ChatThreadRead.findOneAndUpdate(
    { userId, threadKey },
    { $set: { lastReadAt: at } },
    { upsert: true, setDefaultsOnInsert: true }
  );
}

/** Count messages from `otherId` in `threadKey` with createdAt > lastReadAt for `me`. */
async function countUnreadFromOther(meId, otherId) {
  const threadKey = pairKey(meId, otherId);
  const readDoc = await ChatThreadRead.findOne({ userId: meId, threadKey }).lean();
  const lastReadAt = readDoc?.lastReadAt ? new Date(readDoc.lastReadAt) : new Date(0);
  return ChatMessage.countDocuments({
    threadKey,
    sender: senderIsOther(otherId),
    createdAt: { $gt: lastReadAt }
  });
}

// Get contacts (accepted connections)
router.get('/chat/contacts', protect, async (req, res) => {
  try {
    const myId = req.user._id;

    const connections = await ConnectionRequest.find({
      $or: [{ from: myId }, { to: myId }],
      status: 'accepted'
    }).lean();

    const contactIds = connections.map((c) =>
      String(c.from) === String(myId) ? String(c.to) : String(c.from)
    );

    const users = await User.find({ _id: { $in: contactIds } })
      .select('name email profilePic skillsOffered')
      .lean();

    const contacts = await Promise.all(
      users.map(async (u) => {
        const threadKey = pairKey(myId, u._id);
        const lastMsg = await ChatMessage.findOne({ threadKey })
          .sort({ createdAt: -1 })
          .lean();

        const unread = await countUnreadFromOther(myId, u._id);

        return {
          id: String(u._id),
          name: u.name,
          email: u.email,
          profilePic: u.profilePic || '',
          skills: (u.skillsOffered || []).slice(0, 3),
          lastMessage: lastMsg?.text || '',
          lastMessageTime: lastMsg?.createdAt || null,
          unread
        };
      })
    );

    contacts.sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Total unread (incoming messages not yet read) across all threads
router.get('/chat/unread', protect, async (req, res) => {
  try {
    const myId = req.user._id;

    const connections = await ConnectionRequest.find({
      $or: [{ from: myId }, { to: myId }],
      status: 'accepted'
    }).lean();

    const contactIds = connections.map((c) =>
      String(c.from) === String(myId) ? String(c.to) : String(c.from)
    );

    let total = 0;
    for (const cId of contactIds) {
      total += await countUnreadFromOther(myId, cId);
    }

    res.json({ unread: total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark thread with user2 as read up to latest message (call when user opens thread or after loading messages)
router.post('/chat/read', protect, async (req, res) => {
  try {
    const { user2 } = req.body || {};
    if (!user2) {
      return res.status(400).json({ error: 'user2 is required' });
    }

    const threadKey = pairKey(req.user._id, user2);
    await bumpReadCursor(req.user._id, threadKey);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages between two users
router.get('/chat', protect, async (req, res) => {
  try {
    const { user2 } = req.query;
    const user1 = String(req.user._id);
    if (!user2) {
      return res.status(400).json({ error: 'user2 is required' });
    }

    const threadKey = pairKey(user1, user2);
    const rows = await ChatMessage.find({ threadKey }).sort({ createdAt: 1 }).lean();

    // Mark read when messages are loaded (same as POST /chat/read) so unread clears
    // even if the client never calls POST or it fails.
    await bumpReadCursor(req.user._id, threadKey);

    const messages = rows.map((m) => ({
      id: String(m._id),
      sender: m.sender,
      text: m.text,
      createdAt: m.createdAt
    }));

    return res.json({ messages });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Send a message
router.post('/chat/send', protect, async (req, res) => {
  try {
    const { user2, text } = req.body || {};
    const user1 = String(req.user._id);
    const sender = user1;

    if (!user2 || text == null || !text.trim()) {
      return res.status(400).json({ error: 'user2 and text are required' });
    }

    const threadKey = pairKey(user1, user2);
    await ChatMessage.create({ threadKey, sender, text: text.trim() });

    // Sender has "seen" the thread through the latest message
    await bumpReadCursor(req.user._id, threadKey);

    const rows = await ChatMessage.find({ threadKey }).sort({ createdAt: 1 }).lean();
    const messages = rows.map((m) => ({
      id: String(m._id),
      sender: m.sender,
      text: m.text,
      createdAt: m.createdAt
    }));

    return res.json({ messages });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
