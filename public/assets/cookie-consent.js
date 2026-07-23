/* SkyFrequency — GDPR cookie consent (self-contained, no third-party service).
   Loaded synchronously BEFORE the gtag loader so Google Consent Mode v2
   defaults are in place before Analytics initializes: all storage 'denied'
   until the visitor clicks Accept. Choice is stored for 12 months.
   reCAPTCHA (contact-form spam protection) is treated as strictly necessary.
   No CSS transitions on purpose (see mobile-menu.js note). */
(function () {
  "use strict";
  var KEY = "sf-cookie-consent";           // {v:'granted'|'denied', t:epoch-ms}
  var MAX_AGE = 365 * 24 * 60 * 60 * 1000; // re-ask after 12 months

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }

  function stored() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (!o || !o.v || (Date.now() - (o.t || 0)) > MAX_AGE) return null;
      return o.v;
    } catch (e) { return null; }
  }
  function store(v) {
    try { localStorage.setItem(KEY, JSON.stringify({ v: v, t: Date.now() })); } catch (e) {}
  }

  /* Consent Mode v2 defaults — must run before gtag.js config */
  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
  var choice = stored();
  if (choice === "granted") {
    gtag("consent", "update", { analytics_storage: "granted" });
  }

  function accept() {
    store("granted");
    gtag("consent", "update", { analytics_storage: "granted" });
    hide();
  }
  function decline() {
    store("denied");
    gtag("consent", "update", { analytics_storage: "denied" });
    hide();
  }
  function hide() {
    var el = document.getElementById("sfcc-banner");
    if (el) el.style.display = "none";
  }
  function show() {
    var el = document.getElementById("sfcc-banner");
    if (el) { el.style.display = "block"; return; }
    build();
  }
  window.sfCookiePrefs = show; // programmatic reopen (withdraw/change consent)

  function build() {
    var css =
      "#sfcc-banner{position:fixed;left:0;right:0;bottom:0;z-index:99999;" +
        "background:#192546;color:#fff;box-shadow:0 -6px 24px rgba(0,0,0,.35);" +
        "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}" +
      "#sfcc-banner .sfcc-inner{max-width:1140px;margin:0 auto;padding:18px 20px;" +
        "display:flex;align-items:center;gap:22px;flex-wrap:wrap}" +
      "#sfcc-banner p{margin:0;font-size:13.5px;line-height:1.5;color:#dbe2f0;flex:1 1 420px}" +
      "#sfcc-banner a{color:#2ea3f2;text-decoration:underline}" +
      "#sfcc-banner .sfcc-btns{display:flex;gap:10px;flex-wrap:wrap}" +
      "#sfcc-banner button{font-size:14px;font-weight:700;border-radius:999px;cursor:pointer;" +
        "padding:11px 24px;line-height:1;font-family:inherit}" +
      "#sfcc-accept{background:#F28707;border:2px solid #F28707;color:#fff}" +
      "#sfcc-accept:hover{background:#d97506;border-color:#d97506}" +
      "#sfcc-decline{background:transparent;border:2px solid rgba(255,255,255,.55);color:#fff}" +
      "#sfcc-decline:hover{border-color:#fff}" +
      "@media (max-width:600px){#sfcc-banner .sfcc-inner{padding:14px 16px;gap:12px}" +
        "#sfcc-banner button{flex:1;padding:12px 10px}}";
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    var el = document.createElement("div");
    el.id = "sfcc-banner";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Cookie consent");
    el.innerHTML =
      '<div class="sfcc-inner">' +
      "<p><b>We value your privacy.</b> This site uses strictly necessary cookies " +
      "(for security and our contact form) and, only with your consent, Google Analytics " +
      "cookies to understand how the site is used. You can change your choice any time via " +
      'the "Cookie Preferences" link in the footer. See our ' +
      '<a href="/terms-and-policies/">Terms and Policies</a>.</p>' +
      '<div class="sfcc-btns">' +
      '<button id="sfcc-decline" type="button">Decline</button>' +
      '<button id="sfcc-accept" type="button">Accept All</button>' +
      "</div></div>";
    document.body.appendChild(el);
    document.getElementById("sfcc-accept").addEventListener("click", accept);
    document.getElementById("sfcc-decline").addEventListener("click", decline);
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (stored() === null) build();

    /* footer "Cookie Preferences" link — GDPR: withdrawing must be as easy */
    var foot = document.querySelector(".ast-footer-copyright, .site-footer .ast-container, footer");
    if (foot) {
      var a = document.createElement("a");
      a.href = "#";
      a.textContent = "Cookie Preferences";
      a.style.cssText = "display:inline-block;margin:6px 0 0;font-size:12.5px;text-decoration:underline;cursor:pointer";
      a.addEventListener("click", function (e) { e.preventDefault(); show(); });
      foot.appendChild(a);
    }
  });
})();
