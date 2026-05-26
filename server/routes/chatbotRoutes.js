const express = require('express');
const router = express.Router();
const User = require('../models/User');
const LearningSession = require('../models/LearningSession');

router.post('/chatbot', async (req, res) => {
  try {
    const { message, userEmail } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const msg = message.toLowerCase().trim();
    let reply = '';

    // Fetch user context
    let user = null;
    if (userEmail) {
      user = await User.findOne({ email: userEmail.toLowerCase().trim() })
        .select('name skillsOffered skillsWanted')
        .lean();
    }

    // --- Order matters: specific matches FIRST, generic LAST ---

    // Stats (must come before "how" / "help")
    if (msg.includes('how many') || msg.includes('stats') || msg.includes('count') || msg === 'users') {
      const totalUsers = await User.countDocuments();
      const totalSessions = await LearningSession.countDocuments();
      reply = `Platform stats:\n- ${totalUsers} registered users\n- ${totalSessions} learning sessions\n\nThe community is growing!`;
    }
    // My skills (must come before generic "skill")
    else if (msg.includes('my skill') || msg.includes('show my') || msg.includes('what skill')) {
      if (user) {
        const offered = (user.skillsOffered || []).join(', ') || 'none yet';
        const wanted = (user.skillsWanted || []).join(', ') || 'none yet';
        reply = `Your skills:\n\nTeaching: ${offered}\nLearning: ${wanted}\n\nUpdate them in "Manage Skills".`;
      } else {
        reply = `I can't see your skills. Make sure you're logged in, then visit "Manage Skills".`;
      }
    }
    // Specific skill searches
    else if (msg.includes('python') || msg.includes('react') || msg.includes('javascript') || msg.includes('java') || msg.includes('design') || msg.includes('node')) {
      const skill = msg.includes('python') ? 'Python'
        : msg.includes('react') ? 'React'
        : msg.includes('javascript') ? 'JavaScript'
        : msg.includes('node') ? 'Node.js'
        : msg.includes('java') ? 'Java'
        : 'Design';
      const count = await User.countDocuments({
        skillsOffered: { $regex: new RegExp(skill, 'i') }
      });
      reply = count > 0
        ? `${count} user(s) teach ${skill} on SkillSwap! Check "Marketplace" to find them.`
        : `No one teaches ${skill} yet. You could be the first! Add it in "Manage Skills".`;
    }
    // Sessions
    else if (msg.includes('session') || msg.includes('class') || msg.includes('book') || msg.includes('learn')) {
      const sessions = await LearningSession.find().limit(5).lean();
      if (sessions.length > 0) {
        const list = sessions.map((s) => `- ${s.title} (${s.skill}) by ${s.instructor}`).join('\n');
        reply = `Available sessions:\n\n${list}\n\nVisit "Learning Sessions" to book one!`;
      } else {
        reply = `No sessions right now. You can create one from "Learning Sessions" > "Create Session".`;
      }
    }
    // Match / find partner
    else if (msg.includes('match') || msg.includes('partner') || msg.includes('find')) {
      const totalUsers = await User.countDocuments();
      reply = `We have ${totalUsers} users! Visit "Matches" to find learning partners based on your skill overlap.`;
    }
    // Greeting
    else if (msg.includes('hello') || msg.includes('hi') || msg === 'hey' || msg === 'yo') {
      const name = user?.name ? `, ${user.name}` : '';
      reply = `Hello${name}! I can help with:\n- "Show my skills" — see your skills\n- "How many users?" — platform stats\n- "Find sessions" — available sessions\n- "Find matches" — learning partners\n- "Help" — all features`;
    }
    // Teach
    else if (msg.includes('teach') || msg.includes('offer')) {
      reply = `To start teaching:\n1. Go to "Manage Skills"\n2. Add skills under "Skills I Can Teach"\n3. Others will find you in Matches and Marketplace\n4. Accept connection requests and start sessions!`;
    }
    // Help
    else if (msg.includes('help') || msg.includes('what can') || msg.includes('how do') || msg.includes('how to')) {
      reply = `Here's what you can do:\n\n- Matches: Find learning partners\n- Marketplace: Browse skill offerings\n- Manage Skills: Add your skills\n- Sessions: Join or create learning sessions\n- Peer Learning: Video call matched peers\n- Chat: Message your connections\n- Settings: Notifications, privacy, dark mode`;
    }
    // Thanks
    else if (msg.includes('thanks') || msg.includes('thank') || msg.includes('thx')) {
      reply = `You're welcome! Happy learning!`;
    }
    // Default
    else {
      reply = `I didn't quite get that. Try:\n- "How many users?"\n- "Show my skills"\n- "Find sessions"\n- "Find matches"\n- "Help"`;
    }

    res.json({ reply });
  } catch (err) {
    console.error('Chatbot error:', err);
    res.status(500).json({ reply: 'Sorry, something went wrong. Please try again.' });
  }
});

module.exports = router;
