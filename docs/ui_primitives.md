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
| breadcrumb | `templates/breadcrumb.js` | available | derives from current route and route captions | `aria-label`, `aria-current`, translated current label |
| slideshow | `templates/slideshow.js` | available | route-configured home slideshow | translated title/caption/cta and declared target route |

## md-api for primitive configuration

UI primitives must be declared from Markdown before runtime/template changes.

Preferred route-level configuration shape inside `docs/routes.md`:

```yaml
ui:
  header: true
  footer: true
  layout: "default"
  sidebar: false
  sidebar_group: null
  navigation: true
  breadcrumb: false
  breadcrumb_parent: "#!/index/index"
  slideshow:
    key: "home"
    image: "assets/slides/home.svg"
    alt_key: "ui.slideshow.home.alt"
    title_key: "ui.slideshow.home.title"
    caption_key: "ui.slideshow.home.caption"
    cta_key: "ui.slideshow.home.cta"
    target_route: "#!/users/registration"
    keyboard: true
```

Rules:

- Header/footer are global defaults but route-level config must state whether they are enabled.
- `layout` controls body-level layout variants such as `default` or `auth`.
- Header navigation and sidebar links must come from `ui_navigation` in `docs/routes.md` and point only to declared routes.
- Sidebar routes reference a `sidebar_group`; each group must define `title_key` and i18n-backed items.
- Breadcrumb items derive from declared route captions (`captions.<controller>.<view>`) and optional `breadcrumb_parent` route hierarchy.
- Slideshow entries must define image source, translated title key, translated alt key, caption key, target route and keyboard support flag.

## consistency rules

- Responsiveness: primitives must work across desktop, mobile top navigation, and mobile bottom navigation.
- Accessibility: navigation primitives need semantic landmarks and `aria-label`; interactive components need keyboard operation and focus states.
- i18n: all visible labels must use translation keys available in every configured language.
- SEO: route-relevant labels/titles should map to route captions and meta/head governance where applicable.
- Routing: links must use native hash routes (`href="#!/controller/view"`) and must not use undeclared routes.

## prioritized gaps

1. **Generated route UI map (P2)**: runtime mirrors `docs/routes.md` in `XFramework.getRouteDefinitions()`; future compiler can generate that method directly from markdown.
2. **Slideshow multi-slide data source (P2)**: baseline primitive supports route-level slide metadata; future work can add multiple slides/images from markdown.
3. **Automated route-link validator (done baseline)**: `php compiler/report_ui_primitives.php` verifies template links, route UI config, navigation/sidebar groups, slideshow translation keys and declared target routes.
