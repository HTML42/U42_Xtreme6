# framework-ui primitives governance

## role

This document is the project-level inventory and governance source for reusable UI primitives.

It complements:

- `docs/routes.md` for route availability
- `templates/*.js` for runtime template artifacts
- `translations/<lang>/*.js` for i18n labels
- `styles/*.css` for responsive/a11y styling

## inventory

| primitive | runtime artifact | status | route/data source | i18n/a11y notes |
| --- | --- | --- | --- | --- |
| layout shell | `templates/body.js` | available | global app shell | semantic `header`, `main`, `article`, `aside`, `footer` landmarks |
| header navigation | `templates/header.js` | available | declared routes in `docs/routes.md` | visible labels from `menu.*`, `aria-label` on nav regions |
| mobile navigation | `templates/header.js` | available | same items as header navigation | separate top/bottom nav regions with `aria-label` |
| sidebar navigation | `templates/sidebar.js` | available | declared routes in `docs/routes.md` | title from `ui.sidebar.title`, links use `menu.*` keys |
| footer | `templates/footer.js` | available | global shell | text from `ui.footer.text` |
| breadcrumb | none | missing | should derive from current route and route captions | required before content-heavy nested routes |
| slideshow | none | missing | should be route-configured with image/title/alt data | requires keyboard controls and translated labels |

## md-api for primitive configuration

UI primitives must be declared from Markdown before runtime/template changes.

Preferred route-level configuration shape inside `docs/routes.md`:

```yaml
ui:
  header: true
  sidebar: false
  breadcrumb: false
  slideshow: null
```

Rules:

- Header/footer are global defaults unless explicitly disabled by a future route-level UI config.
- Sidebar links must point only to routes declared in `docs/routes.md`.
- Breadcrumb items must derive from declared route captions (`captions.<controller>.<view>`).
- Slideshow entries must define image source, translated title key, translated alt key, and optional target route.

## consistency rules

- Responsiveness: primitives must work across desktop, mobile top navigation, and mobile bottom navigation.
- Accessibility: navigation primitives need semantic landmarks and `aria-label`; interactive components need keyboard operation and focus states.
- i18n: all visible labels must use translation keys available in every configured language.
- SEO: route-relevant labels/titles should map to route captions and meta/head governance where applicable.
- Routing: links must use native hash routes (`href="#!/controller/view"`) and must not use undeclared routes.

## prioritized gaps

1. **Breadcrumb primitive (P1)**: missing; needed for nested/detail routes and SEO/a11y orientation.
2. **Route-level UI config schema (P1)**: documented above but not yet compiler-enforced.
3. **Slideshow primitive (P2)**: missing; only needed when content routes require carousel/hero behavior.
4. **Automated route-link validator (P2)**: build check should verify template `href="#!/..."` links against `docs/routes.md`.
