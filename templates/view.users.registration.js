window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['view.users.registration'] = `
<section class="view view_users_registration">
  <h1>{{caption}}</h1>
  <p>{{intro}}</p>
  <form id="registration_form" method="post" novalidate>
    <label for="registration_username">{{label_username}}</label>
    <input id="registration_username" name="username" type="text" autocomplete="username" required />

    <label for="registration_email">{{label_email}}</label>
    <input id="registration_email" name="email" type="email" autocomplete="email" required />

    <label for="registration_password">{{label_password}}</label>
    <input id="registration_password" name="password" type="password" autocomplete="new-password" required />

    <label for="registration_password2">{{label_password2}}</label>
    <input id="registration_password2" name="password2" type="password" autocomplete="new-password" required />

    <div class="x_form_status" aria-live="polite" hidden></div>
    <button type="submit">{{action_registration}}</button>
  </form>
</section>
`.trim();
