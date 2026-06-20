// ============================================================
// CarbonWise - LocalStorage State Management
// Handles: auth, profile, streak (date-based), daily quests,
// points, badges, history, and analysis data.
// ============================================================

const KEYS = {
  USER: 'carbonwise_user',
  PROFILE: 'carbonwise_user_profile',
  ANALYSIS: 'carbonwise_analysis',
  POINTS: 'carbonwise_points',
  STREAK: 'carbonwise_streak',
  STREAK_LAST_DATE: 'carbonwise_streak_last_date',
  BADGES: 'carbonwise_badges',
  COMPLETED_QUESTS: 'carbonwise_completed_quests',
  ACTIVE_QUESTS: 'carbonwise_active_quests',
  QUESTS_GENERATED_DATE: 'carbonwise_quests_generated_date',
  REPORTS: 'carbonwise_reports',
  HISTORY: 'carbonwise_history'
};

// ---- Generic Helpers ----
export const getStorageItem = (key, defaultValue) => {
  const item = localStorage.getItem(key);
  try {
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

export const setStorageItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// ---- Date Helpers ----
const getTodayDateString = () => new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

// ---- Auth ----
export const getUser = () => getStorageItem(KEYS.USER, null);

export const registerUser = (name, email) => {
  const user = { name, email, registeredAt: new Date().toISOString() };
  setStorageItem(KEYS.USER, user);
  return user;
};

export const loginUser = (email) => {
  const user = getUser();
  if (user && user.email === email) {
    return user;
  }
  return null;
};

export const logoutUser = () => {
  localStorage.removeItem(KEYS.USER);
};

export const isLoggedIn = () => {
  return getUser() !== null;
};

// ---- Profile & Analysis ----
export const getProfile = () => getStorageItem(KEYS.PROFILE, null);
export const getAnalysis = () => getStorageItem(KEYS.ANALYSIS, null);

export const saveProfileAndAnalysis = (profile, analysis) => {
  setStorageItem(KEYS.PROFILE, profile);
  setStorageItem(KEYS.ANALYSIS, analysis);
};

// ---- Points ----
export const getPoints = () => getStorageItem(KEYS.POINTS, 0);

export const updatePoints = (pointsToAdd) => {
  const current = getPoints();
  const updated = Math.max(0, current + pointsToAdd);
  setStorageItem(KEYS.POINTS, updated);
  checkBadges();
  return updated;
};

// ---- Streak (Date-Based) ----
// Streak only increments once per calendar day, when the user
// completes at least one quest on that day.
export const getStreak = () => getStorageItem(KEYS.STREAK, 0);
export const getStreakLastDate = () => getStorageItem(KEYS.STREAK_LAST_DATE, null);

export const updateStreakForToday = () => {
  const today = getTodayDateString();
  const lastDate = getStreakLastDate();

  if (lastDate === today) {
    // Already counted today, no change
    return getStreak();
  }

  // Check if yesterday was the last active date (consecutive)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak;
  if (lastDate === yesterdayStr) {
    // Consecutive day - increment
    newStreak = getStreak() + 1;
  } else if (lastDate === null) {
    // First ever activity
    newStreak = 1;
  } else {
    // Streak broken - reset to 1
    newStreak = 1;
  }

  setStorageItem(KEYS.STREAK, newStreak);
  setStorageItem(KEYS.STREAK_LAST_DATE, today);
  return newStreak;
};

// ---- Badges ----
export const getBadges = () => getStorageItem(KEYS.BADGES, []);

export const checkBadges = () => {
  const history = getHistory();
  const completedCount = getStorageItem(KEYS.COMPLETED_QUESTS, []).length;
  const totalCarbonSaved = history.reduce((sum, entry) => sum + (entry.carbonSaved || 0), 0);

  const currentBadges = getBadges();
  const newBadges = [...currentBadges];

  const badgeCriteria = [
    { id: 'eco_starter', name: 'Eco Starter', desc: 'Complete first challenge', condition: completedCount >= 1 },
    { id: 'green_explorer', name: 'Green Explorer', desc: 'Complete five challenges', condition: completedCount >= 5 },
    { id: 'carbon_hero', name: 'Carbon Hero', desc: 'Complete ten challenges', condition: completedCount >= 10 },
    { id: 'planet_protector', name: 'Planet Protector', desc: 'Save 50 kg CO₂', condition: totalCarbonSaved >= 50 }
  ];

  badgeCriteria.forEach(b => {
    if (b.condition && !newBadges.some(nb => nb.id === b.id)) {
      newBadges.push({
        id: b.id,
        name: b.name,
        desc: b.desc,
        unlockedAt: new Date().toISOString()
      });
    }
  });

  if (newBadges.length !== currentBadges.length) {
    setStorageItem(KEYS.BADGES, newBadges);
  }
};

// ---- Daily Quests ----
export const getActiveQuests = () => getStorageItem(KEYS.ACTIVE_QUESTS, []);
export const getQuestsGeneratedDate = () => getStorageItem(KEYS.QUESTS_GENERATED_DATE, null);
export const getCompletedQuestsCount = () => getStorageItem(KEYS.COMPLETED_QUESTS, []).length;

export const canGenerateNewQuests = () => {
  const generatedDate = getQuestsGeneratedDate();
  const today = getTodayDateString();
  const activeQuests = getActiveQuests();

  // Can generate if: never generated before, OR generated on a different day
  if (!generatedDate) return true;
  if (generatedDate !== today) return true;

  // Same day: only if there are no active quests left (all completed)
  // But we still block — user must wait until tomorrow
  return false;
};

export const areTodayQuestsDone = () => {
  const generatedDate = getQuestsGeneratedDate();
  const today = getTodayDateString();
  const activeQuests = getActiveQuests();

  // Quests were generated today and all are completed (none remaining)
  return generatedDate === today && activeQuests.length === 0;
};

export const saveGeneratedQuests = (quests) => {
  const today = getTodayDateString();
  setStorageItem(KEYS.ACTIVE_QUESTS, quests);
  setStorageItem(KEYS.QUESTS_GENERATED_DATE, today);
};

// ---- History ----
export const getHistory = () => getStorageItem(KEYS.HISTORY, []);
export const getReports = () => getStorageItem(KEYS.REPORTS, []);

export const addHistoryEntry = (title, points, carbonSaved, category) => {
  const history = getHistory();
  const today = new Date();
  const newEntry = {
    id: `hist_${Date.now()}`,
    title,
    points,
    carbonSaved,
    category,
    date: today.toISOString(),
    displayDate: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  };
  setStorageItem(KEYS.HISTORY, [newEntry, ...history]);
  return newEntry;
};

// ---- Quest Completion ----
export const completeQuest = (questId) => {
  const active = getActiveQuests();
  const quest = active.find(q => q.id === questId);
  if (!quest) return null;

  // Remove from active
  const remaining = active.filter(q => q.id !== questId);
  setStorageItem(KEYS.ACTIVE_QUESTS, remaining);

  // Add to completed list
  const completed = getStorageItem(KEYS.COMPLETED_QUESTS, []);
  setStorageItem(KEYS.COMPLETED_QUESTS, [...completed, { ...quest, completedAt: new Date().toISOString() }]);

  // Update points
  updatePoints(quest.points);

  // Update streak (date-based — only increments once per day)
  updateStreakForToday();

  // Add to history
  addHistoryEntry(quest.title, quest.points, quest.carbonSavings, quest.category);

  return quest;
};

// ---- Score Recalculation ----
// Recalculates the sustainability score by adding bonus from completed challenges
export const recalculateScore = () => {
  const analysis = getAnalysis();
  if (!analysis) return null;

  const history = getHistory();
  const totalCarbonSaved = history.reduce((sum, entry) => sum + (entry.carbonSaved || 0), 0);

  // Each 5kg CO2 saved improves score by 1 point, capped at 100
  const bonus = Math.floor(totalCarbonSaved / 5);
  const baseScore = analysis.baseScore ?? analysis.score; // Preserve original base score

  // Save base score on first calculation
  if (!analysis.baseScore) {
    analysis.baseScore = analysis.score;
  }

  const newScore = Math.min(100, baseScore + bonus);
  analysis.score = newScore;

  // Update category based on new score
  if (newScore >= 80) {
    analysis.category = 'Low Impact';
    analysis.comparison = 'Better than 80% of users';
  } else if (newScore >= 60) {
    analysis.category = 'Moderate Impact';
    analysis.comparison = `Better than ${Math.min(79, 40 + bonus)}% of users`;
  } else {
    analysis.category = 'High Impact';
    analysis.comparison = `Better than ${Math.min(39, 20 + bonus)}% of users`;
  }

  setStorageItem(KEYS.ANALYSIS, analysis);
  return analysis;
};
