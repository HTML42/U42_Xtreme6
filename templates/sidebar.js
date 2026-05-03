window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['sidebar'] = `
<section id="page_sidebar" aria-labelledby="page_sidebar_title">
  <h3 id="page_sidebar_title">{{sidebar_title}}</h3>
  <ul class="clean_list">
    <li><a href="#!/index/index">{{menu_home}}</a></li>
    <li><a href="#!/index/imprint">{{menu_imprint}}</a></li>
    <li><a href="#!/index/privacy">{{menu_privacy}}</a></li>
  </ul>
</section>
`.trim();
