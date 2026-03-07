class XTemplate {
  static ensureStore() {
    if (!Array.isArray(window.TEMPLATES)) {
      window.TEMPLATES = [];
    }

    return window.TEMPLATES;
  }

  static set(name, templateString) {
    const key = String(name || '').trim();

    if (!key) {
      throw new Error('Template name is required.');
    }

    const template = String(templateString ?? '');
    XTemplate.ensureStore()[key] = template;

    return template;
  }

  static get(name) {
    const key = String(name || '').trim();

    if (!key) {
      return '';
    }

    const template = XTemplate.ensureStore()[key];
    return typeof template === 'string' ? template : '';
  }

  static render(name, params = {}) {
    const template = XTemplate.get(name);

    if (!template) {
      return '';
    }

    return template.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (match, key) => {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        return String(params[key]);
      }

      return '';
    });
  }
}

window.XTemplate = XTemplate;
