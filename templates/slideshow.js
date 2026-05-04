window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['slideshow'] = `
<section id="page_slideshow" class="slideshow" aria-label="{{aria_label}}">
  <article class="slideshow_slide">
    <h2>{{title}}</h2>
    <p>{{caption}}</p>
    <a href="{{target_route}}">{{cta}}</a>
  </article>
</section>
`.trim();