# styles.md

## purpose

This file is a **project style instruction source**, not a changelog.

- `styles/styles.md` + `docs/x_styles.md` together define how AI should generate CSS.
- this file should contain reusable design rules and concrete project decisions.
- when new UI elements/components are described here, AI should generate/update dedicated CSS files for them.

## project style config (edit at project start)

```yaml
style_config:
  color_main: "#2C3E50"
  color_secondary: "#2ECC71"
  distance_normal: "20px"
  font_size_normal: "14px"
  page_width: "1200px"
```

Notes:
- `color_main` = Hauptfarbe
- `color_secondary` = Akzentfarbe
- usually `distance_normal` is `20px` (can be raised e.g. to `30px` if the project needs larger spacing)

## global style instructions

1. Always derive design tokens from the `style_config` values first.
2. Use one clear main color and one clear accent color as the visual base.
3. Keep spacing and typography scale consistent with `distance_normal` and `font_size_normal`.
4. Avoid hardcoded values in component CSS when a token exists.
5. For each new element description, create or extend a dedicated CSS file for that element.

## element design instruction template

Use this block when defining a new component/element for AI-driven CSS generation:

```md
### element: <name>
- Purpose: ...
- Layout: ...
- Spacing: ...
- Colors: ...
- Typography: ...
- States: ... (hover, active, disabled, etc.)
- Responsive behavior: ...
- Accessibility notes: ...
- Output CSS file: styles/<name>.css
```

## example instruction

```md
### element: promo-card
- Purpose: highlight a featured offer on landing page
- Layout: vertical card with header, body text, action button
- Spacing: use `--x-distance-normal` for outer padding and `--x-distance-small` between inner blocks
- Colors: background `--x-color-main-normal`, button `--x-color-secondary-normal`
- Typography: title `--x-font-size-big`, body `--x-font-size-normal`
- States: button hover uses `--x-color-secondary-dark`
- Responsive behavior: full width on small breakpoint, max-width 420px on medium/big
- Accessibility notes: minimum contrast 4.5:1, visible keyboard focus ring
- Output CSS file: styles/promo-card.css
```
