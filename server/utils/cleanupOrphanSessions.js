const User = require('../models/User');
const LearningSession = require('../models/LearningSession');

/** Instructors on seeded demo rows — do not delete as "legacy orphans" */
const SEEDED_INSTRUCTORS = new Set(['Sarah Johnson', 'Mike Chen', 'Emily Davis']);

/**
 * Remove learning sessions that should not appear after users are deleted:
 * 1) createdBy points at a user id that no longer exists
 * 2) legacy rows (no createdBy) whose instructor name matches no existing user (not seed data)
 */
async function cleanupOrphanLearningSessions() {
  const validIds = await User.distinct('_id');
  const byCreator = await LearningSession.deleteMany({
    createdBy: { $exists: true, $ne: null },
    createdBy: { $nin: validIds }
  });
  if (byCreator.deletedCount > 0) {
    console.log(`🧹 Removed ${byCreator.deletedCount} session(s) whose creator account no longer exists`);
  }

  const names = (await User.distinct('name')).map((n) => String(n).trim()).filter(Boolean);
  const nameSet = new Set(names);

  const legacy = await LearningSession.find({
    $or: [{ createdBy: { $exists: false } }, { createdBy: null }]
  }).select('_id instructor').lean();

  let legacyRemoved = 0;
  for (const row of legacy) {
    const ins = String(row.instructor || '').trim();
    if (!ins) continue;
    if (SEEDED_INSTRUCTORS.has(ins)) continue;
    if (nameSet.has(ins)) continue;
    await LearningSession.deleteOne({ _id: row._id });
    legacyRemoved += 1;
  }
  if (legacyRemoved > 0) {
    console.log(`🧹 Removed ${legacyRemoved} legacy session(s) with no creator id and unknown instructor`);
  }
}

module.exports = { cleanupOrphanLearningSessions };
