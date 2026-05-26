// Advanced Skill Matching Algorithm for SkillSwap
// Implements fuzzy matching, experience weighting, and compatibility scoring

// Calculate similarity between two strings (fuzzy matching)
function calculateStringSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

// Levenshtein distance algorithm
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Check if two skills are similar (fuzzy matching)
function areSimilarSkills(skill1, skill2, threshold = 0.6) {
  const similarity = calculateStringSimilarity(
    skill1.toLowerCase(),
    skill2.toLowerCase()
  );
  
  // Also check for common abbreviations and variations
  const commonVariations = {
    'javascript': ['js', 'node.js', 'nodejs'],
    'typescript': ['ts'],
    'react': ['reactjs', 'react.js'],
    'vue': ['vue.js', 'vuejs'],
    'angular': ['angularjs'],
    'ui/ux': ['ui', 'ux', 'user interface', 'user experience'],
    'machine learning': ['ml', 'ai', 'artificial intelligence'],
    'data science': ['data analysis', 'analytics'],
    'photoshop': ['adobe photoshop', 'ps'],
    'illustrator': ['adobe illustrator', 'ai']
  };
  
  for (const [key, variations] of Object.entries(commonVariations)) {
    if (skill1.toLowerCase().includes(key) || skill2.toLowerCase().includes(key)) {
      const allVariants = [key, ...variations];
      if (allVariants.some(variant => 
        skill1.toLowerCase().includes(variant) || skill2.toLowerCase().includes(variant)
      )) {
        return true;
      }
    }
  }
  
  return similarity >= threshold;
}

// Calculate experience level bonus
function calculateExperienceBonus(userLevel, partnerLevel) {
  const levels = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Expert': 4 };
  const userScore = levels[userLevel] || 2;
  const partnerScore = levels[partnerLevel] || 2;
  
  // Ideal learning: partner should be 1-2 levels higher
  const difference = partnerScore - userScore;
  
  if (difference >= 1 && difference <= 2) return 1.3; // Perfect teaching match
  if (difference === 0) return 1.1; // Peer learning
  if (difference === -1) return 1.0; // Slight reverse mentoring
  if (difference >= 3) return 0.8; // Too advanced
  return 0.7; // Too basic
}

// Main skill matching function
export function calculateSkillMatch(currentUser, potentialMatch) {
  if (!currentUser || !potentialMatch) return 0;
  
  const userTeachSkills = currentUser.skillsToTeach || [];
  const userLearnSkills = currentUser.skillsToLearn || [];
  const partnerTeachSkills = potentialMatch.skillsToTeach || [];
  const partnerLearnSkills = potentialMatch.skillsToLearn || [];
  
  let totalScore = 0;
  let matchCount = 0;
  
  // Score 1: What user wants to learn vs what partner can teach
  userLearnSkills.forEach(userWant => {
    partnerTeachSkills.forEach(partnerOffer => {
      if (areSimilarSkills(userWant, partnerOffer)) {
        const experienceBonus = calculateExperienceBonus(
          currentUser.experienceLevel,
          potentialMatch.experienceLevel
        );
        totalScore += 40 * experienceBonus; // High weight for learning
        matchCount++;
      }
    });
  });
  
  // Score 2: What user can teach vs what partner wants to learn
  userTeachSkills.forEach(userOffer => {
    partnerLearnSkills.forEach(partnerWant => {
      if (areSimilarSkills(userOffer, partnerWant)) {
        const experienceBonus = calculateExperienceBonus(
          potentialMatch.experienceLevel,
          currentUser.experienceLevel
        );
        totalScore += 35 * experienceBonus; // Good weight for teaching
        matchCount++;
      }
    });
  });
  
  // Score 3: Mutual learning opportunities (same skill interests)
  userLearnSkills.forEach(userWant => {
    partnerLearnSkills.forEach(partnerWant => {
      if (areSimilarSkills(userWant, partnerWant)) {
        totalScore += 15; // Bonus for shared learning goals
        matchCount++;
      }
    });
  });
  
  // Score 4: Activity and rating bonuses
  const ratingBonus = (potentialMatch.rating || 4.0) * 2;
  const activityBonus = potentialMatch.isOnline ? 10 : 0;
  const sessionBonus = Math.min((potentialMatch.totalSessions || 0) * 0.2, 5);
  
  totalScore += ratingBonus + activityBonus + sessionBonus;
  
  // Normalize score to 0-100 range
  const normalizedScore = Math.min(100, totalScore);
  
  return {
    score: Math.round(normalizedScore),
    matchCount,
    breakdown: {
      skillCompatibility: Math.round(totalScore - ratingBonus - activityBonus - sessionBonus),
      userRating: Math.round(ratingBonus),
      onlineStatus: activityBonus,
      experience: Math.round(sessionBonus)
    }
  };
}

// Get top matches for a user
export function getTopMatches(currentUser, allUsers, limit = 10) {
  if (!currentUser || !allUsers) return [];
  
  const matches = allUsers
    .filter(user => user.id !== currentUser.id)
    .map(user => ({
      ...user,
      matchData: calculateSkillMatch(currentUser, user)
    }))
    .filter(user => user.matchData.score > 10) // Minimum threshold
    .sort((a, b) => b.matchData.score - a.matchData.score)
    .slice(0, limit);
  
  return matches;
}
