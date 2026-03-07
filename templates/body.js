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
