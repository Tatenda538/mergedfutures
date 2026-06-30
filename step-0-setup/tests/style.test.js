(function() {
  var assert = TDD.assert;
  var assertEqual = TDD.assertEqual;

  // Verify CSS classes exist by checking computed styles of dynamically created elements
  function testOverlay() {
    var el = document.createElement('div');
    el.className = 'tutorial-overlay';
    document.body.appendChild(el);
    var cs = getComputedStyle(el);
    assertEqual(cs.position, 'fixed', '.tutorial-overlay should have position: fixed');
    assertEqual(cs.zIndex, '100', '.tutorial-overlay should have z-index: 100');
    assertEqual(cs.backgroundColor, 'rgba(0, 0, 0, 0.6)', '.tutorial-overlay should have background: rgba(0,0,0,0.6)');
    assertEqual(cs.display, 'flex', '.tutorial-overlay should have display: flex');
    assertEqual(cs.color, 'rgb(255, 255, 255)', '.tutorial-overlay should have color: #fff');
    assertEqual(cs.fontSize, '24px', '.tutorial-overlay should have font-size: 24px');
    assertEqual(cs.textAlign, 'center', '.tutorial-overlay should have text-align: center');
    el.remove();
  }

  function testHidden() {
    var el = document.createElement('div');
    el.className = 'tutorial-overlay';
    document.body.appendChild(el);
    el.classList.add('hidden');
    assertEqual(getComputedStyle(el).display, 'none', '.tutorial-overlay.hidden should have display: none');
    el.remove();
  }

  function testMessage() {
    var el = document.createElement('div');
    el.className = 'tutorial-message';
    document.body.appendChild(el);
    var cs = getComputedStyle(el);
    assertEqual(cs.backgroundColor, 'rgb(34, 34, 34)', '.tutorial-message should have background: #222');
    assertEqual(cs.borderRadius, '8px', '.tutorial-message should have border-radius: 8px');
    assert(cs.maxWidth === '500px', '.tutorial-message should have max-width: 500px');
    assert(cs.padding.indexOf('32px') !== -1, '.tutorial-message should have padding: 2em');
    el.remove();
  }

  function testPulse() {
    var el = document.createElement('button');
    el.className = 'pulse';
    document.body.appendChild(el);
    var cs = getComputedStyle(el);
    assertEqual(cs.animationName, 'pulse', '.pulse should have animation-name: pulse');
    el.remove();
  }

  function testGameScreenLayout() {
    var el = document.createElement('div');
    el.id = 'screen-game';
    document.body.appendChild(el);
    var cs = getComputedStyle(el);
    assertEqual(cs.display, 'none', '#screen-game should have display: none');
    assert(cs.flexDirection.indexOf('column') !== -1, '#screen-game should have flex-direction: column');
    el.classList.add('active');
    assertEqual(getComputedStyle(el).display, 'flex', '#screen-game.active should have display: flex');
    el.remove();
  }

  function testGameHud() {
    var el = document.createElement('div');
    el.id = 'game-hud';
    document.body.appendChild(el);
    var cs = getComputedStyle(el);
    assert(cs.display.indexOf('flex') !== -1, '#game-hud should have display: flex');
    el.remove();
  }

  function testGameMain() {
    var el = document.createElement('div');
    el.id = 'game-main';
    document.body.appendChild(el);
    var cs = getComputedStyle(el);
    assert(cs.display.indexOf('flex') !== -1, '#game-main should have display: flex');
    assertEqual(cs.minHeight, '0px', '#game-main should have min-height: 0');
    el.remove();
  }

  function testGameCanvasFlex() {
    var el = document.createElement('div');
    el.id = 'game-canvas';
    document.body.appendChild(el);
    var cs = getComputedStyle(el);
    assert(cs.flexGrow === '1', '#game-canvas should have flex: 1');
    assert(cs.maxWidth.indexOf('calc') !== -1 || cs.maxWidth === 'calc(100% - 270px)', '#game-canvas should have max-width: calc(100% - 270px)');
    el.remove();
  }

  function testGameSidebar() {
    var el = document.createElement('div');
    el.id = 'game-sidebar';
    document.body.appendChild(el);
    var cs = getComputedStyle(el);
    assertEqual(cs.width, '250px', '#game-sidebar should have width: 250px');
    assert(cs.display.indexOf('flex') !== -1, '#game-sidebar should have display: flex');
    el.remove();
  }

  function testGameLoadoutBar() {
    var el = document.createElement('div');
    el.id = 'game-loadout-bar';
    document.body.appendChild(el);
    var cs = getComputedStyle(el);
    assert(cs.display.indexOf('flex') !== -1, '#game-loadout-bar should have display: flex');
    el.remove();
  }

  function testLoadoutSlot() {
    var el = document.createElement('div');
    el.className = 'loadout-slot';
    document.body.appendChild(el);
    var cs = getComputedStyle(el);
    assertEqual(cs.width, '80px', '.loadout-slot should have width: 80px');
    assertEqual(cs.height, '60px', '.loadout-slot should have height: 60px');
    el.remove();
  }

  function testLoadoutSlotEmpty() {
    var el = document.createElement('div');
    el.className = 'loadout-slot empty';
    document.body.appendChild(el);
    assertEqual(getComputedStyle(el).cursor, 'default', '.loadout-slot.empty should have cursor: default');
    el.remove();
  }

  function testGameControls() {
    var el = document.createElement('div');
    el.id = 'game-controls';
    document.body.appendChild(el);
    var cs = getComputedStyle(el);
    assert(cs.display.indexOf('flex') !== -1, '#game-controls should have display: flex');
    el.remove();
  }

  function testShopCard() {
    var el = document.createElement('div');
    el.className = 'shop-card';
    document.body.appendChild(el);
    var cs = getComputedStyle(el);
    assert(cs.display.indexOf('flex') !== -1, '.shop-card should have display: flex');
    el.remove();
  }

  function testShopCardLocked() {
    var el = document.createElement('div');
    el.className = 'shop-card locked';
    document.body.appendChild(el);
    var cs = getComputedStyle(el);
    assertEqual(cs.opacity, '0.4', '.shop-card.locked should have opacity: 0.4');
    assertEqual(cs.cursor, 'not-allowed', '.shop-card.locked should have cursor: not-allowed');
    el.remove();
  }

  function testTowerInfo() {
    var el = document.createElement('div');
    el.id = 'tower-info';
    document.body.appendChild(el);
    var cs = getComputedStyle(el);
    assertEqual(cs.minHeight, '80px', '#tower-info should have min-height: 80px');
    el.remove();
  }

  try {
    testOverlay();
    testHidden();
    testMessage();
    testPulse();
    testGameScreenLayout();
    testGameHud();
    testGameMain();
    testGameCanvasFlex();
    testGameSidebar();
    testGameLoadoutBar();
    testLoadoutSlot();
    testLoadoutSlotEmpty();
    testGameControls();
    testShopCard();
    testShopCardLocked();
    testTowerInfo();
  } catch (e) {
    TDD.assert(false, 'CSS test error: ' + e.message);
  }
})();
