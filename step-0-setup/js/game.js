window.Game = (function() {
  var TILE_SIZE = 40;
  var state = null;
  var animId = null;
  var lastTime = 0;
  var spawnTimer = 0;
  var spawnQueue = [];
  var enemies = [];
  var towers = [];
  var projectiles = [];
  var gridTowers = {};

  var PHASE = { PRE_GAME: 0, IDLE: 1, WAVE_ACTIVE: 2, WON: 3, LOST: 4 };

  function init(mapType, difficulty, loadout) {
    state = {
      map: window.MapGen.generateMap(mapType),
      config: { mapType: mapType, difficulty: difficulty, loadout: loadout.slice() },
      wave: 0,
      gold: 200,
      lives: 20,
      phase: PHASE.PRE_GAME,
      difficulty: difficulty
    };
    window.WaveManager.configure(difficulty);
    state.config.totalWaves = window.WaveManager.getTotalWaves();
    enemies = [];
    towers = [];
    projectiles = [];
    gridTowers = {};
    spawnQueue = [];
    spawnTimer = 0;
    return state;
  }

  function start() {
    state.phase = PHASE.IDLE;
    lastTime = performance.now();
    loop(lastTime);
  }

  function stop() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
  }

  function pause() {}
  function resume() {}

  function loop(time) {
    animId = requestAnimationFrame(loop);
    var dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    if (state.phase === PHASE.WAVE_ACTIVE) update(dt, time);
    render();
  }

  function update(dt, time) {
    spawnTimer += dt;
    while (spawnQueue.length > 0 && spawnTimer >= spawnQueue[0].spawnDelay) {
      spawnTimer -= spawnQueue[0].spawnDelay;
      var item = spawnQueue.shift();
      var enemy = window.Entities.createEnemy(item.type, state.map.waypoints);
      if (enemy) {
        var dc = window.WaveManager.getDifficultyConfig();
        enemy.hp *= dc.hpMult * (1 + dc.perWaveHp * state.wave);
        enemy.maxHp = enemy.hp;
        enemy.speed *= dc.speedMult * (1 + dc.perWaveSpeed * state.wave);
        enemies.push(enemy);
      }
    }

    enemies.forEach(function(enemy) {
      enemy.move(dt);
      if (enemy.reachedEnd() && enemy.alive) {
        enemy.alive = false;
        state.lives--;
      }
    });
    enemies = enemies.filter(function(e) { return e.alive; });

    towers.forEach(function(tower) {
      var target = null;
      var effRange = getEffectiveRange(tower, towers);
      for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (!e.alive) continue;
        var dist = window.Entities.distance(tower.x * TILE_SIZE + TILE_SIZE/2, tower.y * TILE_SIZE + TILE_SIZE/2, e.x, e.y);
        if (dist <= effRange) { target = e; break; }
      }
      if (target && tower.canFire(time)) {
        tower.fire(time);
        projectiles.push({
          x: tower.x * TILE_SIZE + TILE_SIZE/2,
          y: tower.y * TILE_SIZE + TILE_SIZE/2,
          target: target,
          speed: 300,
          damage: tower.damage,
          special: tower.special,
          alive: true
        });
      }
    });

    projectiles.forEach(function(p) {
      if (!p.alive) return;
      if (!p.target.alive) { p.alive = false; return; }
      var dx = p.target.x - p.x, dy = p.target.y - p.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var step = p.speed * dt;
      if (dist < 10 || step >= dist) {
        p.target.takeDamage(p.damage);
        if (!p.target.alive) state.gold += p.target.goldValue;
        p.alive = false;
        return;
      }
      p.x += (dx / dist) * step;
      p.y += (dy / dist) * step;
    });
    projectiles = projectiles.filter(function(p) { return p.alive; });

    // Wave completion gold bonus
    if (spawnQueue.length === 0 && enemies.length === 0 && state.phase === PHASE.WAVE_ACTIVE && state.wave > 0) {
      state.gold += window.WaveManager.getWaveGoldBonus(state.wave);
      state.phase = PHASE.IDLE;
      var startBtn = document.getElementById('btn-start-wave');
      if (startBtn) startBtn.disabled = state.wave >= state.config.totalWaves;
    }

    if (state.lives <= 0) {
      state.lives = 0;
      state.phase = PHASE.LOST;
    } else if (spawnQueue.length === 0 && enemies.length === 0 && state.wave >= state.config.totalWaves) {
      state.phase = PHASE.WON;
    }
  }

  function render() {
    var canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var map = state.map;
    canvas.width = map.cols * TILE_SIZE;
    canvas.height = map.rows * TILE_SIZE;

    for (var r = 0; r < map.rows; r++) {
      for (var c = 0; c < map.cols; c++) {
        var tile = map.grid[r][c];
        var color = '#1a1a2e';
        if (tile === window.MapGen.TILE.PATH) color = '#2d2d44';
        else if (tile === window.MapGen.TILE.OBSTACLE) color = '#444';
        else if (tile === window.MapGen.TILE.TOWER) color = '#1e3a2e';
        else if (tile === window.MapGen.TILE.START) color = '#2d5a2d';
        else if (tile === window.MapGen.TILE.EXIT) color = '#5a2d2d';
        ctx.fillStyle = color;
        ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#222';
        ctx.strokeRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }

    towers.forEach(function(t) {
      var cx = t.x * TILE_SIZE + TILE_SIZE/2, cy = t.y * TILE_SIZE + TILE_SIZE/2;
      ctx.fillStyle = '#4fc3f7';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t.type[0].toUpperCase() + t.level, cx, cy + 4);
    });

    enemies.forEach(function(e) {
      if (!e.alive) return;
      var hpPct = e.hp / e.maxHp;
      ctx.fillStyle = '#e53935';
      ctx.beginPath();
      ctx.arc(e.x, e.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(e.x - 12, e.y - 16, 24 * hpPct, 4);
    });

    projectiles.forEach(function(p) {
      if (!p.alive) return;
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    var hudWave = document.getElementById('hud-wave');
    var hudGold = document.getElementById('hud-gold');
    var hudLives = document.getElementById('hud-lives');
    if (hudWave) hudWave.textContent = 'Wave ' + state.wave + '/' + state.config.totalWaves;
    if (hudGold) hudGold.textContent = 'Gold: ' + state.gold;
    if (hudLives) hudLives.textContent = 'Lives: ' + state.lives;
  }

  function startNextWave() {
    if (state.phase === PHASE.LOST || state.phase === PHASE.WON) return;
    state.wave++;
    state.phase = PHASE.WAVE_ACTIVE;
    var spawns = window.WaveManager.getWaveEnemies(state.wave);
    spawnQueue = spawns.map(function(s) {
      return { type: s.type, spawnDelay: 0.5 + Math.random() * 0.3 };
    });
    spawnTimer = 0;
  }

  function placeTower(towerId, gridX, gridY) {
    var key = gridX + ',' + gridY;
    if (gridTowers[key]) return false;
    var def = window.Entities.TOWER_TYPES[towerId];
    if (!def) return false;
    if (state.gold < def.cost) return false;
    var tile = state.map.grid[gridY] && state.map.grid[gridY][gridX];
    if (tile !== window.MapGen.TILE.TOWER) return false;
    var tower = window.Entities.createTower(towerId, gridX, gridY);
    if (!tower) return false;
    state.gold -= def.cost;
    towers.push(tower);
    gridTowers[key] = tower;
    return true;
  }

  function getTowerAt(gridX, gridY) {
    return gridTowers[gridX + ',' + gridY] || null;
  }

  function upgradeTower(gridX, gridY) {
    var tower = getTowerAt(gridX, gridY);
    if (!tower) return false;
    var cost = tower.getUpgradeCost();
    if (cost < 0 || state.gold < cost) return false;
    state.gold -= cost;
    tower.upgrade();
    return true;
  }

  function getGameState() { return state; }

  var BUFF_RADIUS = 150;
  var BUFF_VALUES = { 1: 0.15, 2: 0.25, 3: 0.35 };

  function getEffectiveRange(tower, allTowers) {
    var range = tower.range;
    for (var i = 0; i < allTowers.length; i++) {
      var other = allTowers[i];
      if (other.special !== 'buff') continue;
      if (other === tower) continue;
      var dist = window.Entities.distance(
        tower.x * TILE_SIZE + TILE_SIZE / 2,
        tower.y * TILE_SIZE + TILE_SIZE / 2,
        other.x * TILE_SIZE + TILE_SIZE / 2,
        other.y * TILE_SIZE + TILE_SIZE / 2
      );
      if (dist <= BUFF_RADIUS) {
        var buffPercent = BUFF_VALUES[other.level] || BUFF_VALUES[1];
        range *= (1 + buffPercent);
      }
    }
    return range;
  }

  function initialize(mapType, difficulty, loadout) {
    return init(mapType, difficulty, loadout);
  }

  return {
    init: initialize,
    start: start,
    stop: stop,
    pause: pause,
    resume: resume,
    placeTower: placeTower,
    getTowerAt: getTowerAt,
    upgradeTower: upgradeTower,
    startNextWave: startNextWave,
    getGameState: getGameState,
    getEffectiveRange: getEffectiveRange,
    render: render,
    TILE_SIZE: TILE_SIZE
  };
})();
