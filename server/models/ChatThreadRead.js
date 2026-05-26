const mongoose = require('mongoose');

/** Per-user read cursor for a thread (threadKey = sorted pair of user ids). */
const chatThreadReadSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    threadKey: { type: String, required: true },
    lastReadAt: { type: Date, required: true }
  },
  { timestamps: true }
);

chatThreadReadSchema.index({ userId: 1, threadKey: 1 }, { unique: true });

module.exports = mongoose.model('ChatThreadRead', chatThreadReadSchema);
