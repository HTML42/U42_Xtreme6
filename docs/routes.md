# routes.md

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

Controller generation rule:

- each declared route `controller/view` must map to a method `view()` in `scripts/controllers/<controller>.controller.js`
- example:
  - route `#!/index/imprint`
  - controller file `scripts/controllers/index.controller.js`
  - method `imprint()`

Controller details must be defined in `scripts/controllers/<controller>.controller.md`.
These files refine behavior for each view but never replace the route declaration itself.

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
    ui:
      header: true
      footer: true
      layout: "default"
      sidebar: true
      sidebar_group: "main"
      navigation: true
      breadcrumb: false
      slideshow:
        key: "home"
        image: "assets/slides/home.svg"
        alt_key: "ui.slideshow.home.alt"
        title_key: "ui.slideshow.home.title"
        caption_key: "ui.slideshow.home.caption"
        cta_key: "ui.slideshow.home.cta"
        target_route: "#!/users/registration"
        keyboard: true

  - route: "#!/index/imprint"
    controller: "index"
    view: "imprint"
    purpose: "Impressum"
    ui:
      header: true
      footer: true
      layout: "default"
      sidebar: true
      sidebar_group: "main"
      navigation: true
      breadcrumb: true
      breadcrumb_parent: "#!/index/index"
      slideshow: null

  - route: "#!/index/privacy"
    controller: "index"
    view: "privacy"
    purpose: "Datenschutz"
    ui:
      header: true
      footer: true
      layout: "default"
      sidebar: true
      sidebar_group: "main"
      navigation: true
      breadcrumb: true
      breadcrumb_parent: "#!/index/index"
      slideshow: null

  - route: "#!/users/login"
    controller: "users"
    view: "login"
    purpose: "Benutzer-Login"
    ui:
      header: true
      footer: true
      layout: "auth"
      sidebar: false
      sidebar_group: null
      navigation: true
      breadcrumb: true
      breadcrumb_parent: "#!/index/index"
      slideshow: null

  - route: "#!/users/registration"
    controller: "users"
    view: "registration"
    purpose: "Benutzer-Registrierung"
    ui:
      header: true
      footer: true
      layout: "auth"
      sidebar: false
      sidebar_group: null
      navigation: true
      breadcrumb: true
      breadcrumb_parent: "#!/users/login"
      slideshow: null

  - route: "#!/users/logout"
    controller: "users"
    view: "logout"
    purpose: "Benutzer-Logout"
    ui:
      header: true
      footer: true
      layout: "auth"
      sidebar: false
      sidebar_group: null
      navigation: true
      breadcrumb: true
      breadcrumb_parent: "#!/index/index"
      slideshow: null

ui_navigation:
  header:
    - route: "#!/index/index"
      label_key: "menu.home"
    - route: "#!/index/imprint"
      label_key: "menu.imprint"
    - route: "#!/index/privacy"
      label_key: "menu.privacy"
    - route: "#!/users/login"
      label_key: "menu.login"
      visibility: "logged_out"
    - route: "#!/users/registration"
      label_key: "menu.registration"
      visibility: "logged_out"
    - route: "#!/users/logout"
      label_key: "menu.logout"
      visibility: "logged_in"
  sidebar_groups:
    main:
      title_key: "ui.sidebar.title"
      items:
        - route: "#!/index/index"
          label_key: "menu.home"
        - route: "#!/index/imprint"
          label_key: "menu.imprint"
        - route: "#!/index/privacy"
          label_key: "menu.privacy"
```

## login/registration behavior note

The routes `users/login` and `users/registration` require `x_user` + `x_users` markdown specs to include authentication behavior contracts (validation, persistence/check, success/error handling), so controllers/templates can be generated consistently with the object layer.
