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
