class XUser {
  static _CACHE = {};

  static _DATA = {
    1: { id: 1, name: 'Ada Lovelace', email: 'ada@example.com', active: true },
    2: { id: 2, name: 'Grace Hopper', email: 'grace@example.com', active: true },
  };

  constructor(id = 0, name = '', email = '', active = true) {
    this.id = Number(id) || 0;
    this.name = String(name ?? '').trim();
    this.email = String(email ?? '').trim();
    this.active = Boolean(active);

    if (this.id > 0 || this.name !== '' || this.email !== '') {
      this.validate();
    }
  }

  static load(identification = null) {
    if (typeof identification === 'number' || (typeof identification === 'string' && identification.trim() !== '' && !Number.isNaN(Number(identification)))) {
      return XUser.load_by_id(Number(identification));
    }

    if (typeof identification === 'string') {
      return XUser.load_by_name(identification);
    }

    return new XUser();
  }

  static load_by_id(id) {
    if (!Number.isInteger(id) || id < 1) {
      return new XUser();
    }

    const cacheKey = XUser.cache_key('id', String(id));
    if (XUser._CACHE[cacheKey]) {
      return XUser._CACHE[cacheKey];
    }

    const row = XUser._DATA[id];
    if (!row) {
      return new XUser();
    }

    const user = new XUser(row.id, row.name, row.email, row.active);
    XUser._CACHE[cacheKey] = user;
    XUser._CACHE[XUser.cache_key('name', user.name.toLowerCase())] = user;

    return user;
  }

  static load_by_name(name) {
    const normalizedName = String(name ?? '').trim().toLowerCase();
    if (normalizedName === '') {
      return new XUser();
    }

    const cacheKey = XUser.cache_key('name', normalizedName);
    if (XUser._CACHE[cacheKey]) {
      return XUser._CACHE[cacheKey];
    }

    const row = Object.values(XUser._DATA).find((item) => item.name.toLowerCase() === normalizedName);
    if (!row) {
      return new XUser();
    }

    const user = new XUser(row.id, row.name, row.email, row.active);
    XUser._CACHE[cacheKey] = user;
    XUser._CACHE[XUser.cache_key('id', String(user.id))] = user;

    return user;
  }

  static clear_cache() {
    XUser._CACHE = {};
  }

  update({ name, email, active } = {}) {
    if (name !== undefined) {
      this.name = String(name).trim();
    }

    if (email !== undefined) {
      this.email = String(email).trim();
    }

    if (active !== undefined) {
      this.active = Boolean(active);
    }

    this.validate();
    return this;
  }

  toarray() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      active: this.active,
    };
  }

  static cache_key(type, value) {
    return `${type}:${value}`;
  }

  validate() {
    if (!Number.isInteger(this.id) || this.id < 1) {
      throw new Error('id muss > 0 sein');
    }

    if (this.name.length < 2) {
      throw new Error('name muss mindestens 2 zeichen haben');
    }

    if (!this.email.includes('@')) {
      throw new Error('email ist ungültig');
    }
  }
}

globalThis.XUser = XUser;
