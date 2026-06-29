(function() {
  var M = window.MapGen;

  TDD.assertEqual(typeof M.generateMap, 'function', 'generateMap exists');
  TDD.assert(typeof M.TILE !== 'undefined', 'TILE enum exists');

  var map = M.generateMap('field', 42);
  TDD.assert(Array.isArray(map.grid), 'grid is array');
  TDD.assert(map.cols > 0 && map.rows > 0, 'map has dimensions');
  TDD.assert(map.cols >= 15 && map.cols <= 25, 'reasonable column count');
  TDD.assert(map.rows >= 15 && map.rows <= 25, 'reasonable row count');

  TDD.assert(map.waypoints.length >= 2, 'has path waypoints');

  map.waypoints.forEach(function(wp, i) {
    TDD.assert(wp.x >= 0 && wp.x < map.cols, 'waypoint ' + i + ' x in bounds');
    TDD.assert(wp.y >= 0 && wp.y < map.rows, 'waypoint ' + i + ' y in bounds');
  });

  var map2 = M.generateMap('canyon', 42);
  var same = JSON.stringify(map.grid) === JSON.stringify(map2.grid);
  TDD.assert(!same, 'different map types produce different grids with same seed');

  map.validTiles.forEach(function(tile) {
    TDD.assert(map.grid[tile.y][tile.x] !== M.TILE.PATH, 'valid tile is not path');
    TDD.assert(map.grid[tile.y][tile.x] !== M.TILE.OBSTACLE, 'valid tile is not obstacle');
  });

  var obstacleCount = 0;
  for (var r = 0; r < map.rows; r++)
    for (var c = 0; c < map.cols; c++)
      if (map.grid[r][c] === M.TILE.OBSTACLE) obstacleCount++;
  TDD.assert(obstacleCount > 0, 'map has obstacles');
})();
