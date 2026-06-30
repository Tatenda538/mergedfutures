(function() {
  var assert = TDD.assert;
  var assertEqual = TDD.assertEqual;

  // Verify welcome screen appears and buttons route correctly
  var welcomeScreen = document.getElementById('screen-welcome');
  assert(!!welcomeScreen, 'screen-welcome exists');

  var yesBtn = document.getElementById('btn-welcome-yes');
  var noBtn = document.getElementById('btn-welcome-no');
  assert(!!yesBtn, 'btn-welcome-yes exists');
  assert(!!noBtn, 'btn-welcome-no exists');

  // Mock TutorialManager and GameUI
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

  // Test clicking "No" goes to menu without tutorial
  window.GameState.load();
  window.showWelcomeScreen();

  assert(welcomeScreen.classList.contains('active'), 'welcome screen is active on load');

  noBtn.click();
  assert(initCalled === true, 'GameUI.init is called after clicking No');
  assert(startCalled === false, 'TutorialManager.start is NOT called after clicking No');
  assert(!welcomeScreen.classList.contains('active'), 'welcome screen is hidden after clicking No');

  // Reset and test clicking "Yes" runs tutorial
  startCalled = false;
  initCalled = false;
  window.GameUI.init = function() { initCalled = true; };
  window.TutorialManager.start = function(cb) {
    startCalled = true;
    if (typeof cb === 'function') cb();
  };

  window.showWelcomeScreen();
  yesBtn.click();
  assert(startCalled === true, 'TutorialManager.start is called after clicking Yes');
  assert(initCalled === true, 'GameUI.init is called after tutorial completes');
  assert(!welcomeScreen.classList.contains('active'), 'welcome screen is hidden after clicking Yes');

  // Restore
  window.TutorialManager.start = origStart;
  window.GameUI.init = origInit;
})();
