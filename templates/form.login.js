window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['form.login'] = `
<form id="login_form">
  <label>{{label_username}}</label>
  <input name="username" type="text" />

  <label>{{label_password}}</label>
  <input name="password" type="password" />

  <button type="submit">{{action_login}}</button>
</form>
`.trim();
