/* SOURCE: templates/body.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['body'] = `
<div id="app">
  {{Header}}
  <main id="page_main">
    <article id="page_article">{{Article}}</article>
    <aside id="page_aside">{{Sidebar}}</aside>
  </main>
  {{Footer}}
</div>
`.trim();

/* SOURCE: templates/footer.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['footer'] = `
<footer id="page_footer">
  <p>{{footer_text}}</p>
  <small>{{footer_domain}}</small>
</footer>
`.trim();

/* SOURCE: templates/form.login.js */
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

/* SOURCE: templates/header.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['header'] = `
<header id="page_header">
  <a class="logo" href="#!/index/index">{{app_name}}</a>

  <nav class="menu_main">
    <ul class="clean_list" data-status="loggedin">
      <li><a href="#!/index/index">{{menu_home}}</a></li>
      <li><a href="#!/users/profile">{{menu_profile}}</a></li>
      <li><a href="#!/users/wallets">{{menu_wallets}}</a></li>
      <li><a href="#!/users/deposit">{{menu_deposit}}</a></li>
      <li><a href="#!/users/withdraw">{{menu_withdraw}}</a></li>
      <li><a href="#!/plans/index">{{menu_plans}}</a></li>
      <li data-isadmin><a href="#!/admin/dashboard">{{menu_admin}}</a></li>
      <li><a href="#!/users/logout">{{menu_logout}}</a></li>
    </ul>

    <ul class="clean_list" data-status="loggedout">
      <li><a href="#!/index/index">{{menu_home}}</a></li>
      <li><a href="#!/users/login">{{menu_login}}</a></li>
      <li><a href="#!/users/registration">{{menu_registration}}</a></li>
      <li><a href="#!/index/imprint">{{menu_imprint}}</a></li>
      <li><a href="#!/index/privacy">{{menu_privacy}}</a></li>
    </ul>
  </nav>
</header>
`.trim();

/* SOURCE: templates/sidebar.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['sidebar'] = `
<section id="page_sidebar">
  <h3>{{sidebar_title}}</h3>
  <ul class="clean_list">
    <li><a href="#!/index/index">{{menu_home}}</a></li>
    <li><a href="#!/support/index">{{menu_support}}</a></li>
    <li><a href="#!/index/contact">{{menu_contact}}</a></li>
  </ul>
</section>
`.trim();

/* SOURCE: templates/view.index.imprint.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['view.index.imprint'] = `
<section class="view view_index_imprint">
  <h1>{{caption}}</h1>
  <p>{{content}}</p>
</section>
`.trim();

/* SOURCE: templates/view.index.index.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['view.index.index'] = `
<section class="view view_index_index">
  <h1>{{caption}}</h1>
  <p>{{intro}}</p>
</section>
`.trim();

/* SOURCE: templates/view.index.privacy.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['view.index.privacy'] = `
<section class="view view_index_privacy">
  <h1>{{caption}}</h1>
  <p>{{content}}</p>
</section>
`.trim();

/* SOURCE: templates/view.users.login.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['view.users.login'] = `
<section class="view view_users_login">
  <h1>{{caption}}</h1>
  <p>{{intro}}</p>
  {{FormLogin}}
</section>
`.trim();

/* SOURCE: templates/view.users.registration.js */
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
