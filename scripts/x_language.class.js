class XLanguage {
  static getDefaultLanguage() {
    return 'DE';
  }

  static normalizeLanguage(value) {
    const normalized = String(value || '').trim().toUpperCase();

    if (!/^[A-Z]{2}$/.test(normalized)) {
      return XLanguage.getDefaultLanguage();
    }

    return normalized;
  }

  static setCurrentLanguage(language) {
    window.LANG = XLanguage.normalizeLanguage(language);

    if (document && document.documentElement) {
      document.documentElement.setAttribute('lang', window.LANG.toLowerCase());
    }

    return window.LANG;
  }

  static getCurrentLanguage() {
    if (typeof window.LANG === 'string' && window.LANG.trim() !== '') {
      return XLanguage.normalizeLanguage(window.LANG);
    }

    return XLanguage.getDefaultLanguage();
  }

  static loadConfig() {
    if (window && window.X6_CONFIG && typeof window.X6_CONFIG === 'object') {
      return window.X6_CONFIG;
    }

    return {};
  }

  static init() {
    const config = XLanguage.loadConfig();
    const language = config.Language || XLanguage.getDefaultLanguage();

    return XLanguage.setCurrentLanguage(language);
  }
}

window.XLanguage = XLanguage;
window.LANG = XLanguage.getCurrentLanguage();
