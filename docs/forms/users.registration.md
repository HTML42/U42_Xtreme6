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

## accessibility

- Labels use `for` attributes matching deterministic field IDs.
- Errors use `aria-invalid` and `aria-describedby`.
- Status messages use polite live region.