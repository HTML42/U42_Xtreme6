class XUser {
  static _CACHE = {};

  constructor(id = 0) {
    this.id = Number(id) || 0;
    this.login = false;
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

    // Placeholder: replace with an awaited API request later.
    await Promise.resolve();

    const now = Math.floor(Date.now() / 1000);
    user.login = normalizedId > 0;
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
