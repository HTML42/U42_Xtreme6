# x_styles.md

## role of this file

This document defines the **framework-level style system** for xtreme6.

- `agents.md` stays the authority for decision precedence.
- this file defines how style tokens are structured and consumed.
- if this file conflicts with `agents.md`, `agents.md` wins.

## ai-driven styling concept

xtreme6 style handling is intentionally **AI-driven** and split into two layers:

1. `docs/styles.md` contains project style instructions (config + element descriptions)
2. CSS variables and component CSS are generated from those instructions plus the variable rules in this document

In downstream projects, style instructions should be maintained in `docs/styles.md` as the primary AI input for CSS generation.

## design baseline: one main + one accent color

Every project should define these colors explicitly at project start:

- `main` color (Hauptfarbe)
- `secondary`/accent color (Akzentfarbe)

All color shades and semantic usages derive from this pair.

## standard style variables (baseline)

The framework baseline mirrors the previous style-variable concept and keeps predictable groups.

### scale/base values

- `--x-amplifier` (default `20%`)
- `--x-page-width` (default `1200px`)
- `--x-font-size-normal` (default `14px`)
- `--x-distance-normal` (default `20px`)
- `--x-header-height` (default `60px`)
- `--x-header-height-scroll` (default `50px`)
- `--x-logo-size` (default `220px`)
- `--x-logo-margin` (default `10px`)
- `--x-submenu-height` (default `40px`)
- `--x-footer-min-height` (default `100px`)

### typography sizes (derived)

- `--x-font-size-tiny`
- `--x-font-size-small`
- `--x-font-size-normal`
- `--x-font-size-big`
- `--x-font-size-huge`

### spacing sizes (derived)

- `--x-distance-tiny`
- `--x-distance-small`
- `--x-distance-normal`
- `--x-distance-big`
- `--x-distance-huge`

### primary color shades

- `--x-color-main-lighter`
- `--x-color-main-light`
- `--x-color-main-normal`
- `--x-color-main-dark`
- `--x-color-main-darker`

### secondary/accent color shades

- `--x-color-secondary-lighter`
- `--x-color-secondary-light`
- `--x-color-secondary-normal`
- `--x-color-secondary-dark`
- `--x-color-secondary-darker`

### neutral colors

- `--x-color-grey-lighter`
- `--x-color-grey-light`
- `--x-color-grey-normal`
- `--x-color-grey-dark`
- `--x-color-grey-darker`
- `--x-color-white`

### responsive breakpoints

- `--x-bp-small-max` (default `570px`)
- `--x-bp-medium-min` (default `571px`)
- `--x-bp-medium-max` (default `1199px`)
- `--x-bp-big-min` (default `1200px`)

Media query aliases (documentation-level naming):

- `small`: up to `570px`
- `medium`: `571px` to `1199px`
- `big`: from `1200px`
- `non-small`: from `571px`
- `non-big`: up to `1199px`

For tablet-specific behavior, use the medium range via
`(min-width: var(--x-bp-medium-min)) and (max-width: var(--x-bp-medium-max))`.

## implementation notes

- keep framework defaults in `styles/x_variables.css`.
- project-specific overrides may be layered in project CSS, but variable keys should stay stable.
- avoid hardcoded colors/sizes in components when a token exists.
- keep CSS organized with nested rules where supported, so component styles remain grouped and readable.


## styles.md authoring rules

- `docs/styles.md` is instruction-oriented (no decision log/changelog format).
- start with a config-like block for project base values (`color_main`, `color_secondary`, `distance_normal`, `font_size_normal`, `page_width`).
- add structured element descriptions so AI can generate dedicated CSS files per element/component.
- when an element spec changes, update the spec first, then regenerate/adjust CSS.


## css compilation contract

Styles are generated/maintained from markdown instructions and then compiled for runtime delivery.

- source instructions: `docs/styles.md`
- source css entry file: `styles/styles.css`
- additional optional entry files: `styles/styles.*.css`
- source css components/import targets: `styles/*.css`
- compiler: `compiler/compile_styles.php`
- runtime output: `dist/styles.css` (+ optional `dist/styles.*.css`)

`compiler/compile_production.php` includes `./styles.css` in `dist/app.php`, so style compilation must run before final production assembly.

In development, `dist/execute--dev.php` may link directly to `../styles/styles.css` to use source imports without production bundling.
