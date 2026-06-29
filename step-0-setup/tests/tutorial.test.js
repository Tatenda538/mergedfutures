(function() {
  var T = window.TutorialManager;
  var assert = TDD.assert;
  var assertEqual = TDD.assertEqual;
  var assertThrows = TDD.assertThrows;

  // Test that TutorialManager exists and has expected interface
  assert(typeof T === 'object', 'TutorialManager exists');
  assert(typeof T.start === 'function', 'TutorialManager.start is a function');
  assert(typeof T.getState === 'function', 'TutorialManager.getState is a function');
  assert(typeof T.advance === 'function', 'TutorialManager.advance is a function');

  // Test initial state
  assertEqual(T.getState(), 'WELCOME', 'initial state is WELCOME');

  // Test advance changes state
  T.advance();
  assertEqual(T.getState(), 'SHOP_INTRO', 'advance from WELCOME goes to SHOP_INTRO');

  // Test state names
  T.reset();
  var states = [];
  while (T.getState() !== 'COMPLETE') {
    states.push(T.getState());
    T.advance();
  }
  assertEqual(states.length, 5, '5 states before COMPLETE (WELCOME, SHOP_INTRO, FORCE_BUY, GHOST_PLACEMENT, SPAWN_ENEMY)');

  // Test advance from COMPLETE is no-op
  var s = T.getState();
  T.advance();
  assertEqual(T.getState(), s, 'advance from COMPLETE does not change state');
})();
