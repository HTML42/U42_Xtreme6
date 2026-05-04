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
- generated/runtime template: `templates/form.login.js`

## validation

- `username` is required.
- `password` is required.
- Backend validation remains authoritative.

## error handling

- Inline errors are rendered next to `username` and `password`.
- Global summary is rendered directly before submit.
- Password field is cleared after failed submit.

## translations

- `forms.labels.username`
- `forms.labels.password`
- `forms.labels.login`
- `forms.callbacks.loading`
- `forms.callbacks.login_success`
- `forms.callbacks.login_fail`

## accessibility

- Labels use `for` attributes matching deterministic field IDs.
- Errors use `aria-invalid` and `aria-describedby`.
- Status messages use polite live region.