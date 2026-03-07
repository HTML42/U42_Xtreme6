window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['view.users.registration'] = `
<section class="view view_users_registration">
  <h1>{{caption}}</h1>
  <p>{{intro}}</p>
  <form id="registration_form">
    <label>{{label_username}}</label>
    <input name="username" type="text" />

    <label>{{label_email}}</label>
    <input name="email" type="email" />

    <label>{{label_password}}</label>
    <input name="password" type="password" />

    <label>{{label_password2}}</label>
    <input name="password2" type="password" />

    <button type="submit">{{action_registration}}</button>
  </form>
</section>
`.trim();
