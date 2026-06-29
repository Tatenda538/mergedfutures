window.MapGen = (function() {
  var TILE = { EMPTY: 0, PATH: 1, OBSTACLE: 2, TOWER: 3, START: 4, EXIT: 5 };

  function seededRandom(seed) {
    return function() {
      seed = (seed * 16807 + 0) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  }

  function getRandomSeed() { return Math.floor(Math.random() * 2147483646) + 1; }

  function generateMap(type, seed) {
    if (!seed) seed = getRandomSeed();
    var rand = seededRandom(seed);

    var cols = 20, rows = 20;

    var params = {
      field:   { pathWidth: 3, obstacleDensity: 0.08, pathWiggle: 0.6, minStraight: 3 },
      canyon:  { pathWidth: 2, obstacleDensity: 0.2,  pathWiggle: 0.3, minStraight: 5 },
      forest:  { pathWidth: 2, obstacleDensity: 0.15, pathWiggle: 0.5, minStraight: 3 },
      plateau: { pathWidth: 3, obstacleDensity: 0.12, pathWiggle: 0.4, minStraight: 4 }
    };
    var p = params[type] || params.field;

    var grid = [];
    for (var r = 0; r < rows; r++) {
      grid[r] = [];
      for (var c = 0; c < cols; c++) grid[r][c] = TILE.EMPTY;
    }

    var waypoints = [];
    var startX = 0, startY = Math.floor(rows / 2);
    var endX = cols - 1, endY = Math.floor(rows / 2);

    var cx = startX, cy = startY;
    waypoints.push({ x: cx, y: cy });

    var targetX = endX, targetY = endY;
    var maxSteps = cols * 2;
    var step = 0;

    while ((cx !== targetX || cy !== targetY) && step < maxSteps) {
      step++;
      var dx = targetX - cx;
      var dy = targetY - cy;

      if (Math.abs(dx) > Math.abs(dy) && rand() < 0.7) {
        cx += (dx > 0 ? 1 : -1);
      } else if (dy !== 0) {
        cy += (dy > 0 ? 1 : -1);
      } else {
        cx += (dx > 0 ? 1 : -1);
      }

      cx = Math.max(1, Math.min(cols - 2, cx));
      cy = Math.max(1, Math.min(rows - 2, cy));

      if (rand() < p.pathWiggle && cx > 1 && cx < cols - 2) {
        cy += (rand() < 0.5 ? 1 : -1);
        cy = Math.max(1, Math.min(rows - 2, cy));
      }

      waypoints.push({ x: cx, y: cy });
    }
    waypoints.push({ x: endX, y: endY });

    for (var w = 0; w < waypoints.length; w++) {
      var wp = waypoints[w];
      for (var pw = -Math.floor(p.pathWidth / 2); pw <= Math.floor(p.pathWidth / 2); pw++) {
        for (var ph = -Math.floor(p.pathWidth / 2); ph <= Math.floor(p.pathWidth / 2); ph++) {
          var tx = wp.x + pw, ty = wp.y + ph;
          if (tx >= 0 && tx < cols && ty >= 0 && ty < rows) {
            grid[ty][tx] = TILE.PATH;
          }
        }
      }
    }

    grid[startY][startX] = TILE.START;
    grid[endY][endX] = TILE.EXIT;

    var validTiles = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (grid[r][c] === TILE.EMPTY) {
          var nearPath = false;
          for (var dr = -1; dr <= 1; dr++) {
            for (var dc = -1; dc <= 1; dc++) {
              var nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                if (grid[nr][nc] === TILE.PATH || grid[nr][nc] === TILE.START || grid[nr][nc] === TILE.EXIT) nearPath = true;
              }
            }
          }
          if (!nearPath) {
            if (rand() < p.obstacleDensity) grid[r][c] = TILE.OBSTACLE;
            else validTiles.push({ x: c, y: r });
          } else {
            grid[r][c] = TILE.TOWER;
            validTiles.push({ x: c, y: r });
          }
        }
      }
    }

    return {
      grid: grid,
      cols: cols,
      rows: rows,
      waypoints: waypoints,
      startTile: { x: startX, y: startY },
      exitTile: { x: endX, y: endY },
      validTiles: validTiles
    };
  }

  return { TILE: TILE, generateMap: generateMap, getRandomSeed: getRandomSeed };
})();
