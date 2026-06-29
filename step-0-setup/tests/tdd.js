window.TDD = (function() {
  const results = { passed: 0, failed: 0, errors: [] };

  function assert(condition, message) {
    if (condition) { results.passed++; }
    else { results.failed++; results.errors.push('FAIL: ' + message); }
  }

  function assertEqual(actual, expected, message) {
    if (actual === expected) { results.passed++; }
    else { results.failed++; results.errors.push('FAIL: ' + message + ' \u2014 expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual)); }
  }

  function assertNotEqual(actual, expected, message) {
    if (actual !== expected) { results.passed++; }
    else { results.failed++; results.errors.push('FAIL: ' + message + ' \u2014 both are ' + JSON.stringify(actual)); }
  }

  function assertThrows(fn, message) {
    try { fn(); results.failed++; results.errors.push('FAIL: ' + message + ' \u2014 no error thrown'); }
    catch (e) { results.passed++; }
  }

  function report() {
    const el = document.getElementById('test-results');
    if (!el) return;
    el.innerHTML = '<h2>Test Results</h2>' +
      '<p>Passed: ' + results.passed + ' | Failed: ' + results.failed + '</p>' +
      (results.errors.length ? '<ul>' + results.errors.map(function(e) { return '<li>' + e + '</li>'; }).join('') + '</ul>' : '<p>All tests passed!</p>');
    return results;
  }

  function reset() { results.passed = 0; results.failed = 0; results.errors = []; }

  return { assert: assert, assertEqual: assertEqual, assertNotEqual: assertNotEqual, assertThrows: assertThrows, report: report, reset: reset };
})();
