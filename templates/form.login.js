window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['form.login'] = `
<form id="login_form" method="post" novalidate>
  <div class="x_form_field" data-field="username">
    <label for="login_username">{{label_username}}</label>
    <input id="login_username" name="username" type="text" autocomplete="username" required />
    <div id="login_form_username_error" class="x_form_input_error" data-error-for="username" hidden></div>
  </div>

  <div class="x_form_field" data-field="password">
    <label for="login_password">{{label_password}}</label>
    <input id="login_password" name="password" type="password" autocomplete="current-password" required />
    <div id="login_form_password_error" class="x_form_input_error" data-error-for="password" hidden></div>
  </div>

  <div class="x_form_status" aria-live="polite" hidden></div>
  <div class="x_form_upload_progress" role="status" aria-live="polite" hidden></div>
  <div class="x_form_error_summary_slot"></div>
  <button class="x_form_retry" type="submit" hidden>{{action_retry}}</button>
  <button type="submit">{{action_login}}</button>
</form>
`.trim();
