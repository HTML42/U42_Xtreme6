class XLanguage {
  static getDefaultLanguage() {
    const config = XLanguage.loadConfig();
    return XLanguage.normalizeLanguage(config.Language || 'de');
  }

  static normalizeLanguage(value) {
    const normalized = String(value || '').trim().toLowerCase();

    if (!/^[a-z]{2}$/.test(normalized)) {
      return 'de';
    }

    return normalized;
  }

  static getAvailableLanguages() {
    const config = XLanguage.loadConfig();
    const languages = Array.isArray(config.AvailableLanguages) ? config.AvailableLanguages : [XLanguage.getDefaultLanguage()];
    return [...new Set(languages.map((lang) => XLanguage.normalizeLanguage(lang)))];
  }

  static getFallbackLanguage() {
    const config = XLanguage.loadConfig();
    return XLanguage.normalizeLanguage(config.FallbackLanguage || XLanguage.getDefaultLanguage());
  }

  static getUrlLanguage() {
    const params = new URLSearchParams(window.location.search || '');
    const lang = params.get('lang');
    return lang ? XLanguage.normalizeLanguage(lang) : null;
  }

  static getStoredLanguage() {
    try {
      return window.localStorage ? XLanguage.normalizeLanguage(window.localStorage.getItem('x6.language')) : null;
    } catch (error) {
      return null;
    }
  }

  static storeLanguage(language) {
    try {
      if (window.localStorage) {
        window.localStorage.setItem('x6.language', XLanguage.normalizeLanguage(language));
      }
    } catch (error) {
      // localStorage may be unavailable; language still works for current runtime.
    }
  }

  static setCurrentLanguage(language) {
    window.LANG = XLanguage.normalizeLanguage(language);
    XLanguage.storeLanguage(window.LANG);

    if (document && document.documentElement) {
      document.documentElement.setAttribute('lang', window.LANG);
    }

    window.dispatchEvent(new CustomEvent('x6:language', { detail: { language: window.LANG } }));

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
    const language = XLanguage.getUrlLanguage()
      || XLanguage.getStoredLanguage()
      || config.Language
      || XLanguage.getDefaultLanguage();

    return XLanguage.setCurrentLanguage(language);
  }
}

window.XLanguage = XLanguage;
window.LANG = XLanguage.getCurrentLanguage();
