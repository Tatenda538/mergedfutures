window.GameUI = (function() {
  var selectedLoadout = [];
  var selectedMapType = 'field';
  var selectedDifficulty = 'easy';
  var selectedTowerForPlacement = null;

  function init() {
    window.GameState.load();

    // Title screen buttons
    document.getElementById('btn-play').addEventListener('click', function() { showScreen('screen-mode-select'); populateModeSelect(); });
    document.getElementById('btn-shop').addEventListener('click', function() { showScreen('screen-shop'); populateShop(); });
    document.getElementById('btn-tutorial').addEventListener('click', function() { showScreen('screen-tutorial'); });
    document.getElementById('btn-tutorial-close').addEventListener('click', function() { showScreen('screen-title'); });
    document.getElementById('btn-shop-back').addEventListener('click', function() { showScreen('screen-title'); });

    // Mode select
    document.getElementById('btn-mode-confirm').addEventListener('click', function() {
      showScreen('screen-loadout');
    });
    document.getElementById('btn-mode-back').addEventListener('click', function() { showScreen('screen-title'); });

    // Loadout
    document.getElementById('btn-loadout-start').addEventListener('click', function() {
      if (selectedLoadout.length === 0) { alert('Select at least 1 tower'); return; }
      startGame();
    });
    document.getElementById('btn-loadout-back').addEventListener('click', function() { showScreen('screen-mode-select'); });

    // Game
    document.getElementById('btn-start-wave').addEventListener('click', function() {
      window.Game.startNextWave();
    });
    document.getElementById('btn-game-quit').addEventListener('click', function() {
      window.Game.stop();
      showScreen('screen-mode-select');
    });

    // End screen
    document.getElementById('btn-end-retry').addEventListener('click', function() {
      startGame();
    });
    document.getElementById('btn-end-menu').addEventListener('click', function() {
      showScreen('screen-title');
    });

    // Canvas click for tower placement / upgrade
    var canvas = document.getElementById('game-canvas');
    canvas.addEventListener('click', function(e) {
      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      var mx = (e.clientX - rect.left) * scaleX;
      var my = (e.clientY - rect.top) * scaleY;
      var gridX = Math.floor(mx / window.Game.TILE_SIZE);
      var gridY = Math.floor(my / window.Game.TILE_SIZE);

      // If a tower is selected for placement, try to place
      if (selectedTowerForPlacement) {
        if (window.Game.placeTower(selectedTowerForPlacement, gridX, gridY)) {
          selectedTowerForPlacement = null;
          updateLoadoutBar();
        }
        return;
      }

      // Otherwise, check for existing tower to upgrade
      var existing = window.Game.getTowerAt(gridX, gridY);
      if (existing) {
        var cost = existing.getUpgradeCost();
        if (cost < 0) { alert('Already max level!'); return; }
        if (confirm('Upgrade ' + existing.type + ' to level ' + (existing.level + 1) + ' for $' + cost + '?')) {
          window.Game.upgradeTower(gridX, gridY);
        }
      }
    });

    showScreen('screen-title');
  }

  function showScreen(id) {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) screens[i].classList.remove('active');
    document.getElementById(id).classList.add('active');
    // Canvas sizing handled by CSS flex layout
  }

  function populateShop() {
    var coins = window.GameState.getCoins();
    document.getElementById('shop-coins').textContent = 'Coins: ' + coins;
    var list = document.getElementById('shop-tower-list');
    list.innerHTML = '';
    window.Entities.TOWER_IDS.forEach(function(id) {
      var def = window.Entities.TOWER_TYPES[id];
      var owned = window.GameState.isTowerUnlocked(id);
      var div = document.createElement('div');
      div.className = 'shop-item';
      div.innerHTML = def.name + ' - ' + def.cost + ' coins ' + (owned ? '[OWNED]' : '');
      if (!owned) {
        var btn = document.createElement('button');
        btn.textContent = 'Buy';
        btn.addEventListener('click', function() {
          if (window.GameState.spendCoins(def.cost)) {
            window.GameState.unlockTower(id);
            window.GameState.save();
            populateShop();
          } else {
            alert('Not enough coins!');
          }
        });
        div.appendChild(btn);
      }
      list.appendChild(div);
    });
  }

  function populateModeSelect() {
    var mapContainer = document.getElementById('map-type-select');
    mapContainer.innerHTML = '';
    var maps = ['field', 'canyon', 'forest', 'plateau'];
    var mapNames = { field:'Open Field', canyon:'Canyon', forest:'Forest', plateau:'Plateau' };
    maps.forEach(function(id) {
      var btn = document.createElement('button');
      btn.textContent = mapNames[id];
      btn.className = id === selectedMapType ? 'active' : '';
      btn.addEventListener('click', function() {
        selectedMapType = id;
        populateModeSelect();
      });
      mapContainer.appendChild(btn);
    });

    var diffContainer = document.getElementById('difficulty-select');
    diffContainer.innerHTML = '';
    var diffs = ['easy', 'medium', 'hard'];
    var diffNames = { easy:'Easy (25)', medium:'Medium (32)', hard:'Hard (40)' };
    diffs.forEach(function(id) {
      var btn = document.createElement('button');
      btn.textContent = diffNames[id];
      btn.className = id === selectedDifficulty ? 'active' : '';
      btn.addEventListener('click', function() {
        selectedDifficulty = id;
        populateModeSelect();
      });
      diffContainer.appendChild(btn);
    });

    populateLoadoutSelection();
  }

  function populateLoadoutSelection() {
    var avail = document.getElementById('available-towers');
    if (!avail) return;
    avail.innerHTML = 'Click tower to add: ';
    window.Entities.TOWER_IDS.forEach(function(id) {
      if (!window.GameState.isTowerUnlocked(id)) return;
      var def = window.Entities.TOWER_TYPES[id];
      var btn = document.createElement('button');
      btn.textContent = def.name;
      btn.addEventListener('click', function() {
        if (selectedLoadout.length >= 5) { alert('Loadout full!'); return; }
        if (selectedLoadout.indexOf(id) !== -1) { alert('Already in loadout!'); return; }
        selectedLoadout.push(id);
        populateLoadoutSelection();
        populateLoadoutSlots();
      });
      avail.appendChild(btn);
    });
    populateLoadoutSlots();
  }

  function populateLoadoutSlots() {
    var slots = document.getElementById('loadout-slots');
    if (!slots) return;
    slots.innerHTML = 'Selected: ';
    selectedLoadout.forEach(function(id) {
      var def = window.Entities.TOWER_TYPES[id];
      var span = document.createElement('span');
      span.textContent = '[' + def.name + '] ';
      span.style.margin = '0 8px';
      slots.appendChild(span);
    });
  }

  function setupGameUI() {
    var bar = document.getElementById('game-loadout-bar');
    bar.innerHTML = '';
    selectedLoadout.forEach(function(id, index) {
      var def = window.Entities.TOWER_TYPES[id];
      var slot = document.createElement('div');
      slot.className = 'loadout-slot';
      slot.setAttribute('data-tower-id', id);
      slot.setAttribute('data-slot', index);
      slot.innerHTML = '<div class="loadout-slot-icon">' + def.name[0] + '</div><div class="loadout-slot-name">' + def.name + '</div>';
      slot.addEventListener('click', function() {
        selectedTowerForPlacement = id;
        var all = bar.querySelectorAll('.loadout-slot');
        all.forEach(function(s) { s.classList.remove('active'); });
        slot.classList.add('active');
      });
      bar.appendChild(slot);
    });
    // Fill remaining empty slots
    for (var i = selectedLoadout.length; i < 5; i++) {
      var empty = document.createElement('div');
      empty.className = 'loadout-slot empty';
      empty.innerHTML = '[Empty]';
      bar.appendChild(empty);
    }
    updateSidebar();
  }

  function updateSidebar() {
    var list = document.getElementById('shop-list');
    if (!list) return;
    list.innerHTML = '';
    window.Entities.TOWER_IDS.forEach(function(id) {
      var def = window.Entities.TOWER_TYPES[id];
      var owned = window.GameState.isTowerUnlocked(id);
      var card = document.createElement('div');
      card.className = 'shop-card' + (owned ? '' : ' locked');
      card.innerHTML =
        '<div class="shop-card-icon">' + def.name[0] + '</div>' +
        '<div class="shop-card-info">' +
          '<div class="shop-card-name">' + (owned ? def.name : '???') + '</div>' +
          '<div class="shop-card-cost">' + (owned ? '$' + def.cost : 'Locked') + '</div>' +
        '</div>';
      if (owned) {
        card.addEventListener('click', function() {
          showTowerInfo(id);
        });
      }
      list.appendChild(card);
    });
  }

  function showTowerInfo(id) {
    var def = window.Entities.TOWER_TYPES[id];
    var infoText = document.getElementById('tower-info-text');
    if (!infoText || !def) return;
    infoText.innerHTML =
      '<b>' + def.name + '</b><br>' +
      'Damage: ' + def.damage + '<br>' +
      'Range: ' + def.range + '<br>' +
      'Fire Rate: ' + def.fireRate + 'ms<br>' +
      'Special: ' + def.special;
  }

  function updateLoadoutBar() {
    var gs = window.Game.getGameState();
    var bar = document.getElementById('game-loadout-bar');
    if (!bar) return;
    var slots = bar.querySelectorAll('.loadout-slot');
    slots.forEach(function(slot) {
      var id = slot.getAttribute('data-tower-id');
      if (id) {
        var def = window.Entities.TOWER_TYPES[id];
        var canAfford = gs.gold >= def.cost;
        slot.style.opacity = canAfford ? '1' : '0.5';
      }
    });
  }

  function startGame() {
    if (selectedLoadout.length === 0) selectedLoadout = ['arrow'];
    window.Game.init(selectedMapType, selectedDifficulty, selectedLoadout);
    showScreen('screen-game');
    setupGameUI();
    var checkInterval = setInterval(function() {
      var gs = window.Game.getGameState();
      if (!gs) return;
      if (gs.phase === 3) {
        clearInterval(checkInterval);
        window.Game.stop();
        var bonus = gs.wave * 10;
        window.GameState.addCoins(bonus);
        window.GameState.recordWin(selectedMapType, selectedDifficulty);
        window.GameState.save();
        showEndScreen(true, bonus);
      } else if (gs.phase === 4) {
        clearInterval(checkInterval);
        window.Game.stop();
        showEndScreen(false, 0);
      }
    }, 500);
    window.Game.start();
  }

  function showEndScreen(won, coins) {
    document.getElementById('end-title').textContent = won ? 'You Win! +' + coins + ' coins' : 'You Lost!';
    showScreen('screen-end');
  }

  return {
    init: init,
    showScreen: showScreen,
    populateShop: populateShop,
    populateModeSelect: populateModeSelect,
    setupGameUI: setupGameUI,
    updateSidebar: updateSidebar,
    showEndScreen: showEndScreen,
    startGame: startGame
  };
})();
