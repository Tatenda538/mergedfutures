window.Entities = (function() {
  var TOWER_TYPES = {
    arrow:  { name:'Arrow',  cost:50,  range:150, damage:15, fireRate:500,  special:'none',    upgradeCosts:[75,125], upgradeDamage:[25,40],  upgradeRange:[180,220], upgradeFireRate:[400,300] },
    cannon: { name:'Cannon', cost:100, range:120, damage:40, fireRate:1500, special:'splash',  upgradeCosts:[150,250], upgradeDamage:[60,90],  upgradeRange:[140,160], upgradeFireRate:[1300,1000] },
    ice:    { name:'Ice',    cost:80,  range:130, damage:8,  fireRate:800,  special:'slow',   upgradeCosts:[120,200], upgradeDamage:[12,18], upgradeRange:[150,180], upgradeFireRate:[700,600] },
    sniper: { name:'Sniper', cost:150, range:300, damage:80, fireRate:2500, special:'none',    upgradeCosts:[200,350], upgradeDamage:[120,180],upgradeRange:[350,400], upgradeFireRate:[2200,2000] },
    tesla:  { name:'Tesla',  cost:120, range:100, damage:20, fireRate:700,  special:'chain',  upgradeCosts:[180,300], upgradeDamage:[30,45], upgradeRange:[120,140], upgradeFireRate:[600,500] },
    mortar: { name:'Mortar', cost:90,  range:250, damage:35, fireRate:2000, special:'aoe',    upgradeCosts:[140,220], upgradeDamage:[50,75], upgradeRange:[280,320], upgradeFireRate:[1800,1500] }
  };

  var ENEMY_TYPES = {
    normal: { hp:50,  speed:60,  goldValue:5 },
    fast:   { hp:30,  speed:120, goldValue:8 },
    tank:   { hp:150, speed:40,  goldValue:15 },
    boss:   { hp:500, speed:30,  goldValue:50 }
  };

  var TOWER_IDS = ['arrow','cannon','ice','sniper','tesla','mortar'];

  function distance(x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function createTower(type, x, y) {
    var def = TOWER_TYPES[type];
    if (!def) return null;
    var t = {
      type: type,
      x: x,
      y: y,
      level: 1,
      range: def.range,
      damage: def.damage,
      fireRate: def.fireRate,
      cooldown: 0,
      special: def.special,
      canFire: function(time) { return time >= this.cooldown; },
      fire: function(time) { this.cooldown = time + this.fireRate; },
      upgrade: function() {
        if (this.level >= 3) return false;
        var idx = this.level - 1;
        this.level++;
        this.damage = def['upgradeDamage'][idx];
        this.range = def['upgradeRange'][idx];
        this.fireRate = def['upgradeFireRate'][idx];
        return true;
      },
      getUpgradeCost: function() {
        if (this.level >= 3) return -1;
        return def.upgradeCosts[this.level - 1];
      },
      getStats: function() {
        var def = TOWER_TYPES[this.type];
        return { type: this.type, name: def.name, level: this.level, range: this.range, damage: this.damage, fireRate: this.fireRate, special: def.special };
      }
    };
    return t;
  }

  function createEnemy(type, waypoints) {
    var def = ENEMY_TYPES[type] || ENEMY_TYPES.normal;
    if (!waypoints || waypoints.length < 2) return null;
    return {
      type: type,
      hp: def.hp,
      maxHp: def.hp,
      speed: def.speed,
      x: waypoints[0].x,
      y: waypoints[0].y,
      goldValue: def.goldValue,
      pathIndex: 0,
      alive: true,
      waypoints: waypoints,
      takeDamage: function(amount) {
        this.hp -= amount;
        if (this.hp <= 0) { this.alive = false; this.hp = 0; }
        return !this.alive;
      },
      move: function(dt) {
        if (!this.alive) return;
        var wp = this.waypoints;
        if (this.pathIndex >= wp.length - 1) return;
        var target = wp[this.pathIndex + 1];
        var dx = target.x - this.x, dy = target.y - this.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) { this.pathIndex++; return; }
        var step = this.speed * dt;
        if (step >= dist) {
          this.x = target.x;
          this.y = target.y;
          this.pathIndex++;
        } else {
          this.x += (dx / dist) * step;
          this.y += (dy / dist) * step;
        }
      },
      reachedEnd: function() { return this.pathIndex >= this.waypoints.length - 1; }
    };
  }

  return {
    TOWER_TYPES: TOWER_TYPES,
    ENEMY_TYPES: ENEMY_TYPES,
    TOWER_IDS: TOWER_IDS,
    createTower: createTower,
    createEnemy: createEnemy,
    distance: distance
  };
})();
