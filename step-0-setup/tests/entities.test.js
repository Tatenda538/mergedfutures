(function() {
  var E = window.Entities;

  TDD.assertEqual(typeof E.createTower, 'function', 'createTower exists');
  TDD.assertEqual(typeof E.createEnemy, 'function', 'createEnemy exists');

  var tower = E.createTower('arrow', 3, 5);
  TDD.assertEqual(tower.type, 'arrow', 'tower type set');
  TDD.assertEqual(tower.x, 3, 'tower x set');
  TDD.assertEqual(tower.y, 5, 'tower y set');
  TDD.assertEqual(tower.level, 1, 'tower starts at level 1');
  TDD.assert(tower.range > 0, 'tower has range');
  TDD.assert(tower.damage > 0, 'tower has damage');

  TDD.assertEqual(tower.canFire(0), true, 'tower can fire initially');
  tower.fire(0);
  TDD.assertEqual(tower.canFire(0), false, 'tower cannot fire immediately after firing');
  TDD.assertEqual(tower.canFire(9999), true, 'tower can fire after cooldown');

  var waypoints = [{x:0,y:0}, {x:5,y:0}, {x:5,y:10}];
  var enemy = E.createEnemy('normal', waypoints);
  TDD.assertEqual(enemy.type, 'normal', 'enemy type set');
  TDD.assert(enemy.hp > 0, 'enemy has hp');
  TDD.assert(enemy.speed > 0, 'enemy has speed');
  TDD.assertEqual(enemy.pathIndex, 0, 'enemy starts at first waypoint');
  TDD.assertEqual(enemy.alive, true, 'enemy starts alive');
  TDD.assertEqual(enemy.reachedEnd(), false, 'enemy has not reached end');

  enemy.move(0, waypoints);
  TDD.assertEqual(enemy.pathIndex, 0, 'enemy does not move with 0 dt');

  enemy.takeDamage(9999);
  TDD.assertEqual(enemy.alive, false, 'enemy dies from fatal damage');

  var enemy2 = E.createEnemy('normal', waypoints);
  enemy2.takeDamage(5);
  TDD.assertEqual(enemy2.alive, true, 'enemy survives small damage');

  TDD.assert(E.distance(0, 0, 3, 4) === 5, 'distance calculation correct');

  TDD.assert(Array.isArray(E.TOWER_IDS), 'TOWER_IDS is array');
  TDD.assert(E.TOWER_IDS.length >= 5, 'at least 5 tower types');
})();
