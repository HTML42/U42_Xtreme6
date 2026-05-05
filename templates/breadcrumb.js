window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['breadcrumb'] = `
<nav id="page_breadcrumb" class="breadcrumb" aria-label="{{aria_label}}">
  <ol class="clean_list breadcrumb_list">
    {{breadcrumb_items}}
  </ol>
</nav>
`.trim();