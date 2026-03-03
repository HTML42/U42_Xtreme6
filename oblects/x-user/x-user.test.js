const fs = require('fs');
const vm = require('vm');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, 'x-user.class.js'), 'utf8');
vm.runInThisContext(code, { filename: 'x-user.class.js' });

globalThis.XUser.clear_cache();

const userA = globalThis.XUser.load(1);
const userB = globalThis.XUser.load_by_id(1);
if (userA !== userB) {
  throw new Error('x-user.test.js failed: cache by id');
}

const userC = globalThis.XUser.load_by_name('Ada Lovelace');
if (userC.id !== 1) {
  throw new Error('x-user.test.js failed: load_by_name');
}

console.log('x-user.test.js passed');
