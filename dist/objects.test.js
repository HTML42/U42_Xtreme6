/* SOURCE: objects\x_user\x_user.test.js */
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

/* SOURCE: objects\x_users\x_users.test.js */
// Basic runtime assertions for XUsers.
(async () => {
  if (typeof window.XUsers !== 'function') {
    console.error('FAIL: x_users.test.js - XUsers is not available');
    return;
  }

  if (typeof window.XUser !== 'function') {
    console.error('FAIL: x_users.test.js - XUser is not available');
    return;
  }

  window.XUsers.clear_cache();
  const users = await window.XUsers.load(1);

  if (!Array.isArray(users)) {
    console.error('FAIL: x_users.test.js - XUsers.load did not return an array');
    return;
  }

  if (!users[0] || users[0].id !== 1) {
    console.error('FAIL: x_users.test.js - First entry is not a XUser with id 1');
    return;
  }

  console.log('PASS: x_users.test.js - XUsers list contains XUser id 1');
})();
