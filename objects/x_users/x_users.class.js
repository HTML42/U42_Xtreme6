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

    // Placeholder: replace with a query/list API request later.
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
