(function() {
  window.GameState.reset();

  TDD.assertEqual(window.GameState.getCoins(), 0, 'starts with 0 coins');
  TDD.assertEqual(window.GameState.getUnlockedTowers().length, 1, 'starts with 1 tower unlocked');

  window.GameState.addCoins(100);
  TDD.assertEqual(window.GameState.getCoins(), 100, 'addCoins adds');

  TDD.assertEqual(window.GameState.spendCoins(30), true, 'spendCoins returns true');
  TDD.assertEqual(window.GameState.getCoins(), 70, 'coins deducted');

  TDD.assertEqual(window.GameState.spendCoins(200), false, 'spendCoins returns false when insufficient');
  TDD.assertEqual(window.GameState.getCoins(), 70, 'coins unchanged after failed spend');

  window.GameState.unlockTower('cannon');
  TDD.assertEqual(window.GameState.isTowerUnlocked('cannon'), true, 'tower unlocked');
  TDD.assertEqual(window.GameState.isTowerUnlocked('nonexistent'), false, 'unknown tower not unlocked');

  window.GameState.recordWin('field', 'easy');
  TDD.assertEqual(window.GameState.hasWon('field', 'easy'), true, 'win recorded');
  TDD.assertEqual(window.GameState.hasWon('field', 'hard'), false, 'unplayed diff not won');

  window.GameState.save();
  window.GameState.reset();
  TDD.assertEqual(window.GameState.getCoins(), 0, 'reset clears coins');
  window.GameState.load();
  TDD.assertEqual(window.GameState.getCoins(), 70, 'load restores coins');
})();
