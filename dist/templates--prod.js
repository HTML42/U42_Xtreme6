/* SOURCE: templates\body.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['body'] = `
<div id="App">
  <header id="page_header"></header>
  <nav id="page_breadcrumb" aria-label="Breadcrumb"></nav>
  <section id="page_slideshow" aria-label="Slideshow" hidden></section>
  <main id="page_main">
    <article id="page_article"></article>
    <aside id="page_aside"></aside>
  </main>
  <footer id="page_footer"></footer>
</div>
`.trim();

/* SOURCE: templates\breadcrumb.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['breadcrumb'] = `
<nav id="page_breadcrumb" class="breadcrumb" aria-label="{{aria_label}}">
  <ol class="clean_list breadcrumb_list">
    {{breadcrumb_items}}
  </ol>
</nav>
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

/* SOURCE: templates\header.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['header'] = `
<header id="page_header">
  <div class="header_inner">
    <a class="logo" href="#!/index/index">{{app_name}}</a>

    <input class="navigation_mobile_toggle" id="navigation_mobile_toggle" type="checkbox" aria-label="Navigation öffnen" />

    <nav class="navigation_top" aria-label="Top Navigation">
      <ul class="clean_list">
        {{navigation_top_items}}
      </ul>
    </nav>

    <label class="navigation_mobile_icon" for="navigation_mobile_toggle" aria-label="Mobile Navigation">☰</label>
  </div>

  <nav class="navigation_mobile_top" aria-label="Mobile Top Navigation">
    <ul class="clean_list">
      {{navigation_mobile_top_items}}
    </ul>
  </nav>

  <nav class="navigation_mobile_bottom" aria-label="Mobile Bottom Navigation">
    <ul class="clean_list">
      {{navigation_mobile_bottom_items}}
    </ul>
  </nav>
</header>
`.trim();

/* SOURCE: templates\sidebar.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['sidebar'] = `
<section id="page_sidebar" aria-labelledby="page_sidebar_title">
  <h3 id="page_sidebar_title">{{sidebar_title}}</h3>
  <ul class="clean_list">
    {{sidebar_items}}
  </ul>
</section>
`.trim();

/* SOURCE: templates\slideshow.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['slideshow'] = `
<section id="page_slideshow" class="slideshow" aria-label="{{aria_label}}">
  <article class="slideshow_slide" tabindex="0" data-keyboard="{{keyboard}}">
    <img class="slideshow_image" src="{{image}}" alt="{{alt}}" loading="lazy" />
    <h2>{{title}}</h2>
    <p>{{caption}}</p>
    <a href="{{target_route}}">{{cta}}</a>
  </article>
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

/* SOURCE: templates\view.users.logout.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['view.users.logout'] = `
<section class="view view_users_logout">
  <h1>{{caption}}</h1>
  <p>{{intro}}</p>
</section>
`.trim();

/* SOURCE: templates\view.users.registration.js */
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
