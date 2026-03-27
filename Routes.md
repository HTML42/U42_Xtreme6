# Routes.md

## role

Project route specification (source-of-truth for route-driven generation).

This file is intentionally **not** prefixed with `x_` because it is a project file and must be continuously maintained by the project.

## generation contract

From this file, AI/framework generation must derive:

1. controller files (if missing)
2. controller methods for each route view/action
3. view templates in `templates/view.<controller>.<view>.js`
4. optional form/partial templates referenced by those views
5. route-related tests

If a route is not declared here, its controller/template must not be generated as an assumed default.

## access-path conventions

- singular detail view pattern: `#!/<singular>/view/<id>` (example: `#!/user/view/17`)
- plural list view pattern: `#!/<plural>/view` (example: `#!/users/view`)
- project start page: `#!/index/index`

## declared routes

```yaml
routes:
  - route: "#!/index/index"
    controller: "index"
    view: "index"
    purpose: "Startseite / Landing"

  - route: "#!/index/imprint"
    controller: "index"
    view: "imprint"
    purpose: "Impressum"

  - route: "#!/index/privacy"
    controller: "index"
    view: "privacy"
    purpose: "Datenschutz"

  - route: "#!/users/login"
    controller: "users"
    view: "login"
    purpose: "Benutzer-Login"

  - route: "#!/users/registration"
    controller: "users"
    view: "registration"
    purpose: "Benutzer-Registrierung"
```

## login/registration behavior note

The routes `users/login` and `users/registration` require `x_user` + `x_users` markdown specs to include authentication behavior contracts (validation, persistence/check, success/error handling), so controllers/templates can be generated consistently with the object layer.
