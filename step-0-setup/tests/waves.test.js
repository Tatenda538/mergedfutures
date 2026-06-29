(function() {
  var W = window.WaveManager;

  TDD.assertEqual(typeof W.configure, 'function', 'configure exists');
  W.configure('easy');
  TDD.assertEqual(W.getTotalWaves(), 25, 'easy = 25 waves');
  W.configure('medium');
  TDD.assertEqual(W.getTotalWaves(), 32, 'medium = 32 waves');
  W.configure('hard');
  TDD.assertEqual(W.getTotalWaves(), 40, 'hard = 40 waves');

  W.configure('easy');
  var wave1 = W.getWaveEnemies(1);
  TDD.assert(Array.isArray(wave1), 'wave 1 returns array');
  TDD.assert(wave1.length >= 3, 'wave 1 has at least 3 enemies');

  var allNormal = wave1.every(function(e) { return e.type === 'normal'; });
  TDD.assert(allNormal, 'wave 1 is all normal enemies');

  W.configure('hard');
  var lateWave = W.getWaveEnemies(35);
  var hasBoss = lateWave.some(function(e) { return e.type === 'boss'; });
  TDD.assert(hasBoss, 'late hard wave includes boss');

  var bonus = W.getWaveGoldBonus(1);
  TDD.assert(bonus > 0, 'wave gold bonus is positive');
})();
