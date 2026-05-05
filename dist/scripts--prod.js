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

  logout(route) {
    this.route = route;
    if (window.X6 && window.X6.framework) {
      window.X6.framework.setCurrentUser({ id: 0, login: false });
      window.X6.framework.renderConfiguredShellParts();
    }

    this.renderUserView('view.users.logout', route);
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
      action_registration: this.t('menu.registration', 'Registrierung'),
      action_retry: this.t('forms.states.retry', 'Erneut versuchen')
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
  static _SCENARIOS = null;
  static _SCENARIO_NAME = null;

  static getApiMode() {
    const config = window.X6_CONFIG && typeof window.X6_CONFIG === 'object' ? window.X6_CONFIG : {};
    return String(config.ApiMode || 'live').toLowerCase() === 'sandbox' ? 'sandbox' : 'live';
  }

  static getScenarioName() {
    const config = window.X6_CONFIG && typeof window.X6_CONFIG === 'object' ? window.X6_CONFIG : {};
    return XApi.normalizeScenarioName(XApi._SCENARIO_NAME || config.ApiScenario || 'success');
  }

  static normalizeScenarioName(name = '') {
    const normalized = String(name || '').trim().toLowerCase();
    return normalized || 'success';
  }

  static setScenario(name = 'success') {
    XApi._SCENARIO_NAME = XApi.normalizeScenarioName(name);
    if (XApi._SCENARIOS) {
      XApi.clearMocks();
      XApi.registerScenarioMocks(XApi._SCENARIO_NAME);
    }
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

  static loadMockScenarios(config = {}) {
    if (!config || typeof config !== 'object') {
      return;
    }

    XApi._SCENARIOS = config;
    XApi.clearMocks();

    const scenarioName = XApi.normalizeScenarioName(
      XApi.getScenarioName() || config.defaultScenario || 'success'
    );
    XApi.registerScenarioMocks(scenarioName);
  }

  static registerScenarioMocks(name = 'success') {
    if (!XApi._SCENARIOS || typeof XApi._SCENARIOS !== 'object') {
      return;
    }

    const scenarios = XApi._SCENARIOS.scenarios || {};
    const scenarioName = XApi.normalizeScenarioName(name);
    const fallbackName = XApi.normalizeScenarioName(XApi._SCENARIOS.defaultScenario || 'success');
    const scenario = scenarios[scenarioName] || scenarios[fallbackName];
    if (!scenario || typeof scenario !== 'object') {
      return;
    }

    XApi._SCENARIO_NAME = scenarios[scenarioName] ? scenarioName : fallbackName;
    XApi.clearMocks();
    Object.entries(scenario.endpoints || {}).forEach(([endpointKey, definition]) => {
      const match = endpointKey.match(/^(GET|POST|PUT|PATCH|DELETE)\s+(.+)$/i);
      if (!match || !definition || typeof definition !== 'object') {
        return;
      }

      XApi.registerMock(match[2], definition.payload || {}, {
        method: match[1].toUpperCase(),
        delay: Number(definition.delay || 0)
      });
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

  static getUploadFiles(formData) {
    if (!XApi.isFormData(formData)) {
      return [];
    }

    return Array.from(formData.entries())
      .filter(([, value]) => typeof File !== 'undefined' && value instanceof File && value.name !== '')
      .map(([field, file]) => ({ field, file }));
  }

  static validateUploadFiles(files = [], rules = {}) {
    const errors = {};
    const maxFiles = Number(rules.maxFiles || rules.max_files || 0);
    const maxSize = Number(rules.maxSize || rules.max_size || 0);
    const allowedTypes = Array.isArray(rules.allowedTypes || rules.allowed_types)
      ? (rules.allowedTypes || rules.allowed_types).map((type) => String(type).toLowerCase())
      : [];

    if (maxFiles > 0) {
      const filesByField = files.reduce((groups, item) => {
        groups[item.field] = groups[item.field] || [];
        groups[item.field].push(item.file);
        return groups;
      }, {});

      Object.entries(filesByField).forEach(([field, fieldFiles]) => {
        if (fieldFiles.length > maxFiles) {
          errors[field] = XApi.flattenErrorMessages(errors[field]).concat(`too many files (max ${maxFiles})`);
        }
      });
    }

    files.forEach(({ field, file }) => {
      const fieldErrors = [];
      if (maxSize > 0 && file.size > maxSize) {
        fieldErrors.push(`file too large (max ${maxSize} bytes)`);
      }

      if (allowedTypes.length > 0 && !allowedTypes.includes(String(file.type || '').toLowerCase())) {
        fieldErrors.push(`file type not allowed (${file.type || 'unknown'})`);
      }

      if (fieldErrors.length > 0) {
        errors[field] = XApi.flattenErrorMessages(errors[field]).concat(fieldErrors);
      }
    });

    return errors;
  }

  static notifyUploadProgress(callback, progress) {
    if (typeof callback === 'function') {
      callback(progress);
    }
  }

  static getErrorMessages(errors) {
    const normalized = XApi.normalizeErrors(errors);

    if (Array.isArray(normalized)) {
      return XApi.flattenErrorMessages(normalized);
    }

    return XApi.flattenErrorMessages(Object.values(normalized));
  }

  static flattenErrorMessages(value) {
    if (Array.isArray(value)) {
      return value.flatMap((item) => XApi.flattenErrorMessages(item));
    }

    if (value && typeof value === 'object') {
      return Object.values(value).flatMap((item) => XApi.flattenErrorMessages(item));
    }

    const message = String(value || '').trim();
    return message === '' ? [] : [message];
  }

  static t(key, fallback = '') {
    if (window.XTranslation && typeof window.XTranslation.t === 'function') {
      const translated = window.XTranslation.t(key);
      if (translated && translated !== key) {
        return translated;
      }
    }

    return fallback || key;
  }

  static cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
      return window.CSS.escape(value);
    }

    return String(value || '').replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  static getGlobalErrorKeys() {
    return ['_global', 'form', 'request', 'credentials', 'method', 'mock', 'path'];
  }

  static getFieldByName(formElement, fieldName) {
    if (!formElement || !fieldName || typeof formElement.querySelector !== 'function') {
      return null;
    }

    return formElement.querySelector(`[name="${XApi.cssEscape(fieldName)}"]`);
  }

  static getFieldErrorSlot(formElement, fieldName, field = null) {
    if (!formElement || !fieldName || typeof formElement.querySelector !== 'function') {
      return null;
    }

    const existingSlot = formElement.querySelector(`[data-error-for="${XApi.cssEscape(fieldName)}"]`);
    if (existingSlot) {
      return existingSlot;
    }

    const targetField = field || XApi.getFieldByName(formElement, fieldName);
    if (!targetField || typeof targetField.insertAdjacentElement !== 'function') {
      return null;
    }

    const generatedSlot = document.createElement('div');
    generatedSlot.className = 'x_form_input_error';
    generatedSlot.setAttribute('data-error-for', fieldName);
    generatedSlot.setAttribute('data-generated', 'true');
    targetField.insertAdjacentElement('afterend', generatedSlot);

    return generatedSlot;
  }

  static getSummarySlot(formElement) {
    if (!formElement || typeof formElement.querySelector !== 'function') {
      return null;
    }

    const existingSlot = formElement.querySelector('.x_form_error_summary_slot');
    if (existingSlot) {
      return existingSlot;
    }

    const generatedSlot = document.createElement('div');
    generatedSlot.className = 'x_form_error_summary_slot';
    generatedSlot.setAttribute('data-generated', 'true');

    const submit = formElement.querySelector('[type="submit"]');
    if (submit && submit.parentNode) {
      submit.parentNode.insertBefore(generatedSlot, submit);
    } else {
      formElement.appendChild(generatedSlot);
    }

    return generatedSlot;
  }

  static mergeDescribedBy(field, errorId) {
    if (!field || !errorId || typeof field.setAttribute !== 'function') {
      return;
    }

    const tokens = String(field.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean);

    if (!tokens.includes(errorId)) {
      tokens.push(errorId);
    }

    field.setAttribute('aria-describedby', tokens.join(' '));
  }

  static removeDescribedByTokens(field, removeIds = []) {
    if (!field || removeIds.length < 1 || typeof field.getAttribute !== 'function') {
      return;
    }

    const removeSet = new Set(removeIds);
    const tokens = String(field.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token && !removeSet.has(token));

    if (tokens.length > 0) {
      field.setAttribute('aria-describedby', tokens.join(' '));
    } else {
      field.removeAttribute('aria-describedby');
    }
  }

  static clearFormErrors(formElement) {
    if (!formElement || typeof formElement.querySelectorAll !== 'function') {
      return;
    }

    const errorIds = Array.from(formElement.querySelectorAll('.x_form_input_error[id]'))
      .map((node) => node.id)
      .filter(Boolean);

    formElement.querySelectorAll('.x_form_error_summary').forEach((node) => node.remove());
    formElement.querySelectorAll('.x_form_error_summary_slot[data-generated="true"]').forEach((node) => node.remove());

    formElement.querySelectorAll('.x_form_input_error').forEach((node) => {
      if (node.getAttribute('data-generated') === 'true') {
        node.remove();
        return;
      }

      node.textContent = '';
      node.hidden = true;
      node.removeAttribute('role');
    });

    formElement.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
      field.removeAttribute('aria-invalid');
      XApi.removeDescribedByTokens(field, errorIds);
    });

    formElement.querySelectorAll('.x_form_field.has-error').forEach((fieldWrapper) => {
      fieldWrapper.classList.remove('has-error');
    });
  }

  static setFormState(formElement, state = 'idle') {
    if (!formElement || typeof formElement.setAttribute !== 'function') {
      return;
    }

    const normalizedState = String(state || 'idle').toLowerCase();
    formElement.setAttribute('data-state', normalizedState);

    const disabled = normalizedState === 'loading' || normalizedState === 'disabled' || normalizedState === 'upload-progress';
    formElement.setAttribute('aria-busy', disabled ? 'true' : 'false');
    formElement.querySelectorAll('input, textarea, select, button').forEach((field) => {
      if (disabled) {
        if (!Object.prototype.hasOwnProperty.call(field.dataset, 'x6WasDisabled')) {
          field.dataset.x6WasDisabled = field.disabled ? 'true' : 'false';
        }
        field.disabled = true;
        return;
      }

      if (Object.prototype.hasOwnProperty.call(field.dataset, 'x6WasDisabled')) {
        field.disabled = field.dataset.x6WasDisabled === 'true';
        delete field.dataset.x6WasDisabled;
      }
    });

    formElement.querySelectorAll('.x_form_retry').forEach((retryControl) => {
      retryControl.hidden = normalizedState !== 'retry';
    });
  }

  static renderFormErrors(formElement, errors = {}, options = {}) {
    if (!formElement || typeof formElement.querySelector !== 'function') {
      return;
    }

    XApi.clearFormErrors(formElement);

    const normalized = XApi.normalizeErrors(errors);
    const messages = XApi.getErrorMessages(normalized);
    if (messages.length < 1) {
      return;
    }

    const summarySlot = XApi.getSummarySlot(formElement);
    const summary = document.createElement('div');
    summary.className = 'x_form_error_summary';
    summary.setAttribute('role', 'alert');
    summary.setAttribute('aria-live', 'assertive');
    summary.setAttribute('tabindex', '-1');

    const title = document.createElement('strong');
    title.className = 'x_form_error_summary_title';
    title.textContent = XApi.t('forms.errors.summary_title', 'Bitte prüfe die markierten Felder.');
    summary.appendChild(title);

    const list = document.createElement('ul');
    messages.forEach((message) => {
      const item = document.createElement('li');
      item.textContent = message;
      list.appendChild(item);
    });
    summary.appendChild(list);

    if (summarySlot) {
      summarySlot.appendChild(summary);
    } else {
      formElement.appendChild(summary);
    }

    let firstInvalidField = null;
    if (!Array.isArray(normalized) && normalized && typeof normalized === 'object') {
      Object.entries(normalized).forEach(([fieldName, fieldErrors]) => {
        const field = formElement.querySelector(`[name="${XApi.cssEscape(fieldName)}"]`);
        const isGlobalError = XApi.getGlobalErrorKeys().includes(String(fieldName));
        if (!field || isGlobalError) {
          return;
        }

        const errorText = XApi.flattenErrorMessages(fieldErrors).join(' ');
        if (errorText.trim() === '') {
          return;
        }

        const errorNode = XApi.getFieldErrorSlot(formElement, fieldName, field);
        if (!errorNode) {
          return;
        }

        const errorId = errorNode.id || `${formElement.id || 'x_form'}_${String(fieldName).replace(/[^a-zA-Z0-9_-]/g, '_')}_error`;
        errorNode.id = errorId;
        errorNode.classList.add('x_form_input_error');
        errorNode.hidden = false;
        errorNode.setAttribute('role', 'alert');
        errorNode.textContent = errorText;

        field.setAttribute('aria-invalid', 'true');
        XApi.mergeDescribedBy(field, errorId);

        const wrapper = field.closest ? field.closest('.x_form_field') : null;
        if (wrapper) {
          wrapper.classList.add('has-error');
        }

        if (!firstInvalidField) {
          firstInvalidField = field;
        }
      });
    }

    if (options.focus !== false) {
      const focusTarget = firstInvalidField || summary;
      if (focusTarget && typeof focusTarget.focus === 'function') {
        focusTarget.focus({ preventScroll: false });
      }
    }
  }

  static renderUploadProgress(formElement, progress = {}) {
    if (!formElement || typeof formElement.querySelector !== 'function') {
      return;
    }

    let progressNode = formElement.querySelector('.x_form_upload_progress');
    if (!progressNode) {
      progressNode = document.createElement('div');
      progressNode.className = 'x_form_upload_progress';
      progressNode.setAttribute('role', 'status');
      progressNode.setAttribute('aria-live', 'polite');

      const summarySlot = XApi.getSummarySlot(formElement);
      if (summarySlot && summarySlot.parentNode) {
        summarySlot.parentNode.insertBefore(progressNode, summarySlot);
      } else {
        formElement.appendChild(progressNode);
      }
    }

    const percent = Math.max(0, Math.min(100, Number(progress.percent || 0)));
    const loaded = Number(progress.loaded || 0);
    const total = Number(progress.total || 0);
    const label = progress.done === true
      ? XApi.t('forms.states.upload_done', 'Upload abgeschlossen.')
      : XApi.t('forms.states.upload_progress', 'Upload läuft...');

    progressNode.hidden = false;
    progressNode.textContent = '';

    const text = document.createElement('span');
    text.className = 'x_form_upload_progress_text';
    text.textContent = total > 0
      ? `${label} ${percent}% (${loaded}/${total} Bytes)`
      : `${label} ${percent}%`;

    const bar = document.createElement('div');
    bar.className = 'x_form_upload_progress_bar';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.setAttribute('aria-valuenow', String(percent));

    const fill = document.createElement('span');
    fill.className = 'x_form_upload_progress_fill';
    fill.style.width = `${percent}%`;
    bar.appendChild(fill);

    progressNode.appendChild(text);
    progressNode.appendChild(bar);
  }

  static async request(path, options = {}) {
    const method = String(options.method || 'GET').toUpperCase();
    const headers = Object.assign({}, options.headers || {});
    const queryString = XApi.toQueryString(options.query || {});
    const endpoint = `/api/${XApi.normalizePath(path)}${queryString}`;

    if (XApi.isSandbox()) {
      if (XApi._SCENARIOS && XApi._MOCKS.length === 0) {
        XApi.registerScenarioMocks(XApi.getScenarioName());
      }

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
    const method = String(options.method || formElement.method || 'POST').toUpperCase();
    const formData = new FormData(formElement);
    const uploadFiles = XApi.getUploadFiles(formData);
    const hasFiles = uploadFiles.length > 0;
    XApi.setFormState(formElement, hasFiles ? 'upload-progress' : 'loading');

    if (hasFiles) {
      const uploadErrors = XApi.validateUploadFiles(uploadFiles, options.upload || {});
      if (Object.keys(uploadErrors).length > 0) {
        XApi.setFormState(formElement, 'error');
        XApi.renderFormErrors(formElement, uploadErrors);
        return XApi.normalizePayload({
          success: false,
          status: 422,
          response: null,
          errors: uploadErrors
        });
      }

      const initialProgress = {
        loaded: 0,
        total: uploadFiles.reduce((sum, item) => sum + item.file.size, 0),
        percent: 0,
        files: uploadFiles.map((item) => ({
          field: item.field,
          name: item.file.name,
          size: item.file.size,
          type: item.file.type
        }))
      };
      XApi.renderUploadProgress(formElement, initialProgress);
      XApi.notifyUploadProgress(options.onUploadProgress, initialProgress);
    }

    const useMultipart = options.multipart === true || hasFiles;
    const body = useMultipart ? formData : XApi.formDataToObject(formData);

    const result = await XApi.request(path, {
      method,
      headers: Object.assign({}, options.headers || {}),
      query: options.query || {},
      body
    });

    XApi.setFormState(formElement, result.success ? 'success' : 'error');
    if (hasFiles) {
      const doneProgress = {
        loaded: uploadFiles.reduce((sum, item) => sum + item.file.size, 0),
        total: uploadFiles.reduce((sum, item) => sum + item.file.size, 0),
        percent: 100,
        done: true
      };
      XApi.renderUploadProgress(formElement, doneProgress);
      XApi.notifyUploadProgress(options.onUploadProgress, doneProgress);
    }

    if (!result.success) {
      XApi.renderFormErrors(formElement, result.errors);
    }

    return result;
  }
}

window.XApi = XApi;

/* SOURCE: scripts\x_api_mocks.js */
(function () {
  const scenarios = {
    version: 'v1.0.0',
    defaultScenario: 'success',
    coverage: {
      requiredScenarioTypes: ['success', 'validation-error', 'auth-error', 'timeout', 'upload-error']
    },
    scenarios: {
      success: {
        type: 'success',
        description: 'Successful users and upload demo flow without live backend.',
        endpoints: {
          'GET users/index': {
            payload: {
              success: true,
              status: 200,
              response: [{ id: 1, username: 'demo', email: 'demo@example.com', hash: 'SANDBOX1' }],
              errors: {}
            }
          },
          'GET test/foo': {
            payload: { success: true, status: 200, response: 'foo', errors: {} }
          },
          'GET test/bar': {
            payload: { success: true, status: 200, response: 'bar', errors: {} }
          },
          'POST users/login': {
            delay: 150,
            payload: {
              success: true,
              status: 200,
              response: { id: 1, username: 'demo', email: 'demo@example.com', hash: 'SANDBOX1', lastlogin_date: 1777834000 },
              errors: {}
            }
          },
          'POST users/registration': {
            delay: 150,
            payload: {
              success: true,
              status: 200,
              response: { id: 2, username: 'demo', email: 'demo@example.com', hash: 'SANDBOX2' },
              errors: {}
            }
          },
          'POST test/upload': {
            delay: 200,
            payload: {
              success: true,
              status: 200,
              response: { files: [{ field: 'attachment', name: 'sandbox-demo.pdf', size: 12800, type: 'application/pdf' }] },
              errors: {}
            }
          }
        }
      },
      'validation-error': {
        type: 'validation-error',
        description: 'Form validation errors for login and registration.',
        endpoints: {
          'POST users/login': {
            payload: { success: false, status: 422, response: null, errors: { username: 'username is required', password: 'password is required' } }
          },
          'POST users/registration': {
            payload: { success: false, status: 422, response: null, errors: { email: 'email already exists', password2: 'passwords do not match' } }
          }
        }
      },
      'auth-error': {
        type: 'auth-error',
        description: 'Invalid login credentials demo.',
        endpoints: {
          'POST users/login': {
            payload: { success: false, status: 401, response: null, errors: { credentials: 'invalid login' } }
          }
        }
      },
      timeout: {
        type: 'timeout',
        description: 'Artificial timeout/delay scenario for loading and retry UX.',
        endpoints: {
          'GET users/index': {
            delay: 1200,
            payload: { success: false, status: 504, response: null, errors: { timeout: 'sandbox timeout' } }
          },
          'POST users/login': {
            delay: 1200,
            payload: { success: false, status: 504, response: null, errors: { timeout: 'sandbox timeout' } }
          }
        }
      },
      'upload-error': {
        type: 'upload-error',
        description: 'Upload validation error with field mapping.',
        endpoints: {
          'POST test/upload': {
            payload: { success: false, status: 422, response: null, errors: { attachment: 'file type not allowed' } }
          }
        }
      }
    }
  };

  window.X6_SANDBOX_SCENARIOS = scenarios;
  if (window.XApi && typeof window.XApi.loadMockScenarios === 'function') {
    window.XApi.loadMockScenarios(scenarios);
  }
}());

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
    this.handleLanguageChange = this.handleLanguageChange.bind(this);
    window.addEventListener('x6:route', this.handleRoute);
    window.addEventListener('x6:language', this.handleLanguageChange);

    this.renderBaseLayout();
  }

  attachRouter(router) {
    this.router = router;
  }

  destroy() {
    window.removeEventListener('x6:route', this.handleRoute);
    window.removeEventListener('x6:language', this.handleLanguageChange);
  }

  handleRoute(event) {
    if (!event || !event.detail) {
      return;
    }

    this.renderRoute(event.detail);
  }

  handleLanguageChange() {
    const route = this.currentRoute || this.getEmptyRoute();

    this.renderConfiguredShellParts();
    this.renderRoute(route);
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
        '<nav id="page_breadcrumb" aria-label="Breadcrumb"></nav>',
        '<section id="page_slideshow" aria-label="Slideshow" hidden></section>',
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

      const dynamicParams = typeof config.params === 'function' ? config.params() : (config.params || {});
      this.renderShellPart(config.targetId, config.templateName, {
        ...this.translateMap(config.translationMap),
        ...dynamicParams
      });
    });
  }

  getShellPartConfigs() {
    return [
      {
        targetId: 'page_header',
        templateName: 'header',
        params: () => ({
          navigation_top_items: this.renderNavigationItems('header'),
          navigation_mobile_top_items: this.renderNavigationItems('header'),
          navigation_mobile_bottom_items: this.renderNavigationItems('header')
        }),
        translationMap: {
          app_name: 'app.name',
        }
      },
      {
        targetId: 'page_aside',
        templateName: 'sidebar',
        when: () => !!(window.X6 && window.X6.options && window.X6.options.sidebar === true),
        params: () => {
          const currentConfig = this.getRouteUiConfig(this.currentRoute || this.getEmptyRoute());
          const group = this.getSidebarGroup(currentConfig.sidebar_group);

          return {
            sidebar_items: this.renderSidebarItems(group)
          };
        },
        translationMap: {
          sidebar_title: 'ui.sidebar.title'
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

  escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  buildRouteLink(route, label, attributes = '') {
    const safeRoute = this.escapeHtml(route);
    const safeLabel = this.escapeHtml(label);
    const attr = attributes ? ` ${attributes}` : '';

    return `<li${attr}><a href="${safeRoute}">${safeLabel}</a></li>`;
  }

  getRouteDefinitions() {
    return {
      'index/index': {
        route: '#!/index/index',
        controller: 'index',
        view: 'index',
        caption_key: 'captions.index.index',
        ui: {
          header: true,
          footer: true,
          layout: 'default',
          sidebar: true,
          sidebar_group: 'main',
          navigation: true,
          breadcrumb: false,
          breadcrumb_parent: null,
          slideshow: {
            key: 'home',
            image: 'assets/slides/home.svg',
            alt_key: 'ui.slideshow.home.alt',
            title_key: 'ui.slideshow.home.title',
            caption_key: 'ui.slideshow.home.caption',
            cta_key: 'ui.slideshow.home.cta',
            target_route: '#!/users/registration',
            keyboard: true
          }
        }
      },
      'index/imprint': {
        route: '#!/index/imprint',
        controller: 'index',
        view: 'imprint',
        caption_key: 'captions.index.imprint',
        ui: {
          header: true,
          footer: true,
          layout: 'default',
          sidebar: true,
          sidebar_group: 'main',
          navigation: true,
          breadcrumb: true,
          breadcrumb_parent: '#!/index/index',
          slideshow: null
        }
      },
      'index/privacy': {
        route: '#!/index/privacy',
        controller: 'index',
        view: 'privacy',
        caption_key: 'captions.index.privacy',
        ui: {
          header: true,
          footer: true,
          layout: 'default',
          sidebar: true,
          sidebar_group: 'main',
          navigation: true,
          breadcrumb: true,
          breadcrumb_parent: '#!/index/index',
          slideshow: null
        }
      },
      'users/login': {
        route: '#!/users/login',
        controller: 'users',
        view: 'login',
        caption_key: 'captions.users.login',
        ui: {
          header: true,
          footer: true,
          layout: 'auth',
          sidebar: false,
          sidebar_group: null,
          navigation: true,
          breadcrumb: true,
          breadcrumb_parent: '#!/index/index',
          slideshow: null
        }
      },
      'users/registration': {
        route: '#!/users/registration',
        controller: 'users',
        view: 'registration',
        caption_key: 'captions.users.registration',
        ui: {
          header: true,
          footer: true,
          layout: 'auth',
          sidebar: false,
          sidebar_group: null,
          navigation: true,
          breadcrumb: true,
          breadcrumb_parent: '#!/users/login',
          slideshow: null
        }
      },
      'users/logout': {
        route: '#!/users/logout',
        controller: 'users',
        view: 'logout',
        caption_key: 'captions.users.logout',
        ui: {
          header: true,
          footer: true,
          layout: 'auth',
          sidebar: false,
          sidebar_group: null,
          navigation: true,
          breadcrumb: true,
          breadcrumb_parent: '#!/index/index',
          slideshow: null
        }
      }
    };
  }

  getUiNavigationConfig() {
    return {
      header: [
        { route: '#!/index/index', label_key: 'menu.home' },
        { route: '#!/index/imprint', label_key: 'menu.imprint' },
        { route: '#!/index/privacy', label_key: 'menu.privacy' },
        { route: '#!/users/login', label_key: 'menu.login', visibility: 'logged_out' },
        { route: '#!/users/registration', label_key: 'menu.registration', visibility: 'logged_out' },
        { route: '#!/users/logout', label_key: 'menu.logout', visibility: 'logged_in' }
      ],
      sidebar_groups: {
        main: {
          title_key: 'ui.sidebar.title',
          items: [
            { route: '#!/index/index', label_key: 'menu.home' },
            { route: '#!/index/imprint', label_key: 'menu.imprint' },
            { route: '#!/index/privacy', label_key: 'menu.privacy' }
          ]
        }
      }
    };
  }

  renderNavigationItems(groupName = 'header') {
    const items = this.getUiNavigationConfig()[groupName] || [];

    return items.map((item) => {
      const attributes = item.visibility === 'logged_out'
        ? 'data-logout-show data-login-hide'
        : (item.visibility === 'logged_in' ? 'data-login-show data-logout-hide' : '');

      return this.buildRouteLink(item.route, XTranslation.t(item.label_key), attributes);
    }).join('');
  }

  getSidebarGroup(groupName) {
    const groups = this.getUiNavigationConfig().sidebar_groups || {};
    return groups[groupName] || null;
  }

  renderSidebarItems(group) {
    if (!group || !Array.isArray(group.items)) {
      return '';
    }

    return group.items
      .map((item) => this.buildRouteLink(item.route, XTranslation.t(item.label_key)))
      .join('');
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

    this.renderRouteUiPrimitives(route);
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

  getRouteUiConfig(route) {
    const key = `${route.controller}/${route.view}`;
    const routeDefinition = this.getRouteDefinitions()[key];

    return routeDefinition?.ui || {
      header: true,
      footer: true,
      layout: 'default',
      sidebar: false,
      sidebar_group: null,
      navigation: true,
      breadcrumb: true,
      breadcrumb_parent: '#!/index/index',
      slideshow: null
    };
  }

  renderRouteUiPrimitives(route) {
    const config = this.getRouteUiConfig(route);
    if (window.X6 && window.X6.options) {
      window.X6.options.sidebar = config.sidebar === true;
    }

    document.body.setAttribute('data-layout', String(config.layout || 'default'));

    this.renderConfiguredShellParts();
    this.clearDisabledSidebar(config);
    this.renderBreadcrumb(route, config);
    this.renderSlideshow(route, config);
  }

  clearDisabledSidebar(config) {
    if (config.sidebar === true) {
      return;
    }

    const sidebar = document.getElementById('page_sidebar');
    if (sidebar) {
      sidebar.outerHTML = '<aside id="page_aside"></aside>';
      return;
    }

    const aside = document.getElementById('page_aside');
    if (aside) {
      aside.innerHTML = '';
    }
  }

  renderBreadcrumb(route, config) {
    const target = document.getElementById('page_breadcrumb');
    if (!target) {
      return;
    }

    if (config.breadcrumb !== true) {
      target.innerHTML = '';
      target.setAttribute('hidden', 'hidden');
      return;
    }

    target.removeAttribute('hidden');
    const items = this.renderBreadcrumbItems(route, config);
    target.outerHTML = XTemplate.render('breadcrumb', {
      aria_label: XTranslation.t('ui.breadcrumb.aria_label'),
      breadcrumb_items: items
    });
  }

  renderBreadcrumbItems(route, config) {
    const routeDefinitions = this.getRouteDefinitions();
    const currentRoute = `#!/${route.controller}/${route.view}`;
    const parentRoute = config.breadcrumb_parent || '#!/index/index';
    const items = [];

    if (parentRoute && parentRoute !== currentRoute) {
      const parent = Object.values(routeDefinitions).find((definition) => definition.route === parentRoute);
      const labelKey = parent?.caption_key || 'menu.home';
      items.push(this.buildRouteLink(parentRoute, XTranslation.t(labelKey)));
    }

    items.push(`<li aria-current="page">${this.escapeHtml(XTranslation.t(`captions.${route.controller}.${route.view}`))}</li>`);

    return items.join('');
  }

  renderSlideshow(route, config) {
    const target = document.getElementById('page_slideshow');
    if (!target) {
      return;
    }

    if (!config.slideshow) {
      target.innerHTML = '';
      target.setAttribute('hidden', 'hidden');
      return;
    }

    const slideshow = config.slideshow;
    target.removeAttribute('hidden');
    target.outerHTML = XTemplate.render('slideshow', {
      aria_label: XTranslation.t('ui.slideshow.aria_label'),
      image: slideshow.image,
      alt: XTranslation.t(slideshow.alt_key),
      title: XTranslation.t(slideshow.title_key),
      caption: XTranslation.t(slideshow.caption_key),
      cta: XTranslation.t(slideshow.cta_key),
      target_route: slideshow.target_route,
      keyboard: slideshow.keyboard === true ? 'true' : 'false'
    });
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
