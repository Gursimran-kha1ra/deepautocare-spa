#!/usr/bin/env node
/* ==========================================================================
   tools/seo-build.js — advanced SEO + agentic (AI-agent) visibility.
   Reads config.json and (re)generates, from a single source of truth:
     • index.html  — full static <head>: meta, Open Graph, Twitter, hreflang,
                     geo tags, a rich JSON-LD @graph, and a <noscript> content
                     fallback so search crawlers AND AI agents can read the
                     business without executing JavaScript.
     • robots.txt  — allow-all + explicit welcome for major AI crawlers + sitemap
     • sitemap.xml — homepage entry with lastmod
     • site.webmanifest — installable metadata
     • llms.txt    — Markdown brief for LLM agents (emerging /llms.txt convention)
   Run:  node tools/seo-build.js
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const cfg = JSON.parse(fs.readFileSync(path.join(root, "config.json"), "utf8"));
const b = cfg.business, seo = cfg.seo, site = (seo.siteUrl || "").replace(/\/$/, "");
const abs = (p) => (/^https?:/.test(p) ? p : site + "/" + String(p).replace(/^\//, ""));
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const title = seo.defaultTitle;
const desc = seo.defaultDescription;
const dow = { Monday: "Mo", Tuesday: "Tu", Wednesday: "We", Thursday: "Th", Friday: "Fr", Saturday: "Sa", Sunday: "Su" };
const openingHours = (b.hours || []).filter((h) => h.open).map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: "https://schema.org/" + h.day, opens: h.open, closes: h.close }));
const cities = (cfg.serviceAreas || []).map((a) => a.city);

/* ---------- JSON-LD @graph ---------------------------------------------- */
const graph = [
  {
    "@type": "Organization", "@id": site + "/#org",
    name: b.name, legalName: b.legalName, url: site + "/",
    logo: abs(b.logo), image: abs(seo.ogImage), email: b.email, telephone: b.phone,
    foundingDate: String(b.foundedYear),
    address: { "@type": "PostalAddress", streetAddress: b.address.street, addressLocality: b.address.city, addressRegion: b.address.region, postalCode: b.address.postalCode, addressCountry: b.address.countryCode },
    sameAs: (cfg.social || []).map((s) => s.url),
    contactPoint: [{ "@type": "ContactPoint", telephone: b.phone, contactType: "customer service", areaServed: b.address.countryCode, availableLanguage: ["en"] }]
  },
  {
    "@type": "WebSite", "@id": site + "/#website",
    name: b.name, url: site + "/", inLanguage: seo.locale ? seo.locale.replace("_", "-") : "en-CA",
    publisher: { "@id": site + "/#org" }
  },
  {
    "@type": ["AutoRepair", "LocalBusiness"], "@id": site + "/#business",
    name: b.name, image: abs(seo.ogImage), logo: abs(b.logo), url: site + "/",
    telephone: b.phone, email: b.email, priceRange: "$$", currenciesAccepted: "CAD",
    parentOrganization: { "@id": site + "/#org" },
    address: { "@type": "PostalAddress", streetAddress: b.address.street, addressLocality: b.address.city, addressRegion: b.address.region, postalCode: b.address.postalCode, addressCountry: b.address.countryCode },
    geo: b.geo ? { "@type": "GeoCoordinates", latitude: b.geo.lat, longitude: b.geo.lng } : undefined,
    hasMap: b.mapsLink, openingHoursSpecification: openingHours,
    areaServed: cities.map((c) => ({ "@type": "City", name: c })),
    aggregateRating: cfg.review ? { "@type": "AggregateRating", ratingValue: cfg.review.rating, reviewCount: cfg.review.count, bestRating: 5 } : undefined,
    makesOffer: (cfg.services || []).map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.name, description: s.short } })),
    sameAs: (cfg.social || []).map((s) => s.url)
  },
  {
    "@type": "WebPage", "@id": site + "/#webpage",
    url: site + "/", name: title, description: desc,
    isPartOf: { "@id": site + "/#website" }, about: { "@id": site + "/#business" },
    primaryImageOfPage: abs(seo.ogImage), inLanguage: seo.locale ? seo.locale.replace("_", "-") : "en-CA"
  },
  {
    "@type": "BreadcrumbList", "@id": site + "/#breadcrumb",
    itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: site + "/" }]
  }
].concat(
  (cfg.services || []).map((s) => ({
    "@type": "Service", name: s.name, description: s.description || s.short,
    serviceType: s.name, provider: { "@id": site + "/#business" },
    areaServed: cities.map((c) => ({ "@type": "City", name: c }))
  }))
);
const jsonld = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2);

/* ---------- <noscript> content fallback --------------------------------- */
const hoursLines = (b.hours || []).map((h) => `${h.day}: ${h.open ? h.open + "–" + h.close : "Closed"}`).join("<br>");
const svcLines = (cfg.services || []).map((s) => `<li><strong>${esc(s.name)}</strong> — ${esc(s.short)}</li>`).join("\n        ");
const noscript = `<noscript>
    <div style="max-width:820px;margin:0 auto;padding:2rem 1rem;font-family:system-ui,sans-serif">
      <h1>${esc(b.name)} — ${esc(b.tagline)}</h1>
      <p>${esc(desc)}</p>
      <p><strong>Call:</strong> <a href="tel:${esc(b.phone)}">${esc(b.phoneDisplay)}</a> ·
         <strong>Text:</strong> <a href="sms:${esc(b.sms)}">${esc(b.phoneDisplay)}</a> ·
         <strong>Email:</strong> <a href="mailto:${esc(b.email)}">${esc(b.email)}</a></p>
      <p><strong>Address:</strong> ${esc(b.address.street)}, ${esc(b.address.city)}, ${esc(b.address.region)} ${esc(b.address.postalCode)}, ${esc(b.address.country)}</p>
      <p><strong>Hours:</strong><br>${hoursLines}</p>
      <h2>Services</h2>
      <ul>
        ${svcLines}
      </ul>
      <p><strong>Service areas:</strong> ${cities.map(esc).join(", ")}</p>
      <p>This site works best with JavaScript enabled. Please call or email us directly.</p>
    </div>
  </noscript>`;

/* ---------- index.html --------------------------------------------------- */
const html = `<!DOCTYPE html>
<html lang="${(seo.locale || "en_CA").split("_")[0]}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- Primary meta -->
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="keywords" content="${esc((seo.keywords || []).join(", "))}">
  <meta name="author" content="${esc(b.legalName || b.name)}">
  <meta name="publisher" content="${esc(b.legalName || b.name)}">
  <link rel="canonical" href="${site}/">
  <link rel="alternate" hreflang="${(seo.locale || "en_CA").replace("_", "-")}" href="${site}/">

  <!-- Crawler + AI-agent directives -->
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1">

  <!-- Geo -->
  <meta name="geo.region" content="${b.address.countryCode}-${b.address.region}">
  <meta name="geo.placename" content="${esc(b.address.city)}, ${esc(b.address.region)}">
  <meta name="geo.position" content="${b.geo.lat};${b.geo.lng}">
  <meta name="ICBM" content="${b.geo.lat}, ${b.geo.lng}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(b.name)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${site}/">
  <meta property="og:locale" content="${seo.locale || "en_CA"}">
  <meta property="og:image" content="${abs(seo.ogImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(b.name)} — ${esc(b.tagline)}">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image" content="${abs(seo.ogImage)}">
  <meta name="twitter:image:alt" content="${esc(b.name)}">

  <!-- Icons / theme / manifest -->
  <meta name="theme-color" content="${b.address ? cfg.theme.primary : "#0E1116"}">
  <link rel="icon" type="image/svg+xml" href="${b.favicon}">
  <link rel="apple-touch-icon" href="${b.favicon}">
  <link rel="mask-icon" href="${b.favicon}" color="${cfg.theme.accent}">
  <link rel="manifest" href="site.webmanifest">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">

  <!-- Styles -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/spa.css">

  <!-- Structured data (static so crawlers & AI agents read it without JS) -->
  <script type="application/ld+json">
${jsonld}
  </script>
</head>
<body>
  <script>window.__BASE__ = "";</script>

  <div data-mount="header"></div>

  <main id="app"><!-- sections render here from config.json --></main>

  <div data-mount="footer"></div>
  <div data-mount="fabs"></div>

  ${noscript}

  <script src="js/config.js"></script>
  <script src="js/components.js"></script>
  <script src="js/gallery.js"></script>
  <script src="js/booking.js"></script>
  <script src="js/spa.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer></script>
</body>
</html>
`;
fs.writeFileSync(path.join(root, "index.html"), html);
console.log("wrote index.html (with static JSON-LD + noscript)");

/* ---------- robots.txt (welcome AI crawlers) ---------------------------- */
const aiBots = ["GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "anthropic-ai", "Claude-Web", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot", "Bytespider", "Amazonbot", "Meta-ExternalAgent", "cohere-ai"];
const robots = `# robots.txt — ${b.name}
User-agent: *
Allow: /

# Explicitly welcome AI answer engines & agents (agentic visibility)
${aiBots.map((ua) => `User-agent: ${ua}\nAllow: /`).join("\n\n")}

Sitemap: ${site}/sitemap.xml
`;
fs.writeFileSync(path.join(root, "robots.txt"), robots);
console.log("wrote robots.txt");

/* ---------- sitemap.xml ------------------------------------------------- */
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${site}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image><image:loc>${abs(seo.ogImage)}</image:loc></image:image>
  </url>
</urlset>
`;
fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap);
console.log("wrote sitemap.xml");

/* ---------- site.webmanifest -------------------------------------------- */
const manifest = {
  name: b.name, short_name: b.shortName || b.name, description: desc,
  start_url: "/", display: "standalone", background_color: cfg.theme.primary,
  theme_color: cfg.theme.primary, lang: (seo.locale || "en_CA").replace("_", "-"),
  icons: [{ src: b.favicon, sizes: "any", type: "image/svg+xml", purpose: "any" }]
};
fs.writeFileSync(path.join(root, "site.webmanifest"), JSON.stringify(manifest, null, 2));
console.log("wrote site.webmanifest");

/* ---------- llms.txt (AI agent brief) ----------------------------------- */
const llms = `# ${b.name}

> ${b.tagline}

${desc}

## Business
- Name: ${b.name}
- Type: Auto repair shop / mechanic
- Founded: ${b.foundedYear}
- Rating: ${cfg.review.rating}/5 from ${cfg.review.count} ${cfg.review.platform} reviews

## Contact
- Phone: ${b.phoneDisplay} (${b.phone})
- Text/SMS: ${b.phoneDisplay}
- Email: ${b.email}
- Address: ${b.address.street}, ${b.address.city}, ${b.address.region} ${b.address.postalCode}, ${b.address.country}
- Website: ${site}/
- Directions: ${b.mapsLink}

## Hours
${(b.hours || []).map((h) => `- ${h.day}: ${h.open ? h.open + "–" + h.close : "Closed"}`).join("\n")}
${b.emergency247 ? "- Roadside assistance: 24/7" : ""}

## Services
${(cfg.services || []).map((s) => `- ${s.name}: ${s.short}`).join("\n")}

## Service areas
${(cfg.serviceAreas || []).map((a) => `- ${a.city}${a.neighbourhoods && a.neighbourhoods.length ? " (" + a.neighbourhoods.join(", ") + ")" : ""}`).join("\n")}

## How to book
Call or text ${b.phoneDisplay}, email ${b.email}, or use the contact form at ${site}/#contact
`;
fs.writeFileSync(path.join(root, "llms.txt"), llms);
console.log("wrote llms.txt");

console.log("\nSEO build complete.");
