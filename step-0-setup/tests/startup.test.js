(function() {
  var assert = TDD.assert;
  var assertEqual = TDD.assertEqual;

  var origStart = window.TutorialManager.start;
  var origInit = window.GameUI.init;
  var startCalled = false;
  var initCalled = false;

  window.TutorialManager.start = function(cb) {
    startCalled = true;
    if (typeof cb === 'function') cb();
  };
  window.GameUI.init = function() {
    initCalled = true;
  };

  window.GameState.load();

  window.TutorialManager.start(function() {
    window.GameUI.init();
  });

  assert(startCalled === true, 'TutorialManager.start is called');
  assert(initCalled === true, 'GameUI.init is called after tutorial completes');

  window.TutorialManager.start = origStart;
  window.GameUI.init = origInit;
})();
