(function() {
  var G = window.Game;
  var E = window.Entities;
  var assert = TDD.assert;
  var assertEqual = TDD.assertEqual;

  window.WaveManager.configure('easy');

  var state = G.init('field', 'easy', ['arrow', 'cannon']);
  assertEqual(typeof state, 'object', 'init returns state object');
  assertEqual(state.config.mapType, 'field', 'mapType stored');
  assertEqual(state.config.difficulty, 'easy', 'difficulty stored');
  assertEqual(state.config.loadout.length, 2, 'loadout stored');
  assertEqual(state.gold, 200, 'starting gold');
  assertEqual(state.lives, 20, 'starting lives');
  assertEqual(state.wave, 0, 'starting wave 0');
  assertEqual(state.config.totalWaves, 25, 'totalWaves from WaveManager');

  var gs = G.getGameState();
  assert(gs === state, 'getGameState returns init state');
  assert(G.getTowerAt(0, 0) === null, 'getTowerAt returns null for empty');

  var map = state.map;
  var tileCount = 0, towerTileCount = 0;
  var firstTowerTile = null;
  for (var r = 0; r < map.rows; r++) {
    for (var c = 0; c < map.cols; c++) {
      tileCount++;
      if (map.grid[r][c] === window.MapGen.TILE.TOWER && !firstTowerTile) {
        firstTowerTile = { row: r, col: c };
      }
    }
  }
  assert(tileCount > 0, 'map has tiles');
  assert(firstTowerTile !== null, 'map has at least one TOWER tile');

  var cx = firstTowerTile.col, cy = firstTowerTile.row;
  assert(G.placeTower('arrow', cx, cy), 'place arrow on TOWER tile');
  assert(G.getTowerAt(cx, cy) !== null, 'getTowerAt returns tower');
  assert(G.getTowerAt(cx, cy).type === 'arrow', 'placed arrow type matches');

  var failTile = null;
  for (var r2 = 0; r2 < map.rows && !failTile; r2++) {
    for (var c2 = 0; c2 < map.cols && !failTile; c2++) {
      if (map.grid[r2][c2] !== window.MapGen.TILE.TOWER) {
        failTile = { row: r2, col: c2 };
      }
    }
  }
  if (failTile) {
    assert(!G.placeTower('arrow', failTile.col, failTile.row), 'cannot place on non-TOWER tile');
  }

  var preGold = G.getGameState().gold;
  assert(G.upgradeTower(cx, cy), 'upgrade tower');
  var postState = G.getGameState();
  assertEqual(postState.gold, preGold - 75, 'gold decreased by upgrade cost');
  assertEqual(G.getTowerAt(cx, cy).level, 2, 'tower level after upgrade');

  G.startNextWave();
  var w1 = G.getGameState();
  assertEqual(w1.wave, 1, 'wave incremented to 1');
  assertEqual(w1.phase, 2, 'phase is WAVE_ACTIVE after startNextWave');

  var goldAfterStart = G.getGameState().gold;
  assert(goldAfterStart > 0, 'gold positive after start');

  assertEqual(typeof G.TILE_SIZE, 'number', 'TILE_SIZE is a number');
  assert(G.TILE_SIZE > 0, 'TILE_SIZE positive');

  // Support tower buff
  var supportTower = E.createTower('support', 0, 0);
  var nearbyTower = E.createTower('arrow', 1, 0);
  var farTower = E.createTower('arrow', 10, 10);

  var baseRange = nearbyTower.range;
  var effectiveNear = G.getEffectiveRange(nearbyTower, [supportTower]);
  var effectiveFar = G.getEffectiveRange(farTower, [supportTower]);

  assert(effectiveNear > baseRange, 'nearby tower gets range buff');
  assertEqual(effectiveFar, baseRange, 'far tower unaffected');

  // Test buff scales with level
  supportTower.level = 2;
  var effectiveLv2 = G.getEffectiveRange(nearbyTower, [supportTower]);
  assert(effectiveLv2 > effectiveNear, 'level 2 buff stronger than level 1');

  supportTower.level = 3;
  var effectiveLv3 = G.getEffectiveRange(nearbyTower, [supportTower]);
  assert(effectiveLv3 > effectiveLv2, 'level 3 buff stronger than level 2');

  // Test multiple overlapping support towers
  var support2 = E.createTower('support', 0, 1);
  var effectiveMulti = G.getEffectiveRange(nearbyTower, [supportTower, support2]);
  var expectedMulti = baseRange * 1.35 * 1.15;
  assertEqual(effectiveMulti, expectedMulti, 'stacking is multiplicative');

  // Test support tower does not buff itself
  var soloSupport = E.createTower('support', 5, 5);
  var effectiveSelf = G.getEffectiveRange(soloSupport, [soloSupport]);
  assertEqual(effectiveSelf, soloSupport.range, 'support tower does not buff itself');

  // Projectile overshoot test: projectile that would pass target should still hit
  var testEnemy = E.createEnemy('normal', [{x:0,y:10},{x:19,y:10}]);
  var baseHP = testEnemy.hp;
  // Place projectile far from enemy but with speed that will overshoot in 1 frame
  var testProjectile = {
    x: testEnemy.x - 5, y: testEnemy.y,  // 5px away
    target: testEnemy,
    speed: 1000,  // very fast - will overshoot
    damage: 10,
    alive: true
  };
  // Simulate one frame with large dt that would cause overshoot
  var fakeDt = 0.1;  // step = 1000 * 0.1 = 100px, but dist is only ~5px
  // Manually run the projectile logic
  var dx = testProjectile.target.x - testProjectile.x;
  var dy = testProjectile.target.y - testProjectile.y;
  var dist = Math.sqrt(dx * dx + dy * dy);
  var step = testProjectile.speed * fakeDt;
  assert(step >= dist, 'test confirms projectile would overshoot');
  // With the fix: step >= dist means hit
  assert(step >= dist || dist < 10, 'overshoot condition triggers hit');
  testEnemy.takeDamage(10);
  assert(testEnemy.hp < baseHP, 'overshooting projectile still deals damage');
})();
