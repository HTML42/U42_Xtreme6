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
- side effects: initialize login form interactions if form exists

### registration
- purpose: render registration page and handle registration-form bootstrapping
- template: `view.users.registration`
- data needs: translated caption + intro
- side effects: initialize registration form interactions if form exists
