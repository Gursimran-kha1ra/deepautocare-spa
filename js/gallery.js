/* ==========================================================================
   gallery.js — masonry render + filters + lightbox, and before/after sliders.
   - [data-gallery]      → renders filterable masonry + lightbox from config.gallery
   - [data-before-after] → renders draggable comparison sliders from config.beforeAfter
   ========================================================================== */
(function () {
  "use strict";
  var A = window.AppConfig, esc = A.esc, icon = A.icon, asset = A.asset;

  /* ---- Masonry gallery + lightbox -------------------------------------- */
  function initGallery(cfg) {
    var host = document.querySelector("[data-gallery]");
    if (!host) return;
    var g = cfg.gallery || { categories: [], images: [] };
    var cats = g.categories && g.categories.length ? g.categories : ["All"];

    var filters = cats.map(function (c, i) {
      return '<button class="gal-filter' + (i === 0 ? " active" : "") + '" data-cat="' + esc(c) + '">' + esc(c) + "</button>";
    }).join("");

    var items = g.images.map(function (img, i) {
      return '<figure class="gal-item" data-cat="' + esc(img.category) + '" data-i="' + i + '" tabindex="0" role="button" aria-label="View ' + esc(img.alt) + '">'
        + '<img src="' + asset(img.src) + '" alt="' + esc(img.alt) + '" loading="lazy" decoding="async">'
        + '<figcaption class="gal-cap">' + esc(img.alt) + '</figcaption></figure>';
    }).join("");

    host.innerHTML = '<div class="gal-filters" role="tablist">' + filters + '</div><div class="masonry" id="masonry">' + items + '</div>';

    // Lightbox
    var lb = document.createElement("div");
    lb.className = "lightbox"; lb.setAttribute("aria-hidden", "true");
    lb.innerHTML = '<button class="lb-close" aria-label="Close">' + icon("close") + '</button>'
      + '<button class="lb-nav lb-prev" aria-label="Previous">' + icon("chevronL") + '</button>'
      + '<img alt=""><button class="lb-nav lb-next" aria-label="Next">' + icon("chevronR") + '</button>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector("img"), idx = 0, visible = g.images.map(function (_, i) { return i; });

    function show(i) {
      idx = (i + visible.length) % visible.length;
      var img = g.images[visible[idx]];
      lbImg.src = asset(img.src); lbImg.alt = img.alt;
      lb.classList.add("open"); lb.setAttribute("aria-hidden", "false");
    }
    function close() { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); }

    host.addEventListener("click", function (e) {
      var fig = e.target.closest(".gal-item"); if (fig) { var realI = +fig.getAttribute("data-i"); show(visible.indexOf(realI)); }
    });
    host.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("gal-item")) { e.preventDefault(); show(visible.indexOf(+e.target.getAttribute("data-i"))); }
    });
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close(); if (e.key === "ArrowRight") show(idx + 1); if (e.key === "ArrowLeft") show(idx - 1);
    });

    // Filters
    host.querySelector(".gal-filters").addEventListener("click", function (e) {
      var btn = e.target.closest(".gal-filter"); if (!btn) return;
      host.querySelectorAll(".gal-filter").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var cat = btn.getAttribute("data-cat");
      visible = [];
      host.querySelectorAll(".gal-item").forEach(function (fig) {
        var match = cat === "All" || fig.getAttribute("data-cat") === cat;
        fig.style.display = match ? "" : "none";
        if (match) visible.push(+fig.getAttribute("data-i"));
      });
    });
  }

  /* ---- Before / After sliders ------------------------------------------ */
  function initBeforeAfter(cfg) {
    var host = document.querySelector("[data-before-after]");
    if (!host || !cfg.beforeAfter) return;
    host.innerHTML = '<div class="grid cols-3">' + cfg.beforeAfter.map(function (ba) {
      return '<div data-reveal>'
        + '<div class="ba-slider" aria-label="Before and after: ' + esc(ba.title) + '">'
        +   '<img class="ba-before" src="' + asset(ba.before) + '" alt="Before: ' + esc(ba.alt) + '" loading="lazy">'
        +   '<img class="ba-after" src="' + asset(ba.after) + '" alt="After: ' + esc(ba.alt) + '" loading="lazy">'
        +   '<span class="ba-tag left">Before</span><span class="ba-tag right">After</span>'
        +   '<span class="ba-handle" aria-hidden="true"></span>'
        + '</div><p class="chip" style="margin-top:.8rem">' + esc(ba.title) + '</p></div>';
    }).join("") + '</div>';

    host.querySelectorAll(".ba-slider").forEach(function (sl) {
      var after = sl.querySelector(".ba-after"), handle = sl.querySelector(".ba-handle"), dragging = false;
      function set(x) {
        var rect = sl.getBoundingClientRect();
        var pct = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
        after.style.clipPath = "inset(0 0 0 " + pct + "%)";
        handle.style.left = pct + "%";
      }
      var start = function () { dragging = true; };
      var end = function () { dragging = false; };
      var move = function (e) { if (!dragging) return; set(e.touches ? e.touches[0].clientX : e.clientX); };
      sl.addEventListener("mousedown", function (e) { start(); set(e.clientX); });
      sl.addEventListener("touchstart", function (e) { start(); set(e.touches[0].clientX); }, { passive: true });
      window.addEventListener("mousemove", move); window.addEventListener("touchmove", move, { passive: true });
      window.addEventListener("mouseup", end); window.addEventListener("touchend", end);
    });
  }

  window.Gallery = { init: initGallery, initBeforeAfter: initBeforeAfter };
})();
