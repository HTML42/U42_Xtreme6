# x_styles.md

## role of this file

This document defines the **framework-level style system** for xtreme6.

- `agents.md` stays the authority for decision precedence.
- this file defines how style tokens are structured and consumed.
- if this file conflicts with `agents.md`, `agents.md` wins.

## ai-driven styling concept

xtreme6 style handling is intentionally **AI-driven** and split into two layers:

1. `styles/styles.md` contains project style instructions (config + element descriptions)
2. CSS variables and component CSS are generated from those instructions plus the variable rules in this document

In downstream projects, style instructions should be maintained in `styles/styles.md` as the primary AI input for CSS generation.

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
- `--x-bp-big-min` (default `1200px`)

Media query aliases (documentation-level naming):

- `small`: up to `570px`
- `medium`: `571px` to `1199px`
- `big`: from `1200px`
- `non-small`: from `571px`
- `non-big`: up to `1199px`

## implementation notes

- keep framework defaults in `styles/x_variables.css`.
- project-specific overrides may be layered in project CSS, but variable keys should stay stable.
- avoid hardcoded colors/sizes in components when a token exists.


## styles.md authoring rules

- `styles/styles.md` is instruction-oriented (no decision log/changelog format).
- start with a config-like block for project base values (`color_main`, `color_secondary`, `distance_normal`, `font_size_normal`, `page_width`).
- add structured element descriptions so AI can generate dedicated CSS files per element/component.
- when an element spec changes, update the spec first, then regenerate/adjust CSS.
