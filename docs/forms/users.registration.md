# users.registration form

## role

Registration form for `users/registration` route.

- template: `view.users.registration`
- controller: `users.controller.js`
- workflow: `users.registration`

## api contract

- submit helper: `XApi.submitForm(...)`
- method: `POST`
- endpoint: `/api/users/registration`
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

### email

- component: input
- type: email
- name: email
- label: `forms.labels.email`
- required: yes
- autocomplete: email
- error slot: after field
- aria: `aria-invalid` and `aria-describedby` on validation errors

### password

- component: input
- type: password
- name: password
- label: `forms.labels.password`
- required: yes
- autocomplete: new-password
- error slot: after field
- aria: `aria-invalid` and `aria-describedby` on validation errors

### password2

- component: input
- type: password
- name: password2
- label: `forms.labels.password2`
- required: yes
- autocomplete: new-password
- error slot: after field
- aria: `aria-invalid` and `aria-describedby` on validation errors

## rendering

- form id: `registration_form`
- submit label: `forms.labels.registration`
- status region: `.x_form_status` with `aria-live="polite"`
- fields use `.x_form_field` wrappers with `data-field` matching the submitted field name.
- inline error slots use `.x_form_input_error[data-error-for]` and start hidden/empty.
- summary slot `.x_form_error_summary_slot` is rendered directly before the submit button.
- retry control uses `.x_form_retry` and is shown only in `form[data-state="retry"]` when a controller opts in.
- generated/runtime template: `templates/view.users.registration.js`

## validation

- `username` is required and unique.
- `email` is required, valid email and unique.
- `password` is required.
- `password2` must match `password`.
- Backend validation remains authoritative.

## error handling

- Inline errors are rendered next to each field.
- Global summary is rendered directly before submit.
- Backend errors must be keyed as `username`, `email`, `password`, `password2`, or a reserved global key such as `form`.
- Duplicate validation errors focus the affected `username` or `email` field automatically.
- Password fields are cleared after failed submit.

## translations

- `forms.labels.username`
- `forms.labels.email`
- `forms.labels.password`
- `forms.labels.password2`
- `forms.labels.registration`
- `forms.callbacks.loading`
- `forms.callbacks.registration_success`
- `forms.callbacks.registration_fail`
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