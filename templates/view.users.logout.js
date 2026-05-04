window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['view.users.logout'] = `
<section class="view view_users_logout">
  <h1>{{caption}}</h1>
  <p>{{intro}}</p>
</section>
`.trim();