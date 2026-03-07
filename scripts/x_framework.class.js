class XFramework {
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
    const bodyTemplate = XTemplate.get('body');

    if (bodyTemplate) {
      const existingRoot = document.getElementById('App');

      if (existingRoot) {
        existingRoot.outerHTML = bodyTemplate;
      } else {
        document.body.insertAdjacentHTML('beforeend', bodyTemplate);
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

    this.renderShellPart('page_aside', 'sidebar', {
      sidebar_title: XTranslation.t('ui.sidebar.title'),
      menu_home: XTranslation.t('menu.home'),
      menu_support: XTranslation.t('menu.support'),
      menu_contact: XTranslation.t('menu.contact')
    });

    this.renderShellPart('page_footer', 'footer', {
      footer_text: XTranslation.t('ui.footer.text', {
        year: new Date().getFullYear(),
        app: XTranslation.t('app.name'),
        rights: 'All rights reserved'
      }),
      footer_domain: XTranslation.t('ui.footer.domain', {
        domain: XTranslation.t('app.domain')
      })
    });
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
