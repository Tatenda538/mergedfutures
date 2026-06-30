(function() {
  var assert = TDD.assert;
  var assertEqual = TDD.assertEqual;

  var gameScreen = document.getElementById('screen-game');
  assert(!!gameScreen, 'game screen exists');

  var hud = document.getElementById('game-hud');
  assert(!!hud, 'game-hud exists');

  var main = document.getElementById('game-main');
  assert(!!main, 'game-main exists');

  var canvas = document.getElementById('game-canvas');
  assert(!!canvas, 'game-canvas exists');

  var sidebar = document.getElementById('game-sidebar');
  assert(!!sidebar, 'game-sidebar exists');

  var shopList = document.getElementById('shop-list');
  assert(!!shopList, 'shop-list exists');

  var towerInfo = document.getElementById('tower-info');
  assert(!!towerInfo, 'tower-info exists');

  var loadoutBar = document.getElementById('game-loadout-bar');
  assert(!!loadoutBar, 'game-loadout-bar exists');

  var controls = document.getElementById('game-controls');
  assert(!!controls, 'game-controls exists');

  var startBtn = document.getElementById('btn-start-wave');
  assert(!!startBtn, 'btn-start-wave exists');

  var quitBtn = document.getElementById('btn-game-quit');
  assert(!!quitBtn, 'btn-game-quit exists');

  var hudLives = document.getElementById('hud-lives');
  var hudWave = document.getElementById('hud-wave');
  var hudGold = document.getElementById('hud-gold');
  assert(!!hudLives, 'hud-lives exists');
  assert(!!hudWave, 'hud-wave exists');
  assert(!!hudGold, 'hud-gold exists');

  assert(sidebar.querySelector('h3') !== null, 'sidebar has h3 title');
  assert(shopList.children.length > 0, 'shop-list has tower cards (at least Arrow)');
})();
