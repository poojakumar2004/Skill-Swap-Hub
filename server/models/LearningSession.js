const mongoose = require('mongoose');

const learningSessionSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    title: { type: String, required: true },
    instructor: { type: String, required: true },
    skill: { type: String, required: true },
    duration: { type: String, default: '' },
    scheduledTime: { type: String, default: '' },
    description: { type: String, default: '' },
    price: { type: String, default: 'Free' },
    bookedBy: [{ type: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('LearningSession', learningSessionSchema);
