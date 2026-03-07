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
