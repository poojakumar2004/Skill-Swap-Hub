/**
 * Score 0–100: mutual skill swap potential + overlap.
 */
function scorePair(me, other) {
  const myOffer = new Set((me.skillsOffered || []).map((s) => String(s).toLowerCase().trim()).filter(Boolean));
  const myWant = new Set((me.skillsWanted || []).map((s) => String(s).toLowerCase().trim()).filter(Boolean));
  const oOffer = new Set((other.skillsOffered || []).map((s) => String(s).toLowerCase().trim()).filter(Boolean));
  const oWant = new Set((other.skillsWanted || []).map((s) => String(s).toLowerCase().trim()).filter(Boolean));

  let score = 0;
  for (const s of oOffer) {
    if (myWant.has(s)) score += 18;
  }
  for (const s of myOffer) {
    if (oWant.has(s)) score += 18;
  }
  for (const s of myOffer) {
    if (oOffer.has(s)) score += 4;
  }

  if (score === 0 && (myOffer.size || myWant.size || oOffer.size || oWant.size)) {
    score = 12;
  }

  return Math.min(100, Math.round(score));
}

module.exports = { scorePair };
