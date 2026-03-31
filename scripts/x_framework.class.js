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

    this.renderConfiguredShellParts();
  }

  renderConfiguredShellParts() {
    this.getShellPartConfigs().forEach((config) => {
      if (typeof config.when === 'function' && config.when() !== true) {
        return;
      }

      this.renderShellPart(config.targetId, config.templateName, this.translateMap(config.translationMap));
    });
  }

  getShellPartConfigs() {
    return [
      {
        targetId: 'page_header',
        templateName: 'header',
        translationMap: {
          app_name: 'app.name',
          menu_home: 'menu.home',
          menu_profile: 'menu.profile',
          menu_wallets: 'menu.wallets',
          menu_deposit: 'menu.deposit',
          menu_withdraw: 'menu.withdraw',
          menu_plans: 'menu.plans',
          menu_admin: 'menu.admin',
          menu_logout: 'menu.logout',
          menu_login: 'menu.login',
          menu_registration: 'menu.registration',
          menu_imprint: 'menu.imprint',
          menu_privacy: 'menu.privacy'
        }
      },
      {
        targetId: 'page_aside',
        templateName: 'sidebar',
        when: () => !!(window.X6 && window.X6.options && window.X6.options.sidebar === true),
        translationMap: {
          sidebar_title: 'ui.sidebar.title',
          menu_home: 'menu.home',
          menu_support: 'menu.support',
          menu_contact: 'menu.contact'
        }
      },
      {
        targetId: 'page_footer',
        templateName: 'footer',
        translationMap: {
          footer_text: 'ui.footer.text'
        }
      }
    ];
  }

  translateMap(translationMap = {}) {
    return Object.entries(translationMap).reduce((acc, [paramName, key]) => {
      acc[paramName] = XTranslation.t(key);

      return acc;
    }, {});
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
