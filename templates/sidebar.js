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
