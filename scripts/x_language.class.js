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

  static async loadConfig() {
    const candidates = ['../config.json', '/config.json', './config.json'];

    for (let i = 0; i < candidates.length; i += 1) {
      const path = candidates[i];

      try {
        const response = await fetch(path, { cache: 'no-store' });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();

        if (data && typeof data === 'object') {
          return data;
        }
      } catch (_error) {
        // Ignore and continue with next candidate.
      }
    }

    return {};
  }

  static async init() {
    const config = await XLanguage.loadConfig();
    const language = config.Language || XLanguage.getDefaultLanguage();

    return XLanguage.setCurrentLanguage(language);
  }
}

window.XLanguage = XLanguage;
window.LANG = XLanguage.getCurrentLanguage();
