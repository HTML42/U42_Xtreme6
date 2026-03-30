class XApi {
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
      errors: []
    };

    if (!payload || typeof payload !== 'object') {
      return base;
    }

    return {
      success: payload.success === true,
      status: Number(payload.status || 200),
      response: Object.prototype.hasOwnProperty.call(payload, 'response') ? payload.response : null,
      errors: Array.isArray(payload.errors) ? payload.errors : []
    };
  }

  static async request(path, options = {}) {
    const method = String(options.method || 'GET').toUpperCase();
    const headers = Object.assign({}, options.headers || {});
    const queryString = XApi.toQueryString(options.query || {});
    const endpoint = `/api/${XApi.normalizePath(path)}${queryString}`;

    const fetchOptions = { method, headers };

    if (Object.prototype.hasOwnProperty.call(options, 'body')) {
      fetchOptions.body = typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body);

      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    }

    try {
      const response = await fetch(endpoint, fetchOptions);
      const json = await response.json();
      return XApi.normalizePayload(json);
    } catch (error) {
      return XApi.normalizePayload({
        success: false,
        status: 500,
        response: null,
        errors: [error && error.message ? error.message : 'API request failed']
      });
    }
  }
}

window.XApi = XApi;
