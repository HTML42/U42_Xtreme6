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
