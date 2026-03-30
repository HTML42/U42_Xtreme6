/* SOURCE: scripts\controllers\Index.Controller.js */
class IndexController {
  constructor() {
    this.name = 'IndexController';
    this.route = null;
  }

  index(route) {
    this.route = route;
    console.log('IndexController.index', route);
  }

  view(route) {
    this.route = route;
    console.log('IndexController.view', route);
  }
}

window.IndexController = IndexController;

/* SOURCE: scripts\projects.js */
window.X6 = window.X6 || {};

const init = async () => {
  await XFramework.bootstrap({
    defaultController: 'index',
    defaultView: 'index',
    userClass: 'User'
  });
};

const appReady = () => {
  const hasFrameworkClass = typeof window.XFramework === 'function' || typeof window.X_Framework === 'function';

  if (!hasFrameworkClass) {
    window.setTimeout(appReady, 1);
    return;
  }

  if (!XFramework.Ready) {
    window.setTimeout(appReady, 1);
    return;
  }

  void init();
};

appReady();

/* SOURCE: scripts\user.class.js */
class User extends XUser {
  static _CACHE = {};

  static async load(id = 0) {
    const normalizedId = Number(id) || 0;
    const cacheKey = JSON.stringify({ id: normalizedId });

    if (User._CACHE[cacheKey]) {
      return User._CACHE[cacheKey];
    }

    const base = await super.load(normalizedId);
    const user = new User(base.id || normalizedId);

    Object.assign(user, base);
    user.login = user.login === true;

    User._CACHE[cacheKey] = user;
    return user;
  }

  static clear_cache() {
    User._CACHE = {};
    if (typeof XUser.clear_cache === 'function') {
      XUser.clear_cache();
    }
  }
}

window.User = User;

/* SOURCE: scripts\x_framework.class.js */
class XFramework {
  static sleep(delayMs) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, delayMs);
    });
  }

  static getControllerClassName(controllerName) {
    const normalized = String(controllerName || 'index').trim().toLowerCase();

    if (!normalized) {
      return 'IndexController';
    }

    return normalized.charAt(0).toUpperCase() + normalized.slice(1) + 'Controller';
  }


  static get Ready() {
    const hasTemplateClass = typeof window.XTemplate === 'function' || typeof window.X_Template === 'function';
    const hasTranslationClass = typeof window.XTranslation === 'function' || typeof window.X_Translation === 'function';
    const hasTemplates = Array.isArray(window.Templates) || Array.isArray(window.TEMPLATES);
    const hasTranslations = Array.isArray(window.Translations) || Array.isArray(window.TRANSLATIONS);

    return hasTemplateClass && hasTranslationClass && hasTemplates && hasTranslations;
  }

  static async waitForBootReadiness(options = {}) {
    const timeoutMs = Number(options.timeoutMs || 4000);
    const intervalMs = Number(options.intervalMs || 40);
    const controllerClassName = XFramework.getControllerClassName(options.defaultController);
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const hasCore = typeof window.XFramework === 'function'
        && typeof window.XRouter === 'function'
        && typeof window.XLanguage === 'function'
        && typeof window.XTemplate === 'function'
        && typeof window.XTranslation === 'function';
      const hasController = typeof window[controllerClassName] === 'function';

      if (hasCore && hasController) {
        return true;
      }

      await XFramework.sleep(intervalMs);
    }

    return false;
  }

  static ensureRuntimeState(options = {}) {
    window.X6 = window.X6 || {};
    window.X6.options = window.X6.options || {};

    if (typeof window.X6.options.sidebar !== 'boolean') {
      window.X6.options.sidebar = false;
    }

    if (typeof window.X6.options.login !== 'boolean') {
      window.X6.options.login = false;
    }

    if (typeof window.X6.options.userClass !== 'string' || window.X6.options.userClass.trim() === '') {
      window.X6.options.userClass = 'User';
    }

    if (!options || typeof options !== 'object') {
      return;
    }

    if (Object.prototype.hasOwnProperty.call(options, 'sidebar')) {
      window.X6.options.sidebar = options.sidebar === true;
    }

    if (Object.prototype.hasOwnProperty.call(options, 'login')) {
      window.X6.options.login = options.login === true;
    }

    if (Object.prototype.hasOwnProperty.call(options, 'userClass')) {
      const normalizedUserClass = String(options.userClass || '').trim();
      window.X6.options.userClass = normalizedUserClass || 'User';
    }
  }

  static resolveUserClass(options = {}) {
    const preferredByOption = String(options.userClass || '').trim();
    const preferredByRuntime = String(window.X6?.options?.userClass || '').trim();
    const preferredClassName = preferredByOption || preferredByRuntime || 'User';

    if (typeof window[preferredClassName] === 'function') {
      return window[preferredClassName];
    }

    if (typeof window.User === 'function') {
      return window.User;
    }

    if (typeof window.XUser === 'function') {
      return window.XUser;
    }

    return null;
  }

  static async initCurrentUser(options = {}) {
    if (window.ME && typeof window.ME === 'object') {
      if (typeof window.ME.login !== 'boolean') {
        window.ME.login = !!window.ME.login;
      }

      return window.ME;
    }

    const UserClass = XFramework.resolveUserClass(options);
    const meId = Number(options.meId || 0) || 0;
    let me = null;

    if (UserClass && typeof UserClass.load === 'function') {
      me = await UserClass.load(meId);
    }

    if (!me && UserClass) {
      me = new UserClass(meId);
    }

    if (!me || typeof me !== 'object') {
      me = { id: meId };
    }

    if (typeof me.login !== 'boolean') {
      me.login = (Number(me.id || 0) > 0);
    }

    window.ME = me;

    if (window.X6 && window.X6.options) {
      window.X6.options.login = me.login === true;
      window.X6.options.userClass = UserClass && UserClass.name ? UserClass.name : window.X6.options.userClass;
    }

    return me;
  }

  static async bootstrap(options = {}) {
    const defaultController = options.defaultController || 'index';
    const defaultView = options.defaultView || 'index';

    XFramework.ensureRuntimeState(options);
    await XFramework.initCurrentUser(options);

    const ready = await XFramework.waitForBootReadiness({
      timeoutMs: options.timeoutMs,
      intervalMs: options.intervalMs,
      defaultController
    });

    if (!ready) {
      console.warn('X6 startup timeout: framework classes are not fully loaded.');
    }

    await XLanguage.init();

    window.X6.framework = new XFramework({
      defaultController,
      defaultView
    });

    window.X6.router = new XRouter({
      defaultController,
      defaultView,
      autoInit: false
    });

    window.X6.framework.attachRouter(window.X6.router);

    window.setTimeout(() => {
      window.X6.router.init();
    }, 0);
  }

  constructor(options = {}) {
    this.defaultController = options.defaultController || 'index';
    this.defaultView = options.defaultView || 'index';
    this.currentRoute = this.getEmptyRoute();
    this.router = null;

    this.handleRoute = this.handleRoute.bind(this);
    window.addEventListener('x6:route', this.handleRoute);

    this.renderBaseLayout();
  }

  attachRouter(router) {
    this.router = router;
  }

  destroy() {
    window.removeEventListener('x6:route', this.handleRoute);
  }

  handleRoute(event) {
    if (!event || !event.detail) {
      return;
    }

    this.renderRoute(event.detail);
  }

  getEmptyRoute() {
    return {
      controller: this.defaultController,
      view: this.defaultView,
      action: null,
      id: null,
      params: {},
      segments: []
    };
  }

  renderBaseLayout() {
    this.applyLoginStateToBody();

    const bodyTemplate = XTemplate.get('body');

    if (bodyTemplate) {
      const existingRoot = document.getElementById('App');

      if (existingRoot) {
        existingRoot.outerHTML = bodyTemplate;
      } else {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = bodyTemplate;

        const nextRoot = wrapper.firstElementChild;

        if (nextRoot) {
          document.body.replaceChildren(nextRoot);
        }
      }
    } else {
      const root = this.ensureAppRoot();
      root.innerHTML = [
        '<header id="page_header"></header>',
        '<main id="page_main">',
        '<article id="page_article"></article>',
        '<aside id="page_aside"></aside>',
        '</main>',
        '<footer id="page_footer"></footer>'
      ].join('');
    }

    this.renderShellPart('page_header', 'header', {
      app_name: XTranslation.t('app.name'),
      menu_home: XTranslation.t('menu.home'),
      menu_profile: XTranslation.t('menu.profile'),
      menu_wallets: XTranslation.t('menu.wallets'),
      menu_deposit: XTranslation.t('menu.deposit'),
      menu_withdraw: XTranslation.t('menu.withdraw'),
      menu_plans: XTranslation.t('menu.plans'),
      menu_admin: XTranslation.t('menu.admin'),
      menu_logout: XTranslation.t('menu.logout'),
      menu_login: XTranslation.t('menu.login'),
      menu_registration: XTranslation.t('menu.registration'),
      menu_imprint: XTranslation.t('menu.imprint'),
      menu_privacy: XTranslation.t('menu.privacy')
    });

    if (window.X6 && window.X6.options && window.X6.options.sidebar === true) {
      this.renderShellPart('page_aside', 'sidebar', {
        sidebar_title: XTranslation.t('ui.sidebar.title'),
        menu_home: XTranslation.t('menu.home'),
        menu_support: XTranslation.t('menu.support'),
        menu_contact: XTranslation.t('menu.contact')
      });
    }

    this.renderShellPart('page_footer', 'footer', {
      footer_text: XTranslation.t('ui.footer.text')
    });
  }

  isLoggedIn() {
    if (window.ME && typeof window.ME === 'object' && typeof window.ME.login === 'boolean') {
      return window.ME.login === true;
    }

    return !!(window.X6 && window.X6.options && window.X6.options.login === true);
  }

  applyLoginStateToBody() {
    if (!document || !document.body) {
      return;
    }

    document.body.setAttribute('data-login', this.isLoggedIn() ? 'true' : 'false');
  }

  setLoginState(isLoggedIn) {
    window.X6 = window.X6 || {};
    window.X6.options = window.X6.options || {};
    window.X6.options.login = isLoggedIn === true;

    if (!window.ME || typeof window.ME !== 'object') {
      window.ME = { id: 0, login: false };
    }

    window.ME.login = isLoggedIn === true;

    this.applyLoginStateToBody();
  }

  setCurrentUser(user) {
    if (!user || typeof user !== 'object') {
      return;
    }

    window.ME = user;

    if (typeof window.ME.login !== 'boolean') {
      window.ME.login = !!window.ME.login;
    }

    this.applyLoginStateToBody();
  }

  ensureAppRoot() {
    let root = document.getElementById('App');

    if (!root) {
      root = document.createElement('div');
      root.id = 'App';
      document.body.appendChild(root);
    }

    return root;
  }

  renderShellPart(targetId, templateName, params = {}) {
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    const markup = XTemplate.render(templateName, params);

    if (markup) {
      target.outerHTML = markup;
    }
  }

  renderRoute(route) {
    this.currentRoute = route;

    this.renderRouteTemplate(route);

    const controllerClassName = `${this.capitalize(route.controller)}Controller`;
    const controllerClass = window[controllerClassName];

    if (typeof controllerClass !== 'function') {
      console.warn(`Controller not found: ${controllerClassName}`);
      return;
    }

    const controller = new controllerClass();
    controller.route = route;

    const viewMethod = this.resolveViewMethod(controller, route.view);

    if (!viewMethod) {
      console.warn(`View method not found: ${route.view} in ${controllerClassName}`);
      return;
    }

    controller[viewMethod](route);
  }

  renderRouteTemplate(route) {
    const article = document.getElementById('page_article');

    if (!article) {
      return;
    }

    const templateName = `view.${route.controller}.${route.view}`;
    const markup = XTemplate.render(templateName, {
      caption: XTranslation.t(`captions.${route.controller}.${route.view}`),
      intro: XTranslation.t(`ui.view.${route.view}.intro`)
    });

    if (markup) {
      article.innerHTML = markup;
    }
  }

  resolveViewMethod(controller, viewName) {
    if (typeof controller[viewName] === 'function') {
      return viewName;
    }

    const normalized = String(viewName).toLowerCase();
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(controller));

    for (let i = 0; i < methods.length; i += 1) {
      const method = methods[i];

      if (method.toLowerCase() === normalized && typeof controller[method] === 'function') {
        return method;
      }
    }

    return null;
  }

  capitalize(value) {
    const stringValue = String(value || '');

    if (!stringValue) {
      return '';
    }

    return stringValue.charAt(0).toUpperCase() + stringValue.slice(1);
  }
}

window.XFramework = XFramework;

/* SOURCE: scripts\x_language.class.js */
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

/* SOURCE: scripts\x_router.class.js */
class XRouter {
  constructor(options = {}) {
    this.defaultController = options.defaultController || 'index';
    this.defaultView = options.defaultView || 'index';
    this.eventName = options.eventName || 'x6:route';
    this.onRoute = typeof options.onRoute === 'function' ? options.onRoute : null;

    this.route = this.getEmptyRoute();
    this.handleLocationChange = this.handleLocationChange.bind(this);

    if (options.autoInit !== false) {
      this.init();
    }
  }

  getEmptyRoute() {
    return {
      controller: this.defaultController,
      view: this.defaultView,
      action: null,
      id: null,
      params: {},
      segments: []
    };
  }

  init() {
    this.destroy();
    window.addEventListener('hashchange', this.handleLocationChange);
    this.handleLocationChange();
  }

  destroy() {
    window.removeEventListener('hashchange', this.handleLocationChange);
  }

  handleLocationChange() {
    if (!window.location.hash) {
      window.location.hash = `!/${this.defaultController}/${this.defaultView}`;
      return;
    }

    this.route = this.parse(window.location.hash);
    this.emitRoute(this.route);

    if (this.onRoute) {
      this.onRoute(this.route);
    }
  }

  emitRoute(route) {
    window.dispatchEvent(new CustomEvent(this.eventName, {
      detail: route
    }));
  }

  parse(hash) {
    const normalized = this.normalizeHash(hash);
    const segments = normalized
      .split('/')
      .map((segment) => decodeURIComponent(segment.trim()))
      .filter(Boolean);

    const controller = (segments[0] || this.defaultController).toLowerCase();
    const view = (segments[1] || this.defaultView).toLowerCase();
    const tail = segments.slice(2);

    let action = null;
    let id = null;
    const params = {};

    if (tail.length > 0) {
      if (this.isNumeric(tail[0])) {
        id = Number(tail[0]);
      } else if (tail.length % 2 === 1) {
        action = tail.shift().toLowerCase();
      }

      while (tail.length > 1) {
        const key = tail.shift();
        const value = tail.shift();

        params[key] = value;
      }
    }

    return {
      controller,
      view,
      action,
      id,
      params,
      segments
    };
  }

  normalizeHash(hash) {
    if (!hash) {
      return '';
    }

    return hash
      .replace(/^#!/, '')
      .replace(/^#/, '')
      .replace(/^\//, '');
  }

  isNumeric(value) {
    return /^\d+$/.test(String(value));
  }
}

window.XRouter = XRouter;

/* SOURCE: scripts\x_template.class.js */
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

/* SOURCE: scripts\x_translation.class.js */
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
