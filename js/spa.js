/* ==========================================================================
   spa.js — "simple" single-page version.
   • Service cards: icon + name + short line + Contact button (no pricing)
   • Gallery: partial-view (peek) carousel
   • Testimonials: partial-view (peek) carousel
   Reuses config.js (engine), components.js (faqList/mapEmbed), gallery.js
   (before/after), booking.js (contact form).
   ========================================================================== */
(function () {
  "use strict";
  var A = window.AppConfig, C = window.Components, icon = A.icon, esc = A.esc, asset = A.asset;

  var NAV = [
    { label: "Home", href: "#top" },
    { label: "Services", href: "#services" },
    { label: "Gallery", href: "#gallery" },
    { label: "Contact", href: "#contact" }
  ];

  /* ---- Chrome ----------------------------------------------------------- */
  function header(cfg) {
    var b = cfg.business;
    var links = NAV.map(function (n) { return '<a href="' + n.href + '">' + esc(n.label) + "</a>"; }).join("");
    return '<a class="skip-link" href="#services">Skip to content</a>'
      + '<header class="site-header" id="siteHeader"><div class="container nav">'
      + '<a class="brand" href="#top" aria-label="' + esc(b.name) + '"><span class="brand-mark">' + esc((b.shortName || b.name)[0]) + '</span><span>' + esc(b.name) + '</span></a>'
      + '<nav class="nav-links" id="navLinks" aria-label="Primary">' + links + '</nav>'
      + '<div class="nav-cta"><a class="nav-phone" href="tel:' + esc(b.phone) + '">' + icon("phone") + '<span>' + esc(b.phoneDisplay) + '</span></a>'
      + '<a class="btn btn--accent" href="#contact">Contact us</a>'
      + '<button class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false" aria-controls="navLinks">' + icon("menu") + '</button>'
      + '</div></div></header>';
  }

  function footer(cfg) {
    var b = cfg.business;
    var svc = (cfg.services || []).slice(0, 6).map(function (s) { return '<li><a href="#services">' + esc(s.name) + "</a></li>"; }).join("");
    var links = NAV.map(function (n) { return '<li><a href="' + n.href + '">' + esc(n.label) + "</a></li>"; }).join("");
    var social = (cfg.social || []).map(function (s) { return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener" aria-label="' + esc(s.label) + '">' + icon(s.platform) + "</a>"; }).join("");
    return '<footer class="site-footer"><div class="container"><div class="footer-grid">'
      + '<div><div class="footer-brand"><span class="brand-mark">' + icon("wrench") + '</span><span>' + esc(b.name) + '</span></div>'
      + '<p style="max-width:34ch">' + esc(b.tagline) + '</p><div class="footer-social">' + social + '</div></div>'
      + '<div><h4>Services</h4><ul class="footer-links" role="list">' + svc + '</ul></div>'
      + '<div><h4>Menu</h4><ul class="footer-links" role="list">' + links + '</ul></div>'
      + '<div><h4>Visit us</h4><div class="footer-contact">'
      + '<a href="' + esc(b.mapsLink) + '" target="_blank" rel="noopener">' + icon("mapPin") + '<span>' + esc(b.address.street) + ', ' + esc(b.address.city) + ', ' + esc(b.address.region) + '</span></a>'
      + '<a href="tel:' + esc(b.phone) + '">' + icon("phone") + '<span>' + esc(b.phoneDisplay) + '</span></a>'
      + '<a href="mailto:' + esc(b.email) + '">' + icon("mail") + '<span>' + esc(b.email) + '</span></a>'
      + '</div></div></div>'
      + '<div class="footer-bottom"><span>&copy; ' + new Date().getFullYear() + ' ' + esc(b.legalName || b.name) + '. All rights reserved.</span>'
      + '<span style="opacity:.7">' + (b.licenses || []).map(function (l) { return esc(l.label); }).join(" · ") + '</span></div>'
      + '</div></footer>';
  }

  function fabs(cfg) {
    var b = cfg.business, html = '<div class="fab-stack">';
    html += '<a class="fab fab--call" href="tel:' + esc(b.phone) + '" aria-label="Call">' + icon("phone") + '<span class="fab-tip">Call us</span></a>';
    html += '<a class="fab fab--sms" href="sms:' + esc(b.sms) + '" aria-label="Text">' + icon("message") + '<span class="fab-tip">Text us</span></a>';
    if (b.whatsapp && b.whatsapp.enabled) {
      var wa = b.whatsapp.number.replace(/[^0-9]/g, ""), msg = encodeURIComponent(b.whatsapp.presetMessage || "");
      html += '<a class="fab fab--wa" href="https://wa.me/' + wa + (msg ? "?text=" + msg : "") + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + icon("whatsapp") + '<span class="fab-tip">WhatsApp</span></a>';
    }
    html += '</div><div class="mobile-bar"><a class="mb-call" href="tel:' + esc(b.phone) + '">' + icon("phone") + 'Call now</a><a class="mb-book" href="#contact">' + icon("message") + 'Contact</a></div>';
    return html;
  }

  /* ---- Sections --------------------------------------------------------- */
  function hero(cfg) {
    var b = cfg.business, h = cfg.hero;
    var statCards = (cfg.stats || []).slice(0, 4).map(function (s, i) {
      return '<div class="stat-card float ' + (i % 3 === 1 ? "d1" : i % 3 === 2 ? "d2" : "") + '"><div class="num">' + esc(s.value) + '<span>' + esc(s.suffix) + '</span></div><div class="lbl">' + esc(s.label) + '</div></div>';
    }).join("");
    var trust = (cfg.trustBadges || []).map(function (t) { return '<span class="item">' + icon("check-circle") + esc(t) + "</span>"; }).join("");
    return '<section class="hero" id="top"><div class="hero-media"><img src="' + asset(h.image) + '" alt="" aria-hidden="true" fetchpriority="high"></div>'
      + '<div class="container hero-inner"><div data-reveal>'
      + '<span class="eyebrow">' + esc(h.kicker) + '</span><h1>' + esc(h.headline) + '</h1><p class="lead">' + esc(h.subheadline) + '</p>'
      + '<div class="hero-rating">' + A.stars(cfg.review.rating) + '<span>' + cfg.review.rating + '/5 from ' + cfg.review.count + ' ' + esc(cfg.review.platform) + ' reviews</span></div>'
      + '<div class="hero-actions"><a class="btn btn--accent btn--lg" href="#contact">Contact us' + icon("arrow") + '</a>'
      + '<a class="btn btn--glass btn--lg" href="tel:' + esc(b.phone) + '">' + icon("phone") + 'Call now</a>'
      + '<a class="btn btn--glass btn--lg" href="sms:' + esc(b.sms) + '">' + icon("message") + 'Text us</a></div></div>'
      + '<div class="hero-cluster" data-reveal data-delay="1"><div class="stat-grid">' + statCards + '</div></div></div>'
      + '<div class="trust-strip"><div class="container"><div class="trust-track">' + trust + '</div></div></div></section>';
  }

  /* Simple service card: icon + name + short line + Contact button, no pricing */
  function services(cfg) {
    var cards = (cfg.services || []).map(function (s) {
      return '<article class="card svc-simple" data-reveal>'
        + '<div class="svc-min-top"><div class="svc-icon">' + icon(s.icon) + '</div><h3>' + esc(s.name) + '</h3></div>'
        + '<p>' + esc(s.short) + '</p>'
        + '<a class="btn btn--accent btn--block" href="#contact" data-service="' + esc(s.name) + '">' + icon("message") + 'Contact us</a>'
        + '</article>';
    }).join("");
    return '<section class="section spa-section" id="services"><div class="container">'
      + '<div class="section-head is-center"><span class="eyebrow is-center">What we fix</span><h2>Services for every make &amp; model</h2>'
      + '<p>Tap a service to get in touch and we\'ll take it from there. Every job is backed by our written warranty and a free digital inspection.</p></div>'
      + '<div class="grid cols-3">' + cards + '</div></div></section>';
  }

  function why(cfg) {
    var items = (cfg.whyChooseUs || []).map(function (w) { return '<div class="why-card" data-reveal><span class="why-ic">' + icon(w.icon) + '</span><div><h3>' + esc(w.title) + '</h3><p>' + esc(w.text) + '</p></div></div>'; }).join("");
    return '<section class="section section--dark spa-section"><div class="container">'
      + '<div class="section-head"><span class="eyebrow">Why drivers choose us</span><h2>Trust you can see, pricing you can predict</h2></div>'
      + '<div class="grid cols-3">' + items + '</div></div></section>';
  }

  function emergency(cfg) {
    var b = cfg.business;
    return '<section class="section spa-section"><div class="container"><div class="emergency" data-reveal>'
      + '<div class="emergency-body"><span class="pulse-ic">' + icon("alert") + '</span>'
      + '<div><span class="eyebrow" style="color:rgba(255,255,255,.85)">24/7 Roadside assistance</span>'
      + '<h2>Broken down? We\'ll come to you.</h2><p>Jump-starts, lockouts and towing straight back to our shop, day or night.</p></div></div>'
      + '<a class="btn btn--lg" style="background:#fff;color:var(--c-emergency)" href="tel:' + esc(b.phone) + '">' + icon("phone") + 'Call ' + esc(b.phoneDisplay) + '</a>'
      + '</div></div></section>';
  }

  /* Gallery — partial-view carousel */
  function gallery(cfg) {
    var slides = (cfg.gallery.images || []).map(function (im) {
      return '<div class="pcar-slide"><figure class="gcar-fig"><span class="gcar-tag">' + esc(im.category) + '</span>'
        + '<img src="' + asset(im.src) + '" alt="' + esc(im.alt) + '" loading="lazy"><figcaption class="gcar-cap">' + esc(im.alt) + '</figcaption></figure></div>';
    }).join("");
    return '<section class="section section--soft spa-section" id="gallery"><div class="container">'
      + '<div class="section-head is-center"><span class="eyebrow is-center">Inside the shop</span><h2>Our work &amp; our facility</h2>'
      + '<p>Swipe or use the arrows to browse.</p></div>'
      + '<div class="pcar pcar--gallery" data-pcar>'
      + '<button class="pcar-arrow prev" aria-label="Previous">' + icon("chevronL") + '</button>'
      + '<div class="pcar-viewport">' + slides + '</div>'
      + '<button class="pcar-arrow next" aria-label="Next">' + icon("chevronR") + '</button>'
      + '<div class="pcar-foot"><div class="pcar-dots"></div></div>'
      + '</div></div></section>';
  }

  function beforeAfter(cfg) {
    if (!cfg.beforeAfter || !cfg.beforeAfter.length) return "";
    return '<section class="section spa-section"><div class="container">'
      + '<div class="section-head is-center"><span class="eyebrow is-center">Before &amp; after</span><h2>Drag to see the difference</h2></div>'
      + '<div data-before-after></div></div></section>';
  }

  function contact(cfg) {
    var b = cfg.business;
    return '<section class="section spa-section" id="contact"><div class="container">'
      + '<div class="section-head is-center"><span class="eyebrow is-center">Get in touch</span><h2>Contact us</h2>'
      + '<p>Send a message and we\'ll reply within one business hour, or call and talk to a technician.</p></div>'
      + '<div class="grid cols-2" style="align-items:start">'
      + '<div class="card" data-reveal><div data-form="contact"></div></div>'
      + '<div data-reveal data-delay="1">'
      + '<div class="card"><h3>Reach us directly</h3><div class="footer-contact mt-2" style="color:var(--ink-2)">'
      + '<a href="tel:' + esc(b.phone) + '" style="color:var(--ink-2)">' + icon("phone") + '<span>' + esc(b.phoneDisplay) + '</span></a>'
      + '<a href="sms:' + esc(b.sms) + '" style="color:var(--ink-2)">' + icon("message") + '<span>Text us — fastest reply</span></a>'
      + '<a href="mailto:' + esc(b.email) + '" style="color:var(--ink-2)">' + icon("mail") + '<span>' + esc(b.email) + '</span></a>'
      + '<a href="' + esc(b.mapsLink) + '" target="_blank" rel="noopener" style="color:var(--ink-2)">' + icon("mapPin") + '<span>' + esc(b.address.street) + ', ' + esc(b.address.city) + '</span></a>'
      + '</div></div>'
      + '<div class="card mt-2"><h3>Opening hours</h3><div class="mt-2">' + hoursTable(b.hours) + '</div></div>'
      + '<div class="mt-2">' + C.mapEmbed(cfg) + '</div>'
      + '</div></div></div></section>';
  }

  /* ---- Shared bits ------------------------------------------------------ */
  function fmt(t) { if (!t) return ""; var p = t.split(":"), hh = +p[0], m = p[1]; return (hh % 12 || 12) + (m !== "00" ? ":" + m : "") + (hh >= 12 ? "pm" : "am"); }
  function hoursTable(hours) {
    var names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], today = names[new Date().getDay()];
    return '<table style="width:100%;border-collapse:collapse;font-size:.95rem">' + (hours || []).map(function (h) {
      var is = h.day === today;
      return '<tr style="border-bottom:1px solid var(--line)' + (is ? ';font-weight:700' : '') + '"><td style="padding:.6rem 0;color:var(--ink-2)">' + esc(h.day) + (is ? ' <span class="chip" style="padding:.1rem .5rem;font-size:.65rem">Today</span>' : '') + '</td><td style="padding:.6rem 0;text-align:right;font-family:var(--font-mono);color:var(--ink)">' + (h.open ? fmt(h.open) + " – " + fmt(h.close) : "Closed") + '</td></tr>';
    }).join("") + '</table>';
  }

  /* ---- Partial-view carousel engine ------------------------------------- */
  function initPcar(root) {
    var vp = root.querySelector(".pcar-viewport");
    var slides = Array.prototype.slice.call(vp.children);
    var prev = root.querySelector(".pcar-arrow.prev"), next = root.querySelector(".pcar-arrow.next");
    var dotsWrap = root.querySelector(".pcar-dots");
    var n = slides.length;

    if (dotsWrap) dotsWrap.innerHTML = slides.map(function (_, k) { return '<button class="pcar-dot" aria-label="Go to slide ' + (k + 1) + '"></button>'; }).join("");
    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];

    function step() { return slides.length > 1 ? (slides[1].offsetLeft - slides[0].offsetLeft) : slides[0].offsetWidth; }
    function activeIndex() {
      var center = vp.scrollLeft + vp.clientWidth / 2, best = 0, bd = Infinity;
      slides.forEach(function (s, k) { var c = s.offsetLeft + s.offsetWidth / 2, d = Math.abs(c - center); if (d < bd) { bd = d; best = k; } });
      return best;
    }
    function update() {
      var i = activeIndex();
      dots.forEach(function (d, k) { d.classList.toggle("active", k === i); });
      if (prev) prev.disabled = vp.scrollLeft <= 2;
      if (next) next.disabled = vp.scrollLeft + vp.clientWidth >= vp.scrollWidth - 2;
    }
    function toSlide(k) {
      k = Math.max(0, Math.min(n - 1, k));
      var target = slides[k].offsetLeft - (vp.clientWidth - slides[k].offsetWidth) / 2;
      vp.scrollTo({ left: target, behavior: "smooth" });
    }

    if (prev) prev.addEventListener("click", function () { toSlide(activeIndex() - 1); });
    if (next) next.addEventListener("click", function () { toSlide(activeIndex() + 1); });
    dots.forEach(function (d, k) { d.addEventListener("click", function () { toSlide(k); }); });

    var raf = null;
    vp.addEventListener("scroll", function () { if (raf) return; raf = requestAnimationFrame(function () { raf = null; update(); }); }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---- Behavior --------------------------------------------------------- */
  function wire() {
    var head = document.getElementById("siteHeader");
    var onScroll = function () { if (head) head.classList.toggle("is-stuck", window.scrollY > 12); };
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

    var toggle = document.getElementById("navToggle"), nav = document.getElementById("navLinks");
    if (toggle && nav) {
      toggle.addEventListener("click", function () { var open = nav.classList.toggle("open"); toggle.setAttribute("aria-expanded", open ? "true" : "false"); });
      nav.addEventListener("click", function (e) { if (e.target.tagName === "A") nav.classList.remove("open"); });
    }

    // Service Contact buttons → prefill the contact form's service select
    document.addEventListener("click", function (e) {
      var el = e.target.closest("[data-service]"); if (!el) return;
      var svc = el.getAttribute("data-service");
      var sel = document.querySelector('#contact select[name="service"]');
      if (sel) { for (var k = 0; k < sel.options.length; k++) { if (sel.options[k].value === svc) { sel.selectedIndex = k; break; } } }
    });

    // Reveal
    var els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach(function (el) { el.classList.add("in"); });
    } else {
      var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      els.forEach(function (el) { io.observe(el); });
    }

    // Scrollspy
    var ids = ["services", "gallery", "contact"];
    var secs = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
    if ("IntersectionObserver" in window && secs.length) {
      var spy = new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (x.isIntersecting) document.querySelectorAll(".nav-links a").forEach(function (a) { a.toggleAttribute("aria-current", a.getAttribute("href") === "#" + x.target.id); }); });
      }, { rootMargin: "-45% 0px -50% 0px" });
      secs.forEach(function (s) { spy.observe(s); });
    }
  }

  /* ---- Boot ------------------------------------------------------------- */
  A.ready.then(function (cfg) {
    var app = document.getElementById("app");
    app.innerHTML = hero(cfg) + services(cfg) + why(cfg) + emergency(cfg)
      + gallery(cfg) + beforeAfter(cfg) + contact(cfg);

    document.querySelector("[data-mount=header]").innerHTML = header(cfg);
    document.querySelector("[data-mount=footer]").innerHTML = footer(cfg);
    document.querySelector("[data-mount=fabs]").innerHTML = fabs(cfg);

    A.applySEO(cfg, { page: "home" });
    // Structured data is emitted statically in index.html <head> so crawlers and
    // AI agents see it without executing JavaScript. (See index.html + tools/seo-build.js)

    if (window.BookingForm) window.BookingForm.init(cfg);
    if (window.Gallery) window.Gallery.initBeforeAfter(cfg);
    document.querySelectorAll("[data-pcar]").forEach(initPcar);
    wire();
    document.documentElement.setAttribute("data-ready", "true");
  }).catch(function () {
    var app = document.getElementById("app");
    if (app) app.innerHTML = '<section class="section"><div class="container" style="text-align:center;padding:4rem 0"><h1>Configuration could not load</h1><p style="margin-top:1rem">Serve this site over HTTP (not file://). See README.</p></div></section>';
  });
})();
