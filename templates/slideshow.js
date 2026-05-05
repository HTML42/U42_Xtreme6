window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['slideshow'] = `
<section id="page_slideshow" class="slideshow" aria-label="{{aria_label}}">
  <article class="slideshow_slide" tabindex="0" data-keyboard="{{keyboard}}">
    <img class="slideshow_image" src="{{image}}" alt="{{alt}}" loading="lazy" />
    <h2>{{title}}</h2>
    <p>{{caption}}</p>
    <a href="{{target_route}}">{{cta}}</a>
  </article>
</section>
`.trim();