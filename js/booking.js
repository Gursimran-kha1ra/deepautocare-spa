/* ==========================================================================
   booking.js — renders + validates the appointment / contact form.
   Looks for [data-form="booking"] or [data-form="contact"] and builds the
   fields, validates on submit, and shows an inline success state.
   Wire a real backend by setting booking.endpoint in config.json.
   ========================================================================== */
(function () {
  "use strict";
  var A = window.AppConfig, esc = A.esc, icon = A.icon;

  function options(arr) { return arr.map(function (v) { return '<option value="' + esc(v) + '">' + esc(v) + "</option>"; }).join(""); }
  function field(opts) {
    var id = opts.id, req = opts.required ? '<span class="req" aria-hidden="true">*</span>' : "";
    var attrs = (opts.required ? "required " : "") + (opts.attrs || "");
    var control;
    if (opts.type === "select") {
      control = '<select id="' + id + '" name="' + id + '" ' + attrs + '><option value="">Choose…</option>' + options(opts.values) + "</select>";
    } else if (opts.type === "textarea") {
      control = '<textarea id="' + id + '" name="' + id + '" placeholder="' + esc(opts.placeholder || "") + '" ' + attrs + "></textarea>";
    } else {
      control = '<input id="' + id + '" name="' + id + '" type="' + (opts.type || "text") + '" placeholder="' + esc(opts.placeholder || "") + '" ' + attrs + ">";
    }
    return '<div class="field ' + (opts.full ? "full" : "") + '"><label for="' + id + '">' + esc(opts.label) + req + "</label>"
      + control + '<span class="err">' + esc(opts.err || "Please complete this field.") + "</span></div>";
  }

  function build(cfg, mode) {
    var bk = cfg.booking || {}, years = [];
    var y = new Date().getFullYear() + 1;
    for (var i = 0; i < 40; i++) years.push(String(y - i));
    var serviceVals = mode === "contact" ? bk.services : bk.services;

    var fields = [
      field({ id: "name", label: "Full name", required: true, placeholder: "Jane Smith" }),
      field({ id: "phone", label: "Phone number", type: "tel", required: true, placeholder: cfg.business.phoneDisplay, err: "Enter a valid phone number." }),
      field({ id: "email", label: "Email address", type: "email", required: true, placeholder: "you@email.com", err: "Enter a valid email." }),
      field({ id: "make", label: "Vehicle make", placeholder: "Honda" }),
      field({ id: "model", label: "Vehicle model", placeholder: "Civic" }),
      field({ id: "year", label: "Vehicle year", type: "select", values: years }),
      field({ id: "service", label: "Service needed", type: "select", values: serviceVals, required: true, full: mode !== "contact" })
    ];
    if (mode !== "contact") {
      fields.push(field({ id: "date", label: "Preferred date", type: "date", required: true, attrs: 'min="' + new Date().toISOString().slice(0, 10) + '"' }));
      fields.push(field({ id: "time", label: "Preferred time", type: "select", values: bk.times || [] }));
    }
    fields.push(field({ id: "message", label: "Anything else we should know?", type: "textarea", full: true, placeholder: "Describe the issue, noises, warning lights…" }));

    return '<form class="form-grid" novalidate data-built>' + fields.join("")
      + '<div class="full">'
      +   '<button type="submit" class="btn btn--accent btn--lg btn--block">' + (mode === "contact" ? "Send message" : "Request appointment") + icon("arrow") + '</button>'
      +   '<p class="form-note mt-1">' + icon("check") + ' No spam. We reply within one business hour during opening times.</p>'
      + '</div></form>'
      + '<div class="form-success" role="status" aria-live="polite">' + icon("check-circle") + '<div><strong>Request received.</strong><br><span class="success-msg"></span></div></div>';
  }

  function validate(form) {
    var ok = true;
    form.querySelectorAll(".field").forEach(function (f) { f.classList.remove("invalid"); });
    form.querySelectorAll("[required]").forEach(function (el) {
      var val = el.value.trim(), bad = !val;
      if (!bad && el.type === "email") bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!bad && el.type === "tel") bad = val.replace(/[^0-9]/g, "").length < 7;
      if (bad) { el.closest(".field").classList.add("invalid"); ok = ok && false; if (ok === false && !form.__focused) { el.focus(); form.__focused = true; } }
    });
    form.__focused = false;
    return ok;
  }

  function init(cfg) {
    var hosts = document.querySelectorAll("[data-form]");
    hosts.forEach(function (host) {
      var mode = host.getAttribute("data-form");
      host.innerHTML = build(cfg, mode);
      var form = host.querySelector("form"), success = host.querySelector(".form-success");

      // Prefill service from ?service= query
      var qs = new URLSearchParams(location.search).get("service");
      if (qs) { var sel = form.querySelector("#service"); if (sel) { for (var i = 0; i < sel.options.length; i++) { if (sel.options[i].value === qs) { sel.selectedIndex = i; break; } } } }

      // Live: clear error when user fixes a field
      form.addEventListener("input", function (e) { var fl = e.target.closest(".field"); if (fl) fl.classList.remove("invalid"); });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validate(form)) return;
        var endpoint = (cfg.booking || {}).endpoint;
        var done = function () {
          form.style.display = "none";
          success.querySelector(".success-msg").textContent = (cfg.booking || {}).successMessage || "We'll be in touch shortly.";
          success.classList.add("show");
          success.scrollIntoView({ behavior: "smooth", block: "center" });
        };
        if (endpoint) {
          var data = Object.fromEntries(new FormData(form).entries());
          fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
            .then(done).catch(function () { done(); /* still confirm to user; log server-side */ });
        } else {
          done(); // demo mode — connect a backend in config.booking.endpoint
        }
      });
    });
  }

  window.BookingForm = { init: init };
})();
