class UsersController {
  constructor() {
    this.name = 'UsersController';
    this.route = null;
  }

  login(route) {
    this.route = route;
    this.bindForm('login_form', 'users/login', (result) => {
      if (result.success && result.response && window.X6 && window.X6.framework) {
        window.X6.framework.setCurrentUser(Object.assign({ login: true }, result.response));
      }
    });
  }

  registration(route) {
    this.route = route;
    this.bindForm('registration_form', 'users/registration');
  }

  bindForm(formId, apiPath, onSuccess = null) {
    const form = document.getElementById(formId);
    if (!form || form.dataset.x6Bound === 'true') {
      return;
    }

    form.dataset.x6Bound = 'true';
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const result = await XApi.submitForm(form, {
        path: apiPath,
        method: 'POST'
      });

      if (result.success && typeof onSuccess === 'function') {
        onSuccess(result);
      }
    });
  }
}

window.UsersController = UsersController;
