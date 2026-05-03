# users.registration workflow

## goal

Register a new user account from the frontend registration form through the documented users API and persist it via the user object/database abstraction.

## inputs

- `username`: required, normalized lowercase, unique.
- `email`: required, valid email address, unique.
- `password`: required password input.
- `password2`: required confirmation and must match `password`.

## steps

1. Route `#!/users/registration` renders `view.users.registration`.
2. `UsersController.registration()` initializes the registration form.
3. The form submits via `XApi.submitForm(...)` to `POST /api/users/registration`.
4. The API validates required fields, email format, password confirmation and duplicate username/email.
5. On valid input, `XUser::registration(...)` persists the user through `XDB`.
6. The API returns the standard X6 API payload.
7. The controller renders success or normalized field/global errors.

## api calls

- `POST /api/users/registration` as documented in `api/users/users.md`.

## object calls

- `XUser::registration(...)` for validation/persistence orchestration.
- `XUsers` lookup helpers for duplicate username/email checks.
- `XDB::insert(...)` through the configured JSON/MySQL engine.

## side effects

- A new `users` record is created when validation succeeds.
- Password values are cleared in the frontend after success or validation failure.
- Select-cache entries for the `users` table are invalidated by the DB abstraction after insert.

## success path

- API payload returns `success: true`, logical `status: 200`, and safe user response fields.
- Frontend shows `forms.callbacks.registration_success` or fallback success text.
- Submitted form fields are cleared.

## failure paths

- Missing required fields return logical `422` with field-level errors.
- Invalid email returns logical `422` with an `email` error.
- Password mismatch returns logical `422` with a `password2` error.
- Duplicate username/email returns logical `422` with the affected field error.
- Wrong HTTP method returns logical `405`.

## traceability

- Route source: `docs/routes.md` route `#!/users/registration`.
- Controller source: `scripts/controllers/users.controller.md` registration view.
- API source: `api/users/users.md` endpoint `POST /api/users/registration`.
- Object sources: `objects/x_user/x_user.class.md`, `objects/x_users/x_users.class.md`.
- Model source: `models/users.md`.
- Runtime artifacts: `scripts/controllers/users.controller.js`, `templates/view.users.registration.js`, `api/users/registration.php`.