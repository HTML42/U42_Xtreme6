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
