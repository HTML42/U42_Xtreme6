# agents.md

## role of this file

`agents.md` is the **mandatory documentation root** for this repository.

- all ai agents and developers must read this file first.
- this file is intentionally an overview and decision guide.
- detailed operational documentation lives in `docs/x_framework.md`, `docs/x_objects.md`, `docs/x_styles.md`, and `docs/x_compiler.md`.
- `docs/routes.md` is a project-level route specification and is intentionally not prefixed with `x_`.
- in case of conflicts, always apply: **`agents.md` over `docs/*`**.

## framework concept (xtreme6)

u42 xtreme6 is a **markdown-driven framework** where behavior starts in markdown files (`*.class.md`, `docs/routes.md`, `docs/styles.md`) and code/tests/assets are generated from that source.

## core principle: pluralization is central

when building features, always use this sequence:

1. first check whether the feature can be implemented in existing objects.
2. if not, create a new domain object.
3. for every new domain object, **always create both variants**:
   - singular object (single entity, e.g. `x_user`)
   - plural object (collection/list, e.g. `x_users`)

**rule:** never create only singular or only plural objects. always create the pair.

## naming and directory rules

- file and directory names must be lowercase.
- prefix `x` marks framework-specific artifacts (`x*`).
- `x*` files belong to the framework core and may be replaced during framework updates.
- therefore never rely on direct edits in `x_` files for long-term project behavior; those edits can be lost on update.
- persistent project changes must be implemented in non-`x_` files whenever possible.
- project code must respect all x-rules.
- global runtime window variables must use uppercase names for core stores (`window.TEMPLATES`, `window.TRANSLATIONS`, `window.X6`).

- for templates/translations, ai must enforce lowercase filenames (examples: `templates/view.index.index.js`, `templates/header.js`, `translations/de/_default.js`).
- if ai accidentally creates uppercase file names, it must rename them to lowercase before commit and align documentation in `docs/x_framework.md`.
- template routing links must use native href hash routes (`href="#!/controller/view"`), not `data-href`.

## detailed documentation map

- `docs/x_framework.md`: framework architecture, build flow, include/require boundaries, php/js class constraints.
- `docs/x_compiler.md`: compiler pipeline, build order, and outputs in `dist/`.
- `docs/x_objects.md`: singular/plural object model, required file set, ai workflow, and object authoring rules.
- `docs/x_styles.md`: framework style-token and AI-driven style workflow.
- `docs/styles.md`: project style instruction source for AI-driven css generation.
- `docs/project.md`: intentionally empty in this framework repository.

## documentation layout

- `agents.md`: authoritative overview and decision precedence (root)
- `docs/x_framework.md`: detailed framework technical reference
- `docs/x_compiler.md`: compiler pipeline and build command reference
- `docs/x_objects.md`: detailed object modeling reference
- `docs/x_styles.md`: style-token system and AI-driven styling workflow
- `docs/styles.md`: project style source-of-truth for generated css decisions
- `docs/project.md`: intentionally empty placeholder for downstream app projects
- `docs/routes.md` is a project route source-of-truth for controller/template generation

`docs/*` may explain these rules, but must not redefine or contradict them.
