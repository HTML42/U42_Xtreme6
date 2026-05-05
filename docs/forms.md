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
- Form controls use the central field wrapper primitive `.x_form_field` with `data-field="<submitted field name>"`.
- Inline error slots are explicit containers with `.x_form_input_error` and `data-error-for="<submitted field name>"`.
- Submit buttons must be preceded by the global error summary slot `.x_form_error_summary_slot`; `XApi.renderFormErrors(...)` creates `.x_form_error_summary` there when errors exist.
- Form state must support `idle`, `loading`, `success`, `error`, `disabled`, `retry`, and `upload-progress` via `XApi.setFormState(...)` and `form[data-state="..."]`.

## runtime ux primitives

`scripts/x_api.class.js` owns the reusable FormAjax UX primitives. Feature controllers must call `XApi.submitForm(...)` and may update success/fail status text, but must not implement field-error DOM logic themselves.

Required runtime helpers:

- `XApi.clearFormErrors(formElement)`: removes summary/inline error content and restores ARIA metadata.
- `XApi.renderFormErrors(formElement, errors, options)`: renders field errors, summary, live-region announcement, and focuses the first invalid field or the summary.
- `XApi.setFormState(formElement, state)`: normalizes and applies form states (`idle`, `loading`, `success`, `error`, `disabled`, `retry`, `upload-progress`).
- `XApi.renderUploadProgress(formElement, progress)`: updates `.x_form_upload_progress` with `loaded`, `total`, `percent`, `done`, and file metadata.

Supported form component primitives are:

- `input`
- `select`
- `textarea`
- `checkbox`
- `radio`
- `upload`
- `hidden`
- `date`

## error handling rules

- Backend field errors must use submitted field names as keys.
- Field-error keys must match the submitted `name` attribute exactly, including bracket/dot notation for structured fields (for example `profile.email`, `items[0][name]`).
- Non-field/global errors use reserved keys: `form`, `request`, `credentials`, `method`, `mock`, or `_global`; these appear in the summary and are not forced onto a field.
- `XApi.renderFormErrors(...)` renders field errors into `[data-error-for="<field name>"]` when present, otherwise directly after the matching control.
- `XApi.renderFormErrors(...)` also renders a summary before the submit button and focuses the first invalid input; if no field matches, it focuses the summary.
- On failure, password-like fields are cleared while non-sensitive values remain.
- Error summaries use `role="alert"`, `aria-live="assertive"`, and `tabindex="-1"`.
- Invalid controls receive `aria-invalid="true"`; `aria-describedby` is merged with the inline error id without deleting existing help-text references.

## upload rules

- Upload fields use `component: upload`.
- Allowed MIME types are declared with `accept` in the form MD.
- File size and count are declared with `max size` and `max files`.
- Client-side checks in `XApi.submitForm(...)` are only prevalidation; backend validation remains authoritative.
- Upload progress is reported through `onUploadProgress` callbacks with `loaded`, `total`, `percent`, and file metadata.
- `XApi.submitForm(...)` also mirrors upload progress to `.x_form_upload_progress` and sets form state `upload-progress` while files are uploading.
- Upload API responses must use the standard API payload and field errors keyed by upload field name.

## translation derivation

Each field requires these translation keys unless explicitly documented otherwise:

- label key from `label`
- optional help key from `help`
- API/backend error keys documented in the API markdown

`php compiler/report_form_components.php` reports missing sections, unsupported components, missing templates and missing translation keys.

`php compiler/report_form_flows.php` audits runtime forms against `docs/forms/*.md` and verifies that each non-reference runtime form is bound to FormAjax via controller code.