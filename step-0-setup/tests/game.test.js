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
  assert(effectiveMulti > effectiveLv3, 'multiple supports stack');
})();
