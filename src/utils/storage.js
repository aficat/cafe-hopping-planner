// LocalStorage utilities for managing plans and user data

const STORAGE_KEYS = {
  CURRENT_PLAN: 'currentPlan',
  PAST_PLANS: 'pastPlans',
  USER_DATA: 'userData'
};

export const getCurrentPlan = () => {
  const plan = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAN);
  return plan ? JSON.parse(plan) : { cafes: [], startTime: '09:00', transportMode: 'walking' };
};

export const saveCurrentPlan = (plan) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_PLAN, JSON.stringify(plan));
};

export const getPastPlans = () => {
  const plans = localStorage.getItem(STORAGE_KEYS.PAST_PLANS);
  return plans ? JSON.parse(plans) : [];
};

export const savePastPlan = (plan) => {
  const pastPlans = getPastPlans();
  const newPlan = {
    ...plan,
    id: Date.now().toString(),
    date: new Date().toISOString(),
    completed: false
  };
  pastPlans.unshift(newPlan);
  localStorage.setItem(STORAGE_KEYS.PAST_PLANS, JSON.stringify(pastPlans));
  // Clear current plan after saving
  localStorage.removeItem(STORAGE_KEYS.CURRENT_PLAN);
  return newPlan;
};

export const clearCurrentPlan = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_PLAN);
};

export const getUserData = () => {
  const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  return data ? JSON.parse(data) : { favoriteCafes: [], visitedCafes: [] };
};

export const saveUserData = (data) => {
  localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
};

export const addToFavorites = (cafeId) => {
  const userData = getUserData();
  if (!userData.favoriteCafes.includes(cafeId)) {
    userData.favoriteCafes.push(cafeId);
    saveUserData(userData);
  }
};

export const markAsVisited = (cafeId) => {
  const userData = getUserData();
  if (!userData.visitedCafes.includes(cafeId)) {
    userData.visitedCafes.push(cafeId);
    saveUserData(userData);
  }
};

