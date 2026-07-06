/* ==========================================================================
   config.js — the engine.
   Loads config.json once, injects the theme, builds SEO meta + JSON-LD,
   and exposes helpers + an icon library to every page.
   Usage on a page:
     <script>window.__BASE__ = '';</script>   // '' for root, '../' for /locations
     <script src="js/config.js"></script>
     AppConfig.ready.then(cfg => { ...render... });
   ========================================================================== */
(function () {
  "use strict";

  var BASE = window.__BASE__ || "";

  /* ---- Tiny SVG icon library (stroke-based, inherits currentColor) ------- */
  var P = 'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  var ICONS = {
    phone: '<path '+P+' d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.7 2.1z"/>',
    message: '<path '+P+' d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.8L3 21l1.9-5.1A8.4 8.4 0 1 1 21 11.5z"/>',
    whatsapp: '<path fill="currentColor" d="M17.5 14.4c-.3-.2-1.7-.8-1.9-.9-.3-.1-.5-.2-.6.2-.2.3-.7.8-.8 1-.2.2-.3.2-.6.1a7.7 7.7 0 0 1-3.8-3.3c-.3-.5.3-.4.8-1.4.1-.2 0-.3 0-.5l-.9-2c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.8.8-1 1.9-1 2 0 .2-.3 2 1.4 4.4a9.4 9.4 0 0 0 5.4 3.4c.5 0 1.4.1 2.1-.4.5-.3 1.1-.9 1.2-1.5.2-.6.2-1 .1-1.1l-.4-.2zM12 2a10 10 0 0 0-8.6 15l-1.4 5 5.2-1.3A10 10 0 1 0 12 2z"/>',
    star: '<path fill="currentColor" d="M12 2l3 6.3 6.9.9-5 4.8 1.2 6.9L12 17.8 5.9 21l1.2-6.9-5-4.8 6.9-.9z"/>',
    check: '<path '+P+' d="M20 6 9 17l-5-5"/>',
    'check-circle': '<path '+P+' d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path '+P+' d="m22 4-10 10.1-3-3"/>',
    droplet: '<path '+P+' d="M12 2.7 6.3 9a8 8 0 1 0 11.4 0z"/>',
    disc: '<circle '+P+' cx="12" cy="12" r="9"/><circle '+P+' cx="12" cy="12" r="3"/>',
    gear: '<circle '+P+' cx="12" cy="12" r="3"/><path '+P+' d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.7l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 14h-.1a2 2 0 1 1 0-4H3a1.7 1.7 0 0 0 1.6-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 3.4V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 20.6 10H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    activity: '<path '+P+' d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    battery: '<rect '+P+' x="2" y="7" width="16" height="10" rx="2"/><path '+P+' d="M22 11v2"/><path '+P+' d="M6 10v4M9 10v4"/>',
    wave: '<path '+P+' d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path '+P+' d="M2 18c2-3 4-3 6 0s4 3 6 0 4-3 6 0" opacity=".5"/>',
    target: '<circle '+P+' cx="12" cy="12" r="9"/><circle '+P+' cx="12" cy="12" r="5"/><circle '+P+' cx="12" cy="12" r="1"/>',
    snow: '<path '+P+' d="M12 2v20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1M2 12h20"/>',
    circle: '<circle '+P+' cx="12" cy="12" r="9"/><circle '+P+' cx="12" cy="12" r="3"/>',
    truck: '<path '+P+' d="M1 3h13v13H1z"/><path '+P+' d="M14 8h4l3 3v5h-7z"/><circle '+P+' cx="5.5" cy="18.5" r="1.5"/><circle '+P+' cx="17.5" cy="18.5" r="1.5"/>',
    alert: '<path '+P+' d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
    shield: '<path '+P+' d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path '+P+' d="m9 12 2 2 4-4"/>',
    eye: '<path '+P+' d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle '+P+' cx="12" cy="12" r="3"/>',
    tag: '<path '+P+' d="M20.6 13.4 13 21a2 2 0 0 1-2.8 0L3 13.8V4h9.8l7.8 7.8a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.3" fill="currentColor"/>',
    clock: '<circle '+P+' cx="12" cy="12" r="9"/><path '+P+' d="M12 7v5l3 2"/>',
    wrench: '<path '+P+' d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8 6.2 21l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.7 2.7-2.6-.4-.4-2.6z"/>',
    heart: '<path '+P+' d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1z"/>',
    mapPin: '<path '+P+' d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle '+P+' cx="12" cy="10" r="3"/>',
    mail: '<rect '+P+' x="2" y="4" width="20" height="16" rx="2"/><path '+P+' d="m2 7 10 6 10-6"/>',
    arrow: '<path '+P+' d="M5 12h14M13 6l6 6-6 6"/>',
    plus: '<path '+P+' d="M12 5v14M5 12h14"/>',
    chevronL: '<path '+P+' d="m15 18-6-6 6-6"/>',
    chevronR: '<path '+P+' d="m9 18 6-6-6-6"/>',
    close: '<path '+P+' d="M18 6 6 18M6 6l12 12"/>',
    menu: '<path '+P+' d="M3 6h18M3 12h18M3 18h18"/>',
    facebook: '<path fill="currentColor" d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"/>',
    instagram: '<rect '+P+' x="2" y="2" width="20" height="20" rx="5"/><circle '+P+' cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/>',
    youtube: '<rect '+P+' x="2" y="5" width="20" height="14" rx="4"/><path fill="currentColor" d="m10 9 5 3-5 3z"/>',
    google: '<path fill="currentColor" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.2c1.9-1.7 3.1-4.4 3.1-7.6z"/><path fill="currentColor" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.6c-.9.6-2 1-3.5 1a6 6 0 0 1-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="currentColor" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9z"/><path fill="currentColor" d="M12 6.1c1.5 0 2.8.5 3.9 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5l3.3 2.6A6 6 0 0 1 12 6.1z"/>',
  };

  function icon(name, cls) {
    var body = ICONS[name] || ICONS.circle;
    return '<svg viewBox="0 0 24 24" aria-hidden="true"' + (cls ? ' class="' + cls + '"' : '') + '>' + body + '</svg>';
  }

  /* ---- Helpers ---------------------------------------------------------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  }); }
  function stars(n) { var s = ""; for (var i = 1; i <= 5; i++) s += icon("star"); return '<span class="stars" aria-label="' + n + ' out of 5 stars">' + s + "</span>"; }
  function initials(name) { return name.split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join("").toUpperCase(); }
  function asset(path) { return path && /^https?:/.test(path) ? path : BASE + path; }

  /* ---- Theme injection -------------------------------------------------- */
  function applyTheme(t) {
    if (!t) return;
    var r = document.documentElement.style;
    if (t.primary)   r.setProperty("--c-primary", t.primary);
    if (t.secondary) r.setProperty("--c-secondary", t.secondary);
    if (t.accent)    r.setProperty("--c-accent", t.accent);
    if (t.emergency) r.setProperty("--c-emergency", t.emergency);
    if (t.surface)   r.setProperty("--c-surface", t.surface);
    if (t.ink)       r.setProperty("--ink", t.ink);
    if (t.muted)     r.setProperty("--muted", t.muted);
    if (t.radius)    r.setProperty("--r-lg", t.radius);
  }

  /* ---- SEO + meta ------------------------------------------------------- */
  function setMeta(name, content, attr) {
    if (!content) return;
    attr = attr || "name";
    var el = document.head.querySelector("meta[" + attr + '="' + name + '"]');
    if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
    el.setAttribute("content", content);
  }
  function applySEO(cfg, page) {
    var seo = cfg.seo || {};
    page = page || {};
    var title = page.title
      ? (seo.titleTemplate ? seo.titleTemplate.replace("%s", page.title) : page.title + " | " + cfg.business.name)
      : (seo.defaultTitle || cfg.business.name);
    var desc = page.description || seo.defaultDescription || cfg.business.tagline;
    document.title = title;
    setMeta("description", desc);
    setMeta("keywords", (seo.keywords || []).join(", "));
    setMeta("theme-color", cfg.theme.primary);
    setMeta("author", cfg.business.legalName || cfg.business.name);
    // Open Graph
    setMeta("og:site_name", cfg.business.name, "property");
    setMeta("og:title", title, "property");
    setMeta("og:description", desc, "property");
    setMeta("og:type", "website", "property");
    setMeta("og:locale", seo.locale || "en_CA", "property");
    if (seo.ogImage) setMeta("og:image", asset(seo.ogImage), "property");
    var relPath = (page.path != null) ? page.path : location.pathname.replace(/^\//, "");
    var canonical = (seo.siteUrl || "").replace(/\/$/, "") + "/" + relPath;
    setMeta("og:url", canonical, "property");
    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", desc);
    if (seo.ogImage) setMeta("twitter:image", asset(seo.ogImage));
    // Canonical link
    var link = document.head.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
    link.href = page.canonical || canonical;
    // Favicon
    if (cfg.business.favicon) {
      var fav = document.head.querySelector('link[rel="icon"]') || document.createElement("link");
      fav.rel = "icon"; fav.type = "image/svg+xml"; fav.href = asset(cfg.business.favicon);
      document.head.appendChild(fav);
    }
  }

  /* ---- JSON-LD structured data ----------------------------------------- */
  function injectSchema(obj, id) {
    var s = document.createElement("script");
    s.type = "application/ld+json";
    if (id) s.id = id;
    s.textContent = JSON.stringify(obj);
    document.head.appendChild(s);
  }
  function buildOpeningHours(hours) {
    var map = { Monday: "Mo", Tuesday: "Tu", Wednesday: "We", Thursday: "Th", Friday: "Fr", Saturday: "Sa", Sunday: "Su" };
    return (hours || []).filter(function (h) { return h.open; }).map(function (h) {
      return { "@type": "OpeningHoursSpecification", dayOfWeek: "https://schema.org/" + h.day, opens: h.open, closes: h.close };
    });
  }
  function localBusinessSchema(cfg, extra) {
    var b = cfg.business, seo = cfg.seo || {};
    var node = {
      "@context": "https://schema.org",
      "@type": "AutoRepair",
      "@id": (seo.siteUrl || "") + "/#business",
      name: b.name, legalName: b.legalName, image: asset((seo.ogImage || b.logo)),
      url: seo.siteUrl, telephone: b.phone, email: b.email, priceRange: "$$",
      address: { "@type": "PostalAddress", streetAddress: b.address.street, addressLocality: b.address.city, addressRegion: b.address.region, postalCode: b.address.postalCode, addressCountry: b.address.countryCode },
      geo: b.geo ? { "@type": "GeoCoordinates", latitude: b.geo.lat, longitude: b.geo.lng } : undefined,
      openingHoursSpecification: buildOpeningHours(b.hours),
      sameAs: (cfg.social || []).map(function (s) { return s.url; }),
      aggregateRating: cfg.review ? { "@type": "AggregateRating", ratingValue: cfg.review.rating, reviewCount: cfg.review.count } : undefined,
      makesOffer: (cfg.services || []).map(function (s) {
        return { "@type": "Offer", itemOffered: { "@type": "Service", name: s.name } };
      })
    };
    if (extra) for (var k in extra) node[k] = extra[k];
    return node;
  }
  function faqSchema(faqs) {
    return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: (faqs || []).map(function (f) {
      return { "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } };
    }) };
  }
  function reviewSchema(cfg) {
    return { "@context": "https://schema.org", "@type": "Product", name: cfg.business.name + " auto repair services",
      aggregateRating: { "@type": "AggregateRating", ratingValue: cfg.review.rating, reviewCount: cfg.review.count },
      review: (cfg.reviews || []).slice(0, 6).map(function (r) {
        return { "@type": "Review", author: { "@type": "Person", name: r.name }, datePublished: r.date,
          reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 }, reviewBody: r.text };
      }) };
  }
  function breadcrumbSchema(cfg, trail) {
    return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: trail.map(function (t, i) {
      return { "@type": "ListItem", position: i + 1, name: t.name, item: (cfg.seo.siteUrl || "") + "/" + (t.path || "") };
    }) };
  }

  /* ---- Public API ------------------------------------------------------- */
  var AppConfig = {
    base: BASE, icon: icon, esc: esc, stars: stars, initials: initials, asset: asset,
    applySEO: applySEO, injectSchema: injectSchema,
    schema: { localBusiness: localBusinessSchema, faq: faqSchema, review: reviewSchema, breadcrumb: breadcrumbSchema },
    data: null
  };

  AppConfig.ready = fetch(BASE + "config.json", { cache: "no-cache" })
    .then(function (r) {
      if (!r.ok) throw new Error("config.json not found (status " + r.status + ")");
      return r.json();
    })
    .then(function (cfg) {
      AppConfig.data = cfg;
      applyTheme(cfg.theme);
      return cfg;
    })
    .catch(function (err) {
      console.error("[AppConfig] " + err.message + " — serve the site over http:// (see docs/DEPLOYMENT.md).");
      throw err;
    });

  window.AppConfig = AppConfig;
})();
