window.GameState = (function() {
  var state = {
    coins: 0,
    unlockedTowers: ['arrow'],
    wins: {}
  };

  function getState() { return state; }

  function reset() {
    state.coins = 0;
    state.unlockedTowers = ['arrow'];
    state.wins = {};
  }

  function addCoins(n) { state.coins += n; }

  function spendCoins(n) {
    if (state.coins < n) return false;
    state.coins -= n;
    return true;
  }

  function getCoins() { return state.coins; }

  function unlockTower(id) {
    if (state.unlockedTowers.indexOf(id) === -1) state.unlockedTowers.push(id);
  }

  function isTowerUnlocked(id) { return state.unlockedTowers.indexOf(id) !== -1; }

  function getUnlockedTowers() { return state.unlockedTowers.slice(); }

  function recordWin(mapType, difficulty) {
    state.wins[mapType + '-' + difficulty] = true;
  }

  function hasWon(mapType, difficulty) {
    return !!state.wins[mapType + '-' + difficulty];
  }

  function save() {
    localStorage.setItem('td_state', JSON.stringify(state));
  }

  function load() {
    var saved = localStorage.getItem('td_state');
    if (saved) {
      try {
        var parsed = JSON.parse(saved);
        state.coins = parsed.coins || 0;
        state.unlockedTowers = parsed.unlockedTowers || ['arrow'];
        state.wins = parsed.wins || {};
      } catch(e) { reset(); }
    }
  }

  return {
    getState: getState,
    reset: reset,
    addCoins: addCoins,
    spendCoins: spendCoins,
    getCoins: getCoins,
    unlockTower: unlockTower,
    isTowerUnlocked: isTowerUnlocked,
    getUnlockedTowers: getUnlockedTowers,
    recordWin: recordWin,
    hasWon: hasWon,
    save: save,
    load: load
  };
})();
