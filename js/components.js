/* ==========================================================================
   components.js — shared chrome + reusable builders.
   Renders header, footer, floating action buttons and wires up global
   behavior (sticky header, mobile menu, scroll reveal). Also exposes
   Components.* builders that page scripts reuse so markup stays DRY.
   ========================================================================== */
(function () {
  "use strict";
  var A = window.AppConfig, icon = A.icon, esc = A.esc, asset = A.asset;

  var NAV = [
    { label: "Home", href: "index.html" },
    { label: "Services", href: "services.html" },
    { label: "About", href: "about.html" },
    { label: "Gallery", href: "gallery.html" },
    { label: "Reviews", href: "reviews.html" },
    { label: "FAQ", href: "faq.html" },
    { label: "Contact", href: "contact.html" }
  ];

  function currentPage() {
    var f = location.pathname.split("/").pop();
    return f && f.length ? f : "index.html";
  }

  /* ---- Header ----------------------------------------------------------- */
  function header(cfg) {
    var b = cfg.business, cur = currentPage();
    var links = NAV.map(function (n) {
      var active = n.href === cur ? ' aria-current="page"' : "";
      return '<a href="' + A.base + n.href + '"' + active + ">" + esc(n.label) + "</a>";
    }).join("");
    return ''
      + '<a class="skip-link" href="#main">Skip to content</a>'
      + '<header class="site-header" id="siteHeader"><div class="container nav">'
      +   '<a class="brand" href="' + A.base + 'index.html" aria-label="' + esc(b.name) + ' home">'
      +     '<span class="brand-mark">' + esc(b.shortName ? b.shortName[0] : b.name[0]) + '</span>'
      +     '<span>' + esc(b.name) + '</span>'
      +   '</a>'
      +   '<nav class="nav-links" id="navLinks" aria-label="Primary">' + links + '</nav>'
      +   '<div class="nav-cta">'
      +     '<a class="nav-phone" href="tel:' + esc(b.phone) + '">' + icon("phone") + '<span>' + esc(b.phoneDisplay) + '</span></a>'
      +     '<a class="btn btn--accent" href="' + A.base + 'book.html">Book now</a>'
      +     '<button class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false" aria-controls="navLinks">' + icon("menu") + '</button>'
      +   '</div>'
      + '</div></header>';
  }

  /* ---- Footer ----------------------------------------------------------- */
  function footer(cfg) {
    var b = cfg.business;
    var serviceLinks = (cfg.services || []).slice(0, 6).map(function (s) {
      return '<li><a href="' + A.base + 'services.html#' + s.id + '">' + esc(s.name) + "</a></li>";
    }).join("");
    var areaLinks = (cfg.serviceAreas || []).map(function (a) {
      return '<li><a href="' + A.base + 'locations/' + a.slug + '.html">Auto repair in ' + esc(a.city) + "</a></li>";
    }).join("");
    var pageLinks = NAV.concat([{ label: "Book appointment", href: "book.html" }]).map(function (n) {
      return '<li><a href="' + A.base + n.href + '">' + esc(n.label) + "</a></li>";
    }).join("");
    var social = (cfg.social || []).map(function (s) {
      return '<a href="' + esc(s.url) + '" aria-label="' + esc(s.label) + '" rel="noopener" target="_blank">' + icon(s.platform) + "</a>";
    }).join("");
    var hoursToday = todayHours(b.hours);

    return '<footer class="site-footer"><div class="container">'
      + '<div class="footer-grid">'
      +   '<div>'
      +     '<div class="footer-brand"><span class="brand-mark">' + icon("wrench") + '</span><span>' + esc(b.name) + '</span></div>'
      +     '<p style="max-width:34ch">' + esc(b.tagline) + '</p>'
      +     (hoursToday ? '<p class="chip" style="margin-top:1rem">' + hoursToday + '</p>' : "")
      +     '<div class="footer-social">' + social + '</div>'
      +   '</div>'
      +   '<div><h4>Services</h4><ul class="footer-links" role="list">' + serviceLinks + '</ul></div>'
      +   '<div><h4>Service areas</h4><ul class="footer-links" role="list">' + areaLinks + '</ul></div>'
      +   '<div><h4>Visit us</h4><div class="footer-contact">'
      +     '<a href="' + esc(b.mapsLink) + '" target="_blank" rel="noopener">' + icon("mapPin") + '<span>' + esc(b.address.street) + ', ' + esc(b.address.city) + ', ' + esc(b.address.region) + ' ' + esc(b.address.postalCode) + '</span></a>'
      +     '<a href="tel:' + esc(b.phone) + '">' + icon("phone") + '<span>' + esc(b.phoneDisplay) + '</span></a>'
      +     '<a href="mailto:' + esc(b.email) + '">' + icon("mail") + '<span>' + esc(b.email) + '</span></a>'
      +   '</div></div>'
      + '</div>'
      + '<div class="footer-bottom">'
      +   '<span>&copy; ' + new Date().getFullYear() + ' ' + esc(b.legalName || b.name) + '. All rights reserved.</span>'
      +   '<span class="flex-wrap-gap"><a href="' + A.base + 'privacy.html">Privacy</a> <a href="' + A.base + 'terms.html">Terms</a> ' + licenseText(b) + '</span>'
      + '</div>'
      + '</div></footer>';
  }

  function licenseText(b) {
    if (!b.licenses || !b.licenses.length) return "";
    return '<span style="opacity:.7">' + b.licenses.map(function (l) { return esc(l.label) + (l.number && l.number !== "On staff" ? " #" + esc(l.number) : ""); }).join(" · ") + "</span>";
  }

  function todayHours(hours) {
    if (!hours) return "";
    var names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var today = names[new Date().getDay()];
    var h = hours.filter(function (x) { return x.day === today; })[0];
    if (!h) return "";
    return h.open ? "Open today · " + fmt(h.open) + "–" + fmt(h.close) : "Closed today";
  }
  function fmt(t) {
    if (!t) return "";
    var p = t.split(":"), hh = +p[0], m = p[1];
    var ap = hh >= 12 ? "pm" : "am"; var h12 = hh % 12 || 12;
    return h12 + (m !== "00" ? ":" + m : "") + ap;
  }

  /* ---- Floating action buttons + mobile bar ----------------------------- */
  function fabs(cfg) {
    var b = cfg.business, html = '<div class="fab-stack">';
    html += '<a class="fab fab--call" href="tel:' + esc(b.phone) + '" aria-label="Call ' + esc(b.name) + '">' + icon("phone") + '<span class="fab-tip">Call us</span></a>';
    html += '<a class="fab fab--sms" href="sms:' + esc(b.sms) + '" aria-label="Text us">' + icon("message") + '<span class="fab-tip">Text us</span></a>';
    if (b.whatsapp && b.whatsapp.enabled) {
      var wa = b.whatsapp.number.replace(/[^0-9]/g, "");
      var msg = encodeURIComponent(b.whatsapp.presetMessage || "");
      html += '<a class="fab fab--wa" href="https://wa.me/' + wa + (msg ? "?text=" + msg : "") + '" target="_blank" rel="noopener" aria-label="WhatsApp us">' + icon("whatsapp") + '<span class="fab-tip">WhatsApp</span></a>';
    }
    html += '</div>';
    html += '<div class="mobile-bar">'
      + '<a class="mb-call" href="tel:' + esc(b.phone) + '">' + icon("phone") + 'Call now</a>'
      + '<a class="mb-book" href="' + A.base + 'book.html">' + icon("check") + 'Book</a>'
      + '</div>';
    return html;
  }

  /* ---- Behavior --------------------------------------------------------- */
  function wire() {
    var header = document.getElementById("siteHeader");
    var onScroll = function () { if (header) header.classList.toggle("is-stuck", window.scrollY > 12); };
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

    var toggle = document.getElementById("navToggle"), nav = document.getElementById("navLinks");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      });
      nav.addEventListener("click", function (e) { if (e.target.tagName === "A") nav.classList.remove("open"); });
    }
    initReveal();
  }

  function initReveal() {
    var els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach(function (el) { el.classList.add("in"); }); return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- Reusable builders (used by page scripts) ------------------------- */
  var Components = {
    header: header, footer: footer, fabs: fabs, wire: wire, initReveal: initReveal,
    nav: NAV,

    /* Mounts chrome into placeholders and wires behavior. */
    mountChrome: function (cfg) {
      var h = document.querySelector("[data-mount=header]"); if (h) h.innerHTML = header(cfg);
      var f = document.querySelector("[data-mount=footer]"); if (f) f.innerHTML = footer(cfg);
      var fb = document.querySelector("[data-mount=fabs]"); if (fb) fb.innerHTML = fabs(cfg);
      wire();
    },

    serviceCard: function (s, cfg) {
      var price = s.priceFrom != null
        ? '<span class="price">From <b>$' + s.priceFrom + '</b></span>'
        : '<span class="price">Custom quote</span>';
      return '<article class="card svc-card" id="' + esc(s.id) + '" data-reveal>'
        + '<div class="svc-icon">' + icon(s.icon) + '</div>'
        + '<h3>' + esc(s.name) + '</h3>'
        + '<p class="svc-desc">' + esc(s.short) + '</p>'
        + '<ul class="svc-benefits">' + (s.benefits || []).map(function (x) { return '<li>' + icon("check") + '<span>' + esc(x) + '</span></li>'; }).join("") + '</ul>'
        + '<div class="svc-foot">' + price
        +   '<a class="svc-link" href="' + A.base + 'book.html?service=' + encodeURIComponent(s.name) + '">Book ' + icon("arrow") + '</a>'
        + '</div></article>';
    },

    reviewCard: function (r) {
      return '<article class="card review-card" data-reveal>'
        + A.stars(r.rating)
        + '<p class="r-text">"' + esc(r.text) + '"</p>'
        + '<div class="r-meta"><span class="avatar">' + A.initials(r.name) + '</span>'
        + '<span><span class="r-name">' + esc(r.name) + '</span><br><span class="r-vehicle">' + esc(r.vehicle || "Verified customer") + '</span></span></div>'
        + '</article>';
    },

    ratingSummary: function (cfg) {
      var rv = cfg.review;
      return '<div class="rating-summary"><span class="big">' + rv.rating + '</span>'
        + '<span>' + A.stars(rv.rating) + '<br><span class="src">' + rv.count + ' ' + esc(rv.platform) + ' reviews</span></span></div>';
    },

    faqList: function (faqs) {
      return '<div class="faq-list">' + faqs.map(function (f) {
        return '<details class="faq-item" data-reveal><summary class="faq-q">' + esc(f.q)
          + '<span class="faq-ic">' + icon("plus") + '</span></summary><div class="faq-a">' + esc(f.a) + '</div></details>';
      }).join("") + '</div>';
    },

    mapEmbed: function (cfg) {
      return '<div class="map-wrap"><iframe src="' + esc(cfg.business.mapsEmbed) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map to ' + esc(cfg.business.name) + '" allowfullscreen></iframe></div>';
    }
  };

  window.Components = Components;
})();
