const fs = require('fs');
const vm = require('vm');
const path = require('path');

const userCode = fs.readFileSync(path.join(__dirname, '../x-user/x-user.class.js'), 'utf8');
const usersCode = fs.readFileSync(path.join(__dirname, 'x-users.class.js'), 'utf8');
vm.runInThisContext(userCode, { filename: 'x-user.class.js' });
vm.runInThisContext(usersCode, { filename: 'x-users.class.js' });

globalThis.XUser.clear_cache();
globalThis.XUsers.clear_cache();

const listA = globalThis.XUsers.list({ sort: 'name_asc' });
const listB = globalThis.XUsers.list({ sort: 'name_asc' });

if (listA.length !== 2) {
  throw new Error('x-users.test.js failed: list length');
}

if (listA[0] !== listB[0]) {
  throw new Error('x-users.test.js failed: cache identity');
}

console.log('x-users.test.js passed');
