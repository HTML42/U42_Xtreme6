# agents.md

## role of this file

`agents.md` is the **mandatory documentation root** for this repository.

- all ai agents and developers must read this file first.
- this file is intentionally an overview and decision guide.
- detailed operational documentation lives in `docs/x_framework.md` and `docs/x_objects.md`.
- in case of conflicts, always apply: **`agents.md` over `docs/*`**.

## framework concept (xtreme6)

u42 xtreme6 is a **markdown-driven framework** where behavior starts in `.class.md` files and code/tests are generated from that source.

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
- project code must respect all x-rules.

## detailed documentation map

- `docs/x_framework.md`: framework architecture, build flow, include/require boundaries, php/js class constraints.
- `docs/x_objects.md`: singular/plural object model, required file set, ai workflow, and object authoring rules.
- `docs/project.md`: intentionally empty in this framework repository.

## documentation layout

- `agents.md`: authoritative overview and decision precedence (root)
- `docs/x_framework.md`: detailed framework technical reference
- `docs/x_objects.md`: detailed object modeling reference
- `docs/project.md`: intentionally empty placeholder for downstream app projects

`docs/*` may explain these rules, but must not redefine or contradict them.
