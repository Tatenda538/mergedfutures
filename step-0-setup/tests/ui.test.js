(function() {
  var assert = TDD.assert;
  var assertEqual = TDD.assertEqual;

  var modeBtn = document.getElementById('btn-mode-confirm');
  var loadoutBtn = document.getElementById('btn-loadout-start');
  var loadoutScreen = document.getElementById('screen-loadout');

  // Only run UI tests if the game DOM is present (they won't be in the test runner)
  if (!modeBtn || !loadoutBtn || !loadoutScreen) {
    TDD.assert(true, 'Skipping UI tests - game DOM not present in test runner');
    return;
  }

  var alertCalled = false;
  var origAlert = window.alert;
  window.alert = function() { alertCalled = true; };

  // Test: btn-mode-confirm should go to loadout screen without alerting
  GameUI.showScreen('screen-mode-select');
  GameUI.populateModeSelect();

  alertCalled = false;
  modeBtn.click();

  assert(alertCalled === false, 'btn-mode-confirm should NOT alert when loadout is empty');
  assertEqual(loadoutScreen.className, 'screen active', 'btn-mode-confirm should show loadout screen (active class)');

  // Test: btn-loadout-start SHOULD still alert when loadout is empty
  alertCalled = false;
  loadoutBtn.click();
  assert(alertCalled === true, 'btn-loadout-start SHOULD alert when loadout is empty');

  window.alert = origAlert;
})();
