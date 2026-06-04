const UNLOCKED_KEY = 'asteroids_unlocked';
const TIMES_KEY = 'asteroids_times';

function getItem(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const GameData = {
  getUnlockedLevel() {
    return getItem(UNLOCKED_KEY, 1);
  },

  completeLevel(level, time) {
    const current = this.getUnlockedLevel();
    if (level >= current) {
      setItem(UNLOCKED_KEY, level + 1);
    }

    const times = getItem(TIMES_KEY, {});
    if (times[level] === undefined || time < times[level]) {
      times[level] = time;
      setItem(TIMES_KEY, times);
    }
  },

  getBestTime(level) {
    const times = getItem(TIMES_KEY, {});
    return times[level] !== undefined ? times[level] : null;
  },
};
