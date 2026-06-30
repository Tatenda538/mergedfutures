window.WaveManager = (function() {
  var config = {
    totalWaves: 25,
    hpMult: 1,
    speedMult: 1,
    countMult: 1
  };

  var DIFFICULTY = {
    easy:   { totalWaves: 25, hpMult: 0.8, speedMult: 0.8, countMult: 0.7, perWaveHp: 0.10, perWaveSpeed: 0 },
    medium: { totalWaves: 32, hpMult: 1.0, speedMult: 1.0, countMult: 1.0, perWaveHp: 0, perWaveSpeed: 0 },
    hard:   { totalWaves: 40, hpMult: 1.3, speedMult: 1.2, countMult: 1.4, perWaveHp: 0.20, perWaveSpeed: 0.02 }
  };

  function configure(difficulty) {
    var d = DIFFICULTY[difficulty] || DIFFICULTY.easy;
    config.totalWaves = d.totalWaves;
    config.hpMult = d.hpMult;
    config.speedMult = d.speedMult;
    config.countMult = d.countMult;
    config.perWaveHp = d.perWaveHp;
    config.perWaveSpeed = d.perWaveSpeed;
  }

  function getTotalWaves() { return config.totalWaves; }

  function getDifficultyConfig() {
    return {
      totalWaves: config.totalWaves,
      hpMult: config.hpMult,
      speedMult: config.speedMult,
      countMult: config.countMult,
      perWaveHp: config.perWaveHp,
      perWaveSpeed: config.perWaveSpeed
    };
  }

  function getWaveEnemies(waveNum) {
    var enemies = [];
    var baseCount = Math.floor(3 + waveNum * 0.8 * config.countMult);
    var count = Math.min(baseCount, 30);

    for (var i = 0; i < count; i++) {
      var type = 'normal';
      var progress = waveNum / config.totalWaves;

      if (progress > 0.7 && Math.random() < 0.15) type = 'boss';
      else if (progress > 0.4 && Math.random() < 0.25) type = 'tank';
      else if (progress > 0.2 && Math.random() < 0.3) type = 'fast';

      enemies.push({ type: type, spawnDelay: 0.5 + i * 0.3 });
    }
    return enemies;
  }

  function getWaveGoldBonus(waveNum) {
    return 10 + waveNum * 2;
  }

  return {
    configure: configure,
    getTotalWaves: getTotalWaves,
    getWaveEnemies: getWaveEnemies,
    getWaveGoldBonus: getWaveGoldBonus,
    getDifficultyConfig: getDifficultyConfig
  };
})();
