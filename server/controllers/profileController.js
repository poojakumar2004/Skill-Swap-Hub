const Profile = require('../models/Profile');

exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.userId);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, contact } = req.body;
    const profilePicUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const update = { name, bio, contact };
    if (profilePicUrl) update.profilePicUrl = profilePicUrl;

    const profile = await Profile.findByIdAndUpdate(
      req.params.userId,
      update,
      { new: true, upsert: true }
    );

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
