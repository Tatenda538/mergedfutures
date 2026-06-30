(function() {
  function showWelcomeScreen() {
    window.GameState.load();
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) screens[i].classList.remove('active');
    document.getElementById('screen-welcome').classList.add('active');
  }
  window.showWelcomeScreen = showWelcomeScreen;

  document.getElementById('btn-welcome-yes').addEventListener('click', function() {
    document.getElementById('screen-welcome').classList.remove('active');
    window.TutorialManager.start(function() {
      window.GameUI.init();
    });
  });

  document.getElementById('btn-welcome-no').addEventListener('click', function() {
    document.getElementById('screen-welcome').classList.remove('active');
    window.GameUI.init();
  });

  showWelcomeScreen();
})();
