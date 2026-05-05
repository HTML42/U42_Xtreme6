window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['sidebar'] = `
<section id="page_sidebar" aria-labelledby="page_sidebar_title">
  <h3 id="page_sidebar_title">{{sidebar_title}}</h3>
  <ul class="clean_list">
    {{sidebar_items}}
  </ul>
</section>
`.trim();
