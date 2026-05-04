window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['breadcrumb'] = `
<nav id="page_breadcrumb" class="breadcrumb" aria-label="{{aria_label}}">
  <ol class="clean_list breadcrumb_list">
    <li><a href="#!/index/index">{{home}}</a></li>
    <li aria-current="page">{{current}}</li>
  </ol>
</nav>
`.trim();