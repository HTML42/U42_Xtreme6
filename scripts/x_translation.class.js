class XTranslation {
  static normalizeLanguage(value) {
    const normalized = String(value || '').trim().toLowerCase();

    if (!/^[a-z]{2}$/.test(normalized)) {
      return 'de';
    }

    return normalized;
  }

  static getCurrentLanguage() {
    if (window.XLanguage && typeof window.XLanguage.getCurrentLanguage === 'function') {
      return XTranslation.normalizeLanguage(window.XLanguage.getCurrentLanguage());
    }

    if (typeof window.LANG === 'string' && window.LANG.trim() !== '') {
      return XTranslation.normalizeLanguage(window.LANG);
    }

    return 'de';
  }

  static ensureStore() {
    if (!Array.isArray(window.TRANSLATIONS)) {
      window.TRANSLATIONS = [];
    }

    return window.TRANSLATIONS;
  }

  static ensureLanguageStore(language = null) {
    if (!window.TRANSLATIONS_BY_LANG || typeof window.TRANSLATIONS_BY_LANG !== 'object') {
      window.TRANSLATIONS_BY_LANG = {};
    }

    const lang = XTranslation.normalizeLanguage(language || XTranslation.getCurrentLanguage());

    if (!Array.isArray(window.TRANSLATIONS_BY_LANG[lang])) {
      window.TRANSLATIONS_BY_LANG[lang] = [];
    }

    return window.TRANSLATIONS_BY_LANG[lang];
  }

  static set(key, value) {
    const translationKey = String(key || '').trim();

    if (!translationKey) {
      throw new Error('Translation key is required.');
    }

    const text = String(value ?? '');
    XTranslation.ensureStore()[translationKey] = text;
    XTranslation.ensureLanguageStore()[translationKey] = text;

    return text;
  }

  static get(key) {
    const translationKey = String(key || '').trim();

    if (!translationKey) {
      return '';
    }

    const languageStore = XTranslation.ensureLanguageStore();
    const languageText = languageStore[translationKey];

    if (typeof languageText === 'string') {
      return languageText;
    }

    const fallbackStore = XTranslation.ensureLanguageStore('de');
    const fallbackText = fallbackStore[translationKey];

    if (typeof fallbackText === 'string') {
      return fallbackText;
    }

    const text = XTranslation.ensureStore()[translationKey];
    return typeof text === 'string' ? text : '';
  }

  static t(key, params = {}) {
    const text = XTranslation.get(key);

    if (!text) {
      return String(key || '');
    }

    return text.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (match, variable) => {
      if (Object.prototype.hasOwnProperty.call(params, variable)) {
        return String(params[variable]);
      }

      return '';
    });
  }
}

window.XTranslation = XTranslation;
