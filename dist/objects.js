/* SOURCE: objects/x-user/x_user.class.js */
class XUser {
  static _CACHE = {};

  constructor(id = 0) {
    this.id = Number(id) || 0;
    this.insert_date = 0;
    this.update_date = 0;
    this.delete_date = 0;
  }

  static async load(id = 0) {
    const normalizedId = Number(id) || 0;
    const cacheKey = JSON.stringify({ id: normalizedId });

    if (XUser._CACHE[cacheKey]) {
      return XUser._CACHE[cacheKey];
    }

    const user = new XUser(normalizedId);

    // platzhalter: später durch await api-request ersetzen.
    await Promise.resolve();

    const now = Math.floor(Date.now() / 1000);
    user.insert_date = now;
    user.update_date = now;
    user.delete_date = 0;

    XUser._CACHE[cacheKey] = user;
    return user;
  }

  static clear_cache() {
    XUser._CACHE = {};
  }
}

globalThis.XUser = XUser;

/* SOURCE: objects/x-users/x_users.class.js */
class XUsers {
  static _CACHE = {};

  constructor(id = 0) {
    this.id = Number(id) || 0;
    this.insert_date = 0;
    this.update_date = 0;
    this.delete_date = 0;
  }

  static async load(id = 0) {
    const normalizedId = Number(id) || 0;
    const cacheKey = JSON.stringify({ load: normalizedId });

    if (XUsers._CACHE[cacheKey]) {
      return XUsers._CACHE[cacheKey];
    }

    // platzhalter: später query/list request gegen api.
    await Promise.resolve();

    const list = [];
    if (normalizedId > 0) {
      list.push(await globalThis.XUser.load(normalizedId));
    }

    XUsers._CACHE[cacheKey] = list;
    return list;
  }

  static clear_cache() {
    XUsers._CACHE = {};
  }
}

globalThis.XUsers = XUsers;
