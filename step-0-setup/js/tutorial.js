window.TutorialManager = (function() {
  var STATES = ['WELCOME', 'SHOP_INTRO', 'FORCE_BUY', 'GHOST_PLACEMENT', 'SPAWN_ENEMY', 'COMPLETE'];
  var currentIndex = 0;

  function getState() {
    return STATES[currentIndex] || 'COMPLETE';
  }

  function advance() {
    if (currentIndex < STATES.length - 1) {
      currentIndex++;
    }
  }

  function reset() {
    currentIndex = 0;
  }

  function start(onComplete) {
    reset();
    enterState(getState(), onComplete);
  }

  function enterState(state, onComplete) {
    switch (state) {
      case 'WELCOME':
        showOverlay('Welcome to Tower Defense!\nGet ready to learn the basics.');
        setTimeout(function() {
          hideOverlay();
          advance();
          enterState(getState(), onComplete);
        }, 2000);
        break;

      case 'SHOP_INTRO':
        showScreen('screen-title');
        lockAllButtons(['btn-shop']);
        addPulse('btn-shop');
        setupOneClickHandler('btn-shop', function() {
          removePulse('btn-shop');
          unlockAllButtons();
          advance();
          enterState(getState(), onComplete);
        });
        break;

      case 'FORCE_BUY':
        showScreen('screen-shop');
        GameUI.populateShop();
        document.querySelectorAll('#shop-tower-list .shop-item button').forEach(function(btn) {
          btn.disabled = true;
        });
        var buyArrow = findBuyButton('arrow');
        if (buyArrow) {
          buyArrow.disabled = false;
          addPulse(buyArrow);
          setupOneClickHandler(buyArrow, function() {
            removePulse(buyArrow);
            advance();
            enterState(getState(), onComplete);
          });
        }
        break;

      case 'GHOST_PLACEMENT':
        Game.init('field', 'easy', ['arrow']);
        showScreen('screen-game');
        setupGhostPlacement(onComplete);
        break;

      case 'SPAWN_ENEMY':
        Game.startNextWave();
        Game.start();
        watchEnemyDeath(onComplete);
        break;

      case 'COMPLETE':
        showOverlay('Tutorial complete!\nYou are ready to play.');
        setTimeout(function() {
          hideOverlay();
          cleanup();
          showScreen('screen-title');
          if (typeof onComplete === 'function') onComplete();
        }, 2500);
        break;
    }
  }

  function showOverlay(text) {
    var el = document.getElementById('tutorial-overlay');
    var textEl = document.getElementById('tutorial-text');
    if (el) el.classList.remove('hidden');
    if (textEl) textEl.innerText = text;
  }

  function hideOverlay() {
    var el = document.getElementById('tutorial-overlay');
    if (el) el.classList.add('hidden');
  }

  function showScreen(id) {
    if (typeof GameUI !== 'undefined' && GameUI.showScreen) {
      GameUI.showScreen(id);
    }
  }

  function lockAllButtons(except) {
    var all = document.querySelectorAll('button');
    all.forEach(function(btn) {
      if (except.indexOf(btn.id) === -1) {
        btn.disabled = true;
      }
    });
  }

  function unlockAllButtons() {
    var all = document.querySelectorAll('button');
    all.forEach(function(btn) {
      btn.disabled = false;
    });
  }

  function addPulse(el) {
    var target = typeof el === 'string' ? document.getElementById(el) : el;
    if (target) target.classList.add('pulse');
  }

  function removePulse(el) {
    var target = typeof el === 'string' ? document.getElementById(el) : el;
    if (target) target.classList.remove('pulse');
  }

  function setupOneClickHandler(el, callback) {
    var target = typeof el === 'string' ? document.getElementById(el) : el;
    if (!target) return;
    function handler() {
      target.removeEventListener('click', handler);
      callback();
    }
    target.addEventListener('click', handler);
  }

  function findBuyButton(towerId) {
    var items = document.querySelectorAll('#shop-tower-list .shop-item');
    for (var i = 0; i < items.length; i++) {
      var btn = items[i].querySelector('button');
      if (btn) {
        var text = items[i].textContent || items[i].innerText;
        if (text.indexOf('Arrow') !== -1 || text.indexOf(towerId) !== -1) {
          return btn;
        }
      }
    }
    return null;
  }

  function setupGhostPlacement(onComplete) {
    var canvas = document.getElementById('game-canvas');
    var map = Game.getGameState().map;
    var tileSize = Game.TILE_SIZE;

    var targetTile = null;
    var centerX = Math.floor(map.cols / 2);
    var centerY = Math.floor(map.rows / 2);
    var bestDist = Infinity;
    for (var r = 0; r < map.rows; r++) {
      for (var c = 0; c < map.cols; c++) {
        if (map.grid[r][c] === MapGen.TILE.TOWER) {
          var d = Math.abs(c - centerX) + Math.abs(r - centerY);
          if (d < bestDist) {
            bestDist = d;
            targetTile = { x: c, y: r };
          }
        }
      }
    }

    showOverlay('Now place your Arrow tower on the highlighted tile.');

    function renderGhost() {
      var ctx = canvas.getContext('2d');
      if (targetTile) {
        ctx.fillStyle = 'rgba(79, 195, 247, 0.3)';
        ctx.fillRect(targetTile.x * tileSize, targetTile.y * tileSize, tileSize, tileSize);
        ctx.strokeStyle = '#4fc3f7';
        ctx.lineWidth = 2;
        ctx.strokeRect(targetTile.x * tileSize, targetTile.y * tileSize, tileSize, tileSize);
        ctx.fillStyle = 'rgba(79, 195, 247, 0.5)';
        ctx.beginPath();
        ctx.arc(targetTile.x * tileSize + tileSize/2, targetTile.y * tileSize + tileSize/2, 14, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (canvas) {
      renderGhost();
    }

    function clickHandler(e) {
      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      var mx = (e.clientX - rect.left) * scaleX;
      var my = (e.clientY - rect.top) * scaleY;
      var gridX = Math.floor(mx / tileSize);
      var gridY = Math.floor(my / tileSize);

      if (targetTile && gridX === targetTile.x && gridY === targetTile.y) {
        Game.placeTower('arrow', gridX, gridY);
        canvas.removeEventListener('click', clickHandler);
        hideOverlay();
        advance();
        enterState(getState(), onComplete);
      }
    }

    canvas.addEventListener('click', clickHandler);
  }

  function watchEnemyDeath(onComplete) {
    var interval = setInterval(function() {
      var gs = Game.getGameState();
      if (!gs) return;
      if (gs.phase === 3) {
        clearInterval(interval);
        Game.stop();
        advance();
        enterState(getState(), onComplete);
      } else if (gs.phase === 4) {
        clearInterval(interval);
        Game.stop();
        showOverlay('The enemy escaped! Towers prevent that.\nTry again in the real game.');
        setTimeout(function() {
          hideOverlay();
          advance();
          enterState(getState(), onComplete);
        }, 3000);
      }
    }, 500);
  }

  function cleanup() {
    removePulse('btn-shop');
    removePulse(document.querySelector('#shop-tower-list .shop-item button'));
    unlockAllButtons();
    hideOverlay();
  }

  return {
    start: start,
    getState: getState,
    advance: advance,
    reset: reset
  };
})();
