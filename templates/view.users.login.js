window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['view.users.login'] = `
<section class="view view_users_login">
  <h1>{{caption}}</h1>
  <p>{{intro}}</p>
  {{FormLogin}}
</section>
`.trim();
