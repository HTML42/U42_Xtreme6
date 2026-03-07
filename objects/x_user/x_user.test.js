// Basic runtime assertions for XUser.
(() => {
  if (typeof window.XUser !== 'function') {
    console.error('FAIL: x_user.test.js - XUser is not available');
    return;
  }

  window.XUser.clear_cache();
  const user = new window.XUser(1);

  if (!Object.prototype.hasOwnProperty.call(user, 'id')) {
    console.error('FAIL: x_user.test.js - XUser object has no id property');
    return;
  }

  if (user.id !== 1) {
    console.error(`FAIL: x_user.test.js - Expected id 1, got ${user.id}`);
    return;
  }

  console.log('PASS: x_user.test.js - XUser id is 1');
})();
