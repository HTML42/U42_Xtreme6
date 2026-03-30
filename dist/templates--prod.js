/* SOURCE: templates\body.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['body'] = `
<div id="App">
  <header id="page_header"></header>
  <main id="page_main">
    <article id="page_article"></article>
    <aside id="page_aside"></aside>
  </main>
  <footer id="page_footer"></footer>
</div>
`.trim();

/* SOURCE: templates\footer.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['footer'] = `
<footer id="page_footer">
  <p>{{footer_text}}</p>
</footer>
`.trim();

/* SOURCE: templates\form.login.js */
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

/* SOURCE: templates\header.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['header'] = `
<header id="page_header">
  <div class="header_inner">
    <a class="logo" href="#!/index/index">{{app_name}}</a>

    <input class="navigation_mobile_toggle" id="navigation_mobile_toggle" type="checkbox" aria-label="Navigation öffnen" />

    <nav class="navigation_top" aria-label="Top Navigation">
      <ul class="clean_list">
        <li><a href="#!/index/index">{{menu_home}}</a></li>
        <li><a href="#!/index/imprint">{{menu_imprint}}</a></li>
        <li><a href="#!/index/privacy">{{menu_privacy}}</a></li>
        <li data-logout-show data-login-hide><a href="#!/users/login">{{menu_login}}</a></li>
        <li data-logout-show data-login-hide><a href="#!/users/registration">{{menu_registration}}</a></li>
        <li data-login-show data-logout-hide><a href="#!/users/logout">{{menu_logout}}</a></li>
      </ul>
    </nav>

    <label class="navigation_mobile_icon" for="navigation_mobile_toggle" aria-label="Mobile Navigation">☰</label>
  </div>

  <nav class="navigation_mobile_top" aria-label="Mobile Top Navigation">
    <ul class="clean_list">
      <li><a href="#!/index/index">{{menu_home}}</a></li>
      <li><a href="#!/index/imprint">{{menu_imprint}}</a></li>
      <li><a href="#!/index/privacy">{{menu_privacy}}</a></li>
      <li data-logout-show data-login-hide><a href="#!/users/login">{{menu_login}}</a></li>
      <li data-logout-show data-login-hide><a href="#!/users/registration">{{menu_registration}}</a></li>
      <li data-login-show data-logout-hide><a href="#!/users/logout">{{menu_logout}}</a></li>
    </ul>
  </nav>

  <nav class="navigation_mobile_bottom" aria-label="Mobile Bottom Navigation">
    <ul class="clean_list">
      <li><a href="#!/index/index">{{menu_home}}</a></li>
      <li><a href="#!/index/imprint">{{menu_imprint}}</a></li>
      <li><a href="#!/index/privacy">{{menu_privacy}}</a></li>
      <li data-logout-show data-login-hide><a href="#!/users/login">{{menu_login}}</a></li>
      <li data-logout-show data-login-hide><a href="#!/users/registration">{{menu_registration}}</a></li>
      <li data-login-show data-logout-hide><a href="#!/users/logout">{{menu_logout}}</a></li>
    </ul>
  </nav>
</header>
`.trim();

/* SOURCE: templates\sidebar.js */
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

/* SOURCE: templates\view.index.imprint.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['view.index.imprint'] = `
<section class="view view_index_imprint">
  <h1>{{caption}}</h1>
  <p>{{content}}</p>
</section>
`.trim();

/* SOURCE: templates\view.index.index.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['view.index.index'] = `
<section class="view view_index_index">
  <h1>{{caption}}</h1>
  <p>{{intro}}</p>
</section>
`.trim();

/* SOURCE: templates\view.index.privacy.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['view.index.privacy'] = `
<section class="view view_index_privacy">
  <h1>{{caption}}</h1>
  <p>{{content}}</p>
</section>
`.trim();

/* SOURCE: templates\view.users.login.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['view.users.login'] = `
<section class="view view_users_login">
  <h1>{{caption}}</h1>
  <p>{{intro}}</p>
  {{FormLogin}}
</section>
`.trim();

/* SOURCE: templates\view.users.registration.js */
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
