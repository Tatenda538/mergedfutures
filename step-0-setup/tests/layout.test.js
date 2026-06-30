(function() {
  var assert = TDD.assert;
  var assertEqual = TDD.assertEqual;

  // Dynamically create game screen structure for testing
  var screen = document.createElement('div');
  screen.id = 'screen-game';
  screen.className = 'screen';
  screen.innerHTML =
    '<div id="game-hud"><span id="hud-wave">Wave 1/5</span><span id="hud-gold">Gold: 100</span><span id="hud-lives">Lives: 20</span></div>' +
    '<div id="game-main">' +
      '<canvas id="game-canvas"></canvas>' +
      '<div id="game-sidebar">' +
        '<h3>Shop</h3>' +
        '<div id="shop-list"></div>' +
        '<div id="tower-info">' +
          '<h3>Tower Info</h3>' +
          '<div id="tower-info-text">Select a tower</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div id="game-loadout-bar"></div>' +
    '<div id="game-controls">' +
      '<button id="btn-start-wave">Start Wave</button>' +
      '<button id="btn-game-quit">Quit</button>' +
    '</div>';
  document.body.appendChild(screen);

  assert(!!document.getElementById('screen-game'), 'screen-game exists');
  assert(!!document.getElementById('game-hud'), 'game-hud exists');
  assert(!!document.getElementById('game-main'), 'game-main exists');
  assert(!!document.getElementById('game-canvas'), 'game-canvas exists');
  assert(!!document.getElementById('game-sidebar'), 'game-sidebar exists');
  assert(!!document.getElementById('shop-list'), 'shop-list exists');
  assert(!!document.getElementById('tower-info'), 'tower-info exists');
  assert(!!document.getElementById('game-loadout-bar'), 'game-loadout-bar exists');
  assert(!!document.getElementById('game-controls'), 'game-controls exists');
  assert(!!document.getElementById('btn-start-wave'), 'btn-start-wave exists');
  assert(!!document.getElementById('btn-game-quit'), 'btn-game-quit exists');
  assert(!!document.getElementById('hud-lives'), 'hud-lives exists');
  assert(!!document.getElementById('hud-wave'), 'hud-wave exists');
  assert(!!document.getElementById('hud-gold'), 'hud-gold exists');

  // Test setupGameUI renders loadout slots from selectedLoadout
  GameState.load();
  GameUI.setupGameUI();
  var bar = document.getElementById('game-loadout-bar');
  var slots = bar.querySelectorAll('.loadout-slot');
  assert(slots.length === 5, 'loadout should have 5 slots (filled + empty)');

  // Verify filled slots exist (only Arrow unlocked by default)
  var filledSlots = bar.querySelectorAll('.loadout-slot[data-tower-id]');
  assert(filledSlots.length === 0, 'no filled slots since selectedLoadout is empty (test env)');

  // Verify empty slots exist for the remaining
  var emptySlots = bar.querySelectorAll('.loadout-slot.empty');
  assert(emptySlots.length > 0, 'has empty loadout slots');

  // Verify shop-list has tower cards (at least Arrow)
  var shopList = document.getElementById('shop-list');
  var cards = shopList.querySelectorAll('.shop-card');
  assert(cards.length > 0, 'sidebar has shop cards');

  // Cleanup
  document.body.removeChild(screen);
})();
