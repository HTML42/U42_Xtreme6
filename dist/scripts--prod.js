/* SOURCE: scripts\controllers\index.controller.js */
class IndexController {
  constructor() {
    this.name = 'IndexController';
    this.route = null;
  }

  index(route) {
    this.route = route;
    console.log('IndexController.index', route);
  }

  imprint(route) {
    this.route = route;
    console.log('IndexController.imprint', route);
  }

  privacy(route) {
    this.route = route;
    console.log('IndexController.privacy', route);
  }
}

window.IndexController = IndexController;

/* SOURCE: scripts\controllers\users.controller.js */
class UsersController {
  constructor() {
    this.name = 'UsersController';
    this.route = null;
  }

  login(route) {
    this.route = route;
    this.renderUserView('view.users.login', route, {
      FormLogin: XTemplate.render('form.login', this.getFormTranslations())
    });

    this.bindForm('login_form', 'users/login', (result) => {
      if (result.success && result.response && window.X6 && window.X6.framework) {
        window.X6.framework.setCurrentUser(Object.assign({ login: true }, result.response));
        window.X6.framework.renderConfiguredShellParts();
      }
    }, {
      successKey: 'forms.callbacks.login_success',
      successFallback: 'Du bist erfolgreich angemeldet.',
      failKey: 'forms.callbacks.login_fail',
      failFallback: 'Anmeldung fehlgeschlagen. Bitte prüfe deine Eingaben.',
      clearOnSuccess: false,
      clearPasswordFields: true
    });
  }

  registration(route) {
    this.route = route;
    this.renderUserView('view.users.registration', route);
    this.bindForm('registration_form', 'users/registration', null, {
      successKey: 'forms.callbacks.registration_success',
      successFallback: 'Deine Registrierung war erfolgreich.',
      failKey: 'forms.callbacks.registration_fail',
      failFallback: 'Registrierung fehlgeschlagen. Bitte prüfe deine Eingaben.',
      clearOnSuccess: true,
      clearPasswordFields: true
    });
  }

  t(key, fallback = '') {
    if (window.XTranslation && typeof window.XTranslation.t === 'function') {
      const translated = window.XTranslation.t(key);
      if (translated && translated !== key) {
        return translated;
      }
    }

    return fallback || key;
  }

  getFormTranslations() {
    return {
      label_username: this.t('forms.labels.username', 'Benutzername'),
      label_email: this.t('forms.labels.email', 'E-Mail'),
      label_password: this.t('forms.labels.password', 'Passwort'),
      label_password2: this.t('forms.labels.password2', 'Passwort erneut'),
      action_login: this.t('forms.labels.login', 'Anmelden'),
      action_registration: this.t('menu.registration', 'Registrierung')
    };
  }

  getViewTranslations(route) {
    const controller = route && route.controller ? route.controller : 'users';
    const view = route && route.view ? route.view : 'login';

    return Object.assign({
      caption: this.t(`captions.${controller}.${view}`, view),
      intro: this.t(`ui.view.${view}.intro`, '')
    }, this.getFormTranslations());
  }

  renderUserView(templateName, route, params = {}) {
    const article = document.getElementById('page_article');
    if (!article || !window.XTemplate || typeof window.XTemplate.render !== 'function') {
      return;
    }

    const markup = XTemplate.render(templateName, Object.assign(
      this.getViewTranslations(route),
      params
    ));

    if (markup) {
      article.innerHTML = markup;
    }
  }

  setFormStatus(form, message = '', type = 'info') {
    const status = form ? form.querySelector('.x_form_status') : null;
    if (!status) {
      return;
    }

    status.textContent = message;
    status.setAttribute('data-type', String(type || 'info'));
    status.hidden = String(message || '').trim() === '';
  }

  clearFormFields(form, options = {}) {
    if (!form || typeof form.querySelectorAll !== 'function') {
      return;
    }

    const clearAll = options.clearAll === true;
    const clearPasswordFields = options.clearPasswordFields !== false;

    form.querySelectorAll('input, textarea, select').forEach((field) => {
      const type = String(field.getAttribute('type') || field.type || '').toLowerCase();
      const shouldClear = clearAll || (clearPasswordFields && type === 'password');

      if (!shouldClear) {
        return;
      }

      if (type === 'checkbox' || type === 'radio') {
        field.checked = false;
        return;
      }

      field.value = '';
    });
  }

  bindForm(formId, apiPath, onSuccess = null, options = {}) {
    const form = document.getElementById(formId);
    if (!form || form.dataset.x6Bound === 'true') {
      return;
    }

    if (!window.XApi || typeof window.XApi.submitForm !== 'function') {
      this.setFormStatus(form, 'XApi is not available.', 'error');
      return;
    }

    form.dataset.x6Bound = 'true';
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      this.setFormStatus(form, this.t('forms.callbacks.loading', 'Bitte warten...'), 'loading');

      let result;
      try {
        result = await XApi.submitForm(form, {
          path: apiPath,
          method: 'POST'
        });
      } catch (error) {
        result = {
          success: false,
          status: 500,
          response: null,
          errors: {
            request: error && error.message ? error.message : 'API request failed'
          }
        };

        if (window.XApi && typeof window.XApi.setFormState === 'function') {
          window.XApi.setFormState(form, 'error');
        }

        if (window.XApi && typeof window.XApi.renderFormErrors === 'function') {
          window.XApi.renderFormErrors(form, result.errors);
        }
      }

      if (result.success && typeof onSuccess === 'function') {
        onSuccess(result);
      }

      if (result.success && options.clearOnSuccess === true) {
        this.clearFormFields(form, { clearAll: true });
      } else if (options.clearPasswordFields !== false) {
        this.clearFormFields(form, { clearPasswordFields: true });
      }

      this.setFormStatus(
        form,
        result.success
          ? this.t(options.successKey || 'forms.callbacks.success', options.successFallback || 'Formular erfolgreich gesendet!')
          : this.t(options.failKey || 'forms.callbacks.fail', options.failFallback || 'Formular konnte nicht gesendet werden.'),
        result.success ? 'success' : 'error'
      );
    });
  }
}

window.UsersController = UsersController;

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

/* SOURCE: scripts\x_api.class.js */
class XApi {
  static _MOCKS = [];

  static getApiMode() {
    const config = window.X6_CONFIG && typeof window.X6_CONFIG === 'object' ? window.X6_CONFIG : {};
    return String(config.ApiMode || 'live').toLowerCase() === 'sandbox' ? 'sandbox' : 'live';
  }

  static isSandbox() {
    return XApi.getApiMode() === 'sandbox';
  }

  static registerMock(path, handlerOrPayload, options = {}) {
    XApi._MOCKS.push({
      path: path instanceof RegExp ? path : XApi.normalizePath(path),
      handlerOrPayload,
      delay: Number(options.delay || 0),
      method: options.method ? String(options.method).toUpperCase() : null
    });
  }

  static clearMocks() {
    XApi._MOCKS = [];
  }

  static findMock(path, method = 'GET') {
    const normalizedPath = XApi.normalizePath(path);
    const normalizedMethod = String(method || 'GET').toUpperCase();

    return XApi._MOCKS.find((mock) => {
      if (mock.method && mock.method !== normalizedMethod) {
        return false;
      }

      if (mock.path instanceof RegExp) {
        return mock.path.test(normalizedPath);
      }

      return mock.path === normalizedPath;
    }) || null;
  }

  static sleep(delayMs = 0) {
    return new Promise((resolve) => window.setTimeout(resolve, Math.max(0, Number(delayMs || 0))));
  }

  static async runMock(mock, context = {}) {
    if (!mock) {
      return XApi.normalizePayload({
        success: false,
        status: 404,
        response: null,
        errors: { mock: 'mock not found' }
      });
    }

    if (mock.delay > 0) {
      await XApi.sleep(mock.delay);
    }

    const payload = typeof mock.handlerOrPayload === 'function'
      ? await mock.handlerOrPayload(context)
      : mock.handlerOrPayload;

    return XApi.normalizePayload(payload);
  }

  static normalizePath(path = '') {
    const normalized = String(path || '').trim().replace(/^\/+|\/+$/g, '');
    return normalized;
  }

  static toQueryString(query = {}) {
    const params = new URLSearchParams();

    Object.entries(query || {}).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }

      if (value !== null && typeof value === 'object') {
        params.set(key, JSON.stringify(value));
        return;
      }

      params.set(key, String(value));
    });

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  static normalizePayload(payload) {
    const base = {
      success: false,
      status: 200,
      response: null,
      errors: {}
    };

    if (!payload || typeof payload !== 'object') {
      return base;
    }

    return {
      success: payload.success === true,
      status: Number(payload.status || 200),
      response: Object.prototype.hasOwnProperty.call(payload, 'response') ? payload.response : null,
      errors: XApi.normalizeErrors(payload.errors)
    };
  }

  static normalizeErrors(errors) {
    if (Array.isArray(errors)) {
      return errors;
    }

    if (errors && typeof errors === 'object') {
      return errors;
    }

    if (typeof errors === 'string' && errors.trim() !== '') {
      return [errors.trim()];
    }

    return {};
  }

  static isFormData(value) {
    return typeof FormData !== 'undefined' && value instanceof FormData;
  }

  static formDataToObject(formData) {
    const result = {};
    if (!XApi.isFormData(formData)) {
      return result;
    }

    for (const [key, value] of formData.entries()) {
      if (Object.prototype.hasOwnProperty.call(result, key)) {
        if (!Array.isArray(result[key])) {
          result[key] = [result[key]];
        }
        result[key].push(value);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  static getErrorMessages(errors) {
    const normalized = XApi.normalizeErrors(errors);

    if (Array.isArray(normalized)) {
      return normalized.map((message) => String(message || '').trim()).filter(Boolean);
    }

    return Object.values(normalized)
      .flat()
      .map((message) => String(message || '').trim())
      .filter(Boolean);
  }

  static cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
      return window.CSS.escape(value);
    }

    return String(value || '').replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  static clearFormErrors(formElement) {
    if (!formElement || typeof formElement.querySelectorAll !== 'function') {
      return;
    }

    formElement.querySelectorAll('.x_form_error_summary, .x_form_input_error').forEach((node) => node.remove());
    formElement.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    });
  }

  static setFormState(formElement, state = 'idle') {
    if (!formElement || typeof formElement.setAttribute !== 'function') {
      return;
    }

    const normalizedState = String(state || 'idle').toLowerCase();
    formElement.setAttribute('data-state', normalizedState);

    const disabled = normalizedState === 'loading' || normalizedState === 'disabled';
    formElement.querySelectorAll('input, textarea, select, button').forEach((field) => {
      field.disabled = disabled;
    });
  }

  static renderFormErrors(formElement, errors = {}) {
    if (!formElement || typeof formElement.querySelector !== 'function') {
      return;
    }

    XApi.clearFormErrors(formElement);

    const normalized = XApi.normalizeErrors(errors);
    const messages = XApi.getErrorMessages(normalized);
    if (messages.length < 1) {
      return;
    }

    const summary = document.createElement('div');
    summary.className = 'x_form_error_summary';
    summary.setAttribute('role', 'alert');

    const list = document.createElement('ul');
    messages.forEach((message) => {
      const item = document.createElement('li');
      item.textContent = message;
      list.appendChild(item);
    });
    summary.appendChild(list);

    const submit = formElement.querySelector('[type="submit"]');
    if (submit && submit.parentNode) {
      submit.parentNode.insertBefore(summary, submit);
    } else {
      formElement.appendChild(summary);
    }

    if (!Array.isArray(normalized) && normalized && typeof normalized === 'object') {
      Object.entries(normalized).forEach(([fieldName, fieldErrors]) => {
        const field = formElement.querySelector(`[name="${XApi.cssEscape(fieldName)}"]`);
        if (!field) {
          return;
        }

        const errorText = Array.isArray(fieldErrors) ? fieldErrors.join(' ') : String(fieldErrors || '');
        if (errorText.trim() === '') {
          return;
        }

        const errorId = `${formElement.id || 'x_form'}_${fieldName}_error`;
        const errorNode = document.createElement('div');
        errorNode.id = errorId;
        errorNode.className = 'x_form_input_error';
        errorNode.textContent = errorText;

        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', errorId);
        field.insertAdjacentElement('afterend', errorNode);
      });
    }
  }

  static async request(path, options = {}) {
    const method = String(options.method || 'GET').toUpperCase();
    const headers = Object.assign({}, options.headers || {});
    const queryString = XApi.toQueryString(options.query || {});
    const endpoint = `/api/${XApi.normalizePath(path)}${queryString}`;

    if (XApi.isSandbox()) {
      const mock = XApi.findMock(path, method);
      return XApi.runMock(mock, {
        path: XApi.normalizePath(path),
        method,
        query: options.query || {},
        body: options.body,
        headers
      });
    }

    const fetchOptions = { method, headers };

    if (Object.prototype.hasOwnProperty.call(options, 'body')) {
      if (XApi.isFormData(options.body)) {
        fetchOptions.body = options.body;
        if (Object.prototype.hasOwnProperty.call(headers, 'Content-Type')) {
          delete headers['Content-Type'];
        }
      } else {
        fetchOptions.body = typeof options.body === 'string'
          ? options.body
          : JSON.stringify(options.body);

        if (!headers['Content-Type']) {
          headers['Content-Type'] = 'application/json';
        }
      }
    }

    try {
      const response = await fetch(endpoint, fetchOptions);
      const contentType = String(response.headers.get('content-type') || '').toLowerCase();

      if (contentType.includes('application/json')) {
        const json = await response.json();
        return XApi.normalizePayload(json);
      }

      const text = await response.text();
      return XApi.normalizePayload({
        success: false,
        status: response.ok ? 500 : response.status,
        response: null,
        errors: [text || 'invalid api response format']
      });
    } catch (error) {
      return XApi.normalizePayload({
        success: false,
        status: 500,
        response: null,
        errors: [error && error.message ? error.message : 'API request failed']
      });
    }
  }

  static async submitForm(formElement, options = {}) {
    if (!formElement || typeof formElement !== 'object') {
      return XApi.normalizePayload({
        success: false,
        status: 500,
        response: null,
        errors: { form: 'invalid form element' }
      });
    }

    const path = String(options.path || '').trim();
    if (path === '') {
      return XApi.normalizePayload({
        success: false,
        status: 500,
        response: null,
        errors: { path: 'missing api path' }
      });
    }

    XApi.clearFormErrors(formElement);
    XApi.setFormState(formElement, 'loading');

    const method = String(options.method || formElement.method || 'POST').toUpperCase();
    const formData = new FormData(formElement);
    const hasFiles = Array.from(formData.values()).some((value) => {
      return typeof File !== 'undefined' && value instanceof File;
    });

    const useMultipart = options.multipart === true || hasFiles;
    const body = useMultipart ? formData : XApi.formDataToObject(formData);

    const result = await XApi.request(path, {
      method,
      headers: Object.assign({}, options.headers || {}),
      query: options.query || {},
      body
    });

    XApi.setFormState(formElement, result.success ? 'success' : 'error');
    if (!result.success) {
      XApi.renderFormErrors(formElement, result.errors);
    }

    return result;
  }
}

window.XApi = XApi;

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
          menu_imprint: 'menu.imprint',
          menu_privacy: 'menu.privacy'
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

/* SOURCE: scripts\x_language.class.js */
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

  static getFallbackLanguage() {
    if (window.XLanguage && typeof window.XLanguage.getFallbackLanguage === 'function') {
      return XTranslation.normalizeLanguage(window.XLanguage.getFallbackLanguage());
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

    const fallbackStore = XTranslation.ensureLanguageStore(XTranslation.getFallbackLanguage());
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
