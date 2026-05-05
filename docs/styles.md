# styles.md

## purpose

This file is a **project style instruction source**, not a changelog.

- `docs/styles.md` + `docs/x_styles.md` together define how AI should generate CSS.
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

## framework form ajax ux primitives

### element: x-form-field
- Purpose: central wrapper for generated/guided form controls, labels, help text, inline validation errors, and state-specific styling.
- Layout: vertical block with label, control, optional help, and an inline error slot.
- Spacing: use `--x-distance-normal` for field gaps and half-distance for inner status/error spacing.
- Colors: field errors use a high-contrast danger color; valid neutral state uses existing main color tokens.
- Typography: labels and errors use `--x-font-size-normal` and remain readable at default zoom.
- States: `[aria-invalid="true"]` gets a visible border/focus affordance; disabled/loading states reduce interaction without hiding labels/errors.
- Responsive behavior: fields are full-width by default and keep error text close to the affected input.
- Accessibility notes: error summaries must be visible, focusable, assertive live regions; inline errors are connected via `aria-describedby`.
- Output CSS file: styles/forms.css

### element: x-form-upload-progress
- Purpose: display FormAjax upload progress consistently for upload fields.
- Layout: progress text/bar lives near the form status and before submit controls.
- Spacing: use half of `--x-distance-normal` around the progress region.
- Colors: progress indicator uses `--x-color-secondary-normal`; background remains neutral.
- Typography: progress text uses `--x-font-size-normal`.
- States: hidden while idle/success without active upload, visible for `upload-progress` and completed upload summaries.
- Responsive behavior: progress bar is width-fluid.
- Accessibility notes: progress region uses `role="status"`, `aria-live="polite"`, and `aria-valuenow` where applicable.
- Output CSS file: styles/forms.css
