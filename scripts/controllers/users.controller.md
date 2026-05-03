# users.controller.md

## role

Controller specification for `users.controller.js`.

- source route contract comes from `docs/routes.md`
- this file defines view-specific controller behavior details

## views

### login
- purpose: render login page and handle login-form bootstrapping
- template: `view.users.login`
- data needs: translated caption + intro
- form contract: render `form.login` with translated labels/actions and submit via `XApi.submitForm(...)` to `POST /api/users/login`
- ui feedback: show loading/success/error status in `.x_form_status`; field and summary errors are delegated to `XApi.renderFormErrors(...)`
- success message: use `forms.callbacks.login_success`; fallback to generic success text if translation is missing
- error message: use `forms.callbacks.login_fail`; fallback to generic fail text if translation is missing
- side effects: initialize login form interactions if form exists; on success update `window.X6.framework.setCurrentUser(...)`, set body login state, re-render shell navigation, and clear password fields
- failure behavior: keep entered non-password values, clear password fields, and render inline/global errors via `XApi`

### registration
- purpose: render registration page and handle registration-form bootstrapping
- workflow: `users.registration`
- template: `view.users.registration`
- data needs: translated caption + intro
- form contract: submit via `XApi.submitForm(...)` to `POST /api/users/registration`
- ui feedback: show loading/success/error status in `.x_form_status`; field and summary errors are delegated to `XApi.renderFormErrors(...)`
- success message: use `forms.callbacks.registration_success`; fallback to generic success text if translation is missing
- error message: use `forms.callbacks.registration_fail`; fallback to generic fail text if translation is missing
- side effects: initialize registration form interactions if form exists; on success clear all submitted fields, especially passwords
- failure behavior: keep entered non-password values, clear password fields, and render inline/global errors via `XApi`
