# forms md-source governance

## role

This document defines the project-level MD-first contract for framework form components.

- Form behavior starts in `docs/forms/<form>.md`.
- Runtime templates remain generated or guided artifacts.
- API submit behavior must reference documented endpoints from `api/<dimension>/<dimension>.md`.
- Frontend submission must use `XApi.submitForm(...)`.

## form markdown location

- directory: `docs/forms/`
- naming: lowercase dot-separated form names, e.g. `users.login.md`
- template mapping: `template: form.<name>` or `template: view.<controller>.<view>`

## required sections

Every form markdown file must contain:

- `## role`
- `## api contract`
- `## fields`
- `## rendering`
- `## validation`
- `## error handling`
- `## translations`
- `## accessibility`

## supported component types

- input
- select
- textarea
- checkbox
- radio
- upload
- hidden
- date

## field schema

Use one `### <fieldname>` section per field.

Required keys:

- `component`: one supported component type
- `type`: html input type or component subtype
- `name`: submitted field name
- `label`: translation key
- `required`: `yes|no`
- `error slot`: inline error container strategy, normally `after field`
- `aria`: expected ARIA behavior

Optional keys:

- `autocomplete`
- `help`: translation key for help text
- `options`: for select/radio
- `accept`: for uploads
- `multiple`: `yes|no` for uploads
- `max size`: maximum upload size in bytes
- `max files`: maximum number of files for an upload field

## standard rendering rules

- Each field renders label, input/control, optional help text, and an inline error slot.
- Field IDs must be deterministic and lowercase: `<form>_<field>`.
- Submit buttons must be preceded by the global error summary container when errors exist.
- Form state must support `idle`, `loading`, `success`, `error`, and `disabled`.

## error handling rules

- Backend field errors must use submitted field names as keys.
- `XApi.renderFormErrors(...)` renders field errors directly after the matching input.
- `XApi.renderFormErrors(...)` also renders a summary before the submit button.
- On failure, password-like fields are cleared while non-sensitive values remain.

## upload rules

- Upload fields use `component: upload`.
- Allowed MIME types are declared with `accept` in the form MD.
- File size and count are declared with `max size` and `max files`.
- Client-side checks in `XApi.submitForm(...)` are only prevalidation; backend validation remains authoritative.
- Upload progress is reported through `onUploadProgress` callbacks with `loaded`, `total`, `percent`, and file metadata.
- Upload API responses must use the standard API payload and field errors keyed by upload field name.

## translation derivation

Each field requires these translation keys unless explicitly documented otherwise:

- label key from `label`
- optional help key from `help`
- API/backend error keys documented in the API markdown

`php compiler/report_form_components.php` reports missing sections, unsupported components, missing templates and missing translation keys.

`php compiler/report_form_flows.php` audits runtime forms against `docs/forms/*.md` and verifies that each non-reference runtime form is bound to FormAjax via controller code.