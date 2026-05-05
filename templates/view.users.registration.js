window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['view.users.registration'] = `
<section class="view view_users_registration">
  <h1>{{caption}}</h1>
  <p>{{intro}}</p>
  <form id="registration_form" method="post" novalidate>
    <div class="x_form_field" data-field="username">
      <label for="registration_username">{{label_username}}</label>
      <input id="registration_username" name="username" type="text" autocomplete="username" required />
      <div id="registration_form_username_error" class="x_form_input_error" data-error-for="username" hidden></div>
    </div>

    <div class="x_form_field" data-field="email">
      <label for="registration_email">{{label_email}}</label>
      <input id="registration_email" name="email" type="email" autocomplete="email" required />
      <div id="registration_form_email_error" class="x_form_input_error" data-error-for="email" hidden></div>
    </div>

    <div class="x_form_field" data-field="password">
      <label for="registration_password">{{label_password}}</label>
      <input id="registration_password" name="password" type="password" autocomplete="new-password" required />
      <div id="registration_form_password_error" class="x_form_input_error" data-error-for="password" hidden></div>
    </div>

    <div class="x_form_field" data-field="password2">
      <label for="registration_password2">{{label_password2}}</label>
      <input id="registration_password2" name="password2" type="password" autocomplete="new-password" required />
      <div id="registration_form_password2_error" class="x_form_input_error" data-error-for="password2" hidden></div>
    </div>

    <div class="x_form_status" aria-live="polite" hidden></div>
    <div class="x_form_upload_progress" role="status" aria-live="polite" hidden></div>
    <div class="x_form_error_summary_slot"></div>
    <button class="x_form_retry" type="submit" hidden>{{action_retry}}</button>
    <button type="submit">{{action_registration}}</button>
  </form>
</section>
`.trim();
