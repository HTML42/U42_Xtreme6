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
