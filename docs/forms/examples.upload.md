# examples.upload form

## role

Reference upload form used to document the framework upload pipeline.

- template: reference-only
- controller: reference-only

## api contract

- submit helper: `XApi.submitForm(...)`
- method: `POST`
- endpoint: `/api/test/upload`
- API markdown: `api/test/test.md`

## fields

### attachment

- component: upload
- type: file
- name: attachment
- label: `forms.labels.attachment`
- required: yes
- accept: image/png,image/jpeg,application/pdf
- multiple: yes
- max size: 5242880
- max files: 3
- error slot: after field
- aria: `aria-invalid` and `aria-describedby` on validation errors

## rendering

- form id: `example_upload_form`
- submit label: `forms.labels.upload`
- status region: `.x_form_status` with `aria-live="polite"`
- generated/runtime template: reference-only

## validation

- `attachment` is required.
- max 3 files.
- max file size is 5 MiB per file.
- allowed MIME types: `image/png`, `image/jpeg`, `application/pdf`.
- Backend validation remains authoritative.

## error handling

- Upload errors are keyed by `attachment`.
- Inline errors are rendered next to the upload control.
- Global summary is rendered directly before submit.

## translations

- `forms.labels.attachment`
- `forms.labels.upload`

## accessibility

- Labels use `for` attributes matching deterministic field IDs.
- Errors use `aria-invalid` and `aria-describedby`.
- Status/progress messages use polite live region.