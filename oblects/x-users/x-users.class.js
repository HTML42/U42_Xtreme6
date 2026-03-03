class XUsers {
  static _CACHE = {};

  static list(params = {}) {
    const normalized = XUsers.normalize_params(params);
    const cacheKey = XUsers.cache_key('list', normalized);

    if (XUsers._CACHE[cacheKey]) {
      return XUsers._CACHE[cacheKey].map((id) => globalThis.XUser.load_by_id(id));
    }

    let users = [globalThis.XUser.load_by_id(1), globalThis.XUser.load_by_id(2)];

    if (normalized.active !== undefined) {
      const active = Boolean(normalized.active);
      users = users.filter((user) => user.active === active);
    }

    if (normalized.sort === 'name_asc') {
      users.sort((a, b) => a.name.localeCompare(b.name));
    }

    XUsers._CACHE[cacheKey] = users.map((user) => user.id);
    return users;
  }

  static clear_cache() {
    XUsers._CACHE = {};
  }

  static cache_key(method, params) {
    return `${method}:${JSON.stringify(params)}`;
  }

  static normalize_params(params) {
    const target = {};

    Object.keys(params)
      .sort()
      .forEach((key) => {
        const value = params[key];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          target[key] = XUsers.normalize_params(value);
        } else {
          target[key] = value;
        }
      });

    return target;
  }
}

globalThis.XUsers = XUsers;
