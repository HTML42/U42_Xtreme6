# users.login form

## role

Login form for `users/login` route.

- template: `form.login`
- controller: `users.controller.js`
- workflow name: login

## api contract

- submit helper: `XApi.submitForm(...)`
- method: `POST`
- endpoint: `/api/users/login`
- API markdown: `api/users/users.md`

## fields

### username

- component: input
- type: text
- name: username
- label: `forms.labels.username`
- required: yes
- autocomplete: username
- error slot: after field
- aria: `aria-invalid` and `aria-describedby` on validation errors

### password

- component: input
- type: password
- name: password
- label: `forms.labels.password`
- required: yes
- autocomplete: current-password
- error slot: after field
- aria: `aria-invalid` and `aria-describedby` on validation errors

## rendering

- form id: `login_form`
- submit label: `forms.labels.login`
- status region: `.x_form_status` with `aria-live="polite"`
- fields use `.x_form_field` wrappers with `data-field` matching the submitted field name.
- inline error slots use `.x_form_input_error[data-error-for]` and start hidden/empty.
- summary slot `.x_form_error_summary_slot` is rendered directly before the submit button.
- retry control uses `.x_form_retry` and is shown only in `form[data-state="retry"]` when a controller opts in.
- generated/runtime template: `templates/form.login.js`

## validation

- `username` is required.
- `password` is required.
- Backend validation remains authoritative.

## error handling

- Inline errors are rendered next to `username` and `password`.
- Global summary is rendered directly before submit.
- Backend errors must be keyed as `username`, `password`, or a reserved global key such as `credentials`.
- `credentials` errors focus the summary because no single field owns invalid-login state.
- Password field is cleared after failed submit.

## translations

- `forms.labels.username`
- `forms.labels.password`
- `forms.labels.login`
- `forms.callbacks.loading`
- `forms.callbacks.login_success`
- `forms.callbacks.login_fail`
- `forms.states.retry`
- `forms.states.upload_progress`
- `forms.errors.summary_title`

## accessibility

- Labels use `for` attributes matching deterministic field IDs.
- Errors use `aria-invalid` and `aria-describedby`.
- Existing help/status references must be preserved when `aria-describedby` receives an error id.
- Summary uses `role="alert"`, `aria-live="assertive"`, and receives focus when no field-level target exists.
- First invalid field receives keyboard focus when field-level errors exist.
- Status messages use polite live region.