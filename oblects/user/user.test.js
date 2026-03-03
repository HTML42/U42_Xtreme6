import { User } from './user.class.js';

const u = new User(1, 'Ada', 'ada@example.com');
if (u.id !== 1 || u.name !== 'Ada' || u.email !== 'ada@example.com') {
  throw new Error('user.test.js failed');
}

console.log('user.test.js passed');
