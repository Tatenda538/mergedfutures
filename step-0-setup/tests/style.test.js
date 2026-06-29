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

  try {
    testOverlay();
    testHidden();
    testMessage();
    testPulse();
  } catch (e) {
    TDD.assert(false, 'CSS test error: ' + e.message);
  }
})();
