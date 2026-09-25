/**
 * Tests.gs
 * Lightweight test runner for the app.
 */

function runAllTests() {
  const results = [];

  try {
    const init = initializeApp();
    results.push({ name: 'initializeApp', passed: init && init.success === true });
  } catch (e) {
    results.push({ name: 'initializeApp', passed: false, error: e.toString() });
  }

  try {
    const state = getApplicationState();
    results.push({ name: 'getApplicationState', passed: !!state && !!state.finance && !!state.rental });
  } catch (e) {
    results.push({ name: 'getApplicationState', passed: false, error: e.toString() });
  }

  return results;
}

function testCreateAccount() {
  const result = createAccount_({
    id: 'acct-test',
    name: 'Test Account',
    owner: 'Test User',
    currency: 'EUR',
    type: 'Cash',
    opening_balance: '100',
    notes: '',
    archived: false
  });
  return result;
}
