class User extends XUser {
  static _CACHE = {};

  static async load(id = 0) {
    const normalizedId = Number(id) || 0;
    const cacheKey = JSON.stringify({ id: normalizedId });

    if (User._CACHE[cacheKey]) {
      return User._CACHE[cacheKey];
    }

    const base = await super.load(normalizedId);
    const user = new User(base.id || normalizedId);

    Object.assign(user, base);
    user.login = user.login === true;

    User._CACHE[cacheKey] = user;
    return user;
  }

  static clear_cache() {
    User._CACHE = {};
    if (typeof XUser.clear_cache === 'function') {
      XUser.clear_cache();
    }
  }
}

window.User = User;
