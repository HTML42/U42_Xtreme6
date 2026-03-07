window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['view.index.index'] = `
<section class="view view_index_index">
  <h1>{{caption}}</h1>
  <p>{{intro}}</p>
</section>
`.trim();
