window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['form.login'] = `
<form id="login_form" method="post" novalidate>
  <label for="login_username">{{label_username}}</label>
  <input id="login_username" name="username" type="text" autocomplete="username" required />

  <label for="login_password">{{label_password}}</label>
  <input id="login_password" name="password" type="password" autocomplete="current-password" required />

  <div class="x_form_status" aria-live="polite" hidden></div>
  <button type="submit">{{action_login}}</button>
</form>
`.trim();
