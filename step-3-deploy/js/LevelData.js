export const LevelData = {
  getLevelParams(level) {
    const rockCount = Math.min(3 + Math.floor(level * 0.15), 18);
    const minSpeed = 60 + (level - 1) * 2;
    const maxSpeed = minSpeed + 40;
    const minRadius = Math.max(40 - Math.floor(level * 0.3), 10);
    const maxRadius = Math.max(60 - Math.floor(level * 0.4), minRadius + 10);

    return { rockCount, minSpeed, maxSpeed, minRadius, maxRadius };
  },
};
