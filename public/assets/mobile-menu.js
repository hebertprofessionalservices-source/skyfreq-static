/* Sky Frequency — mobile menu replacement.
   Astra's flyout nav is broken in the static mirror (missing flyout CSS + icon
   font), so mobile-fix.css hides it and this script provides a solid, branded
   slide-in panel built from the same nav links. No dependencies. */
(function () {
  "use strict";
  if (window.__sfMenuLoaded) return;
  window.__sfMenuLoaded = true;

  var NAVY = "#192546";
  var BLUE = "#2ea3f2";

  document.addEventListener("DOMContentLoaded", function () {
    var srcMenu = document.querySelector(".main-header-menu");
    var toggle = document.querySelector(".menu-toggle.main-header-menu-toggle");
    if (!srcMenu || !toggle) return;

    /* ---- styles ---- */
    /* No CSS transitions here on purpose: the menu must work even where
       transitions are throttled or disabled (reduced-motion, frozen rAF). */
    var css =
      "#sfmenu-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:99980;" +
        "display:none}" +
      "#sfmenu-panel{position:fixed;top:0;left:0;height:100%;width:min(300px,82vw);" +
        "background:" + NAVY + ";z-index:99981;overflow-y:auto;padding:24px 0 40px;" +
        "display:none;box-sizing:border-box;" +
        "box-shadow:4px 0 24px rgba(0,0,0,.45);" +
        "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}" +
      "body.sfmenu-open #sfmenu-backdrop{display:block}" +
      "body.sfmenu-open #sfmenu-panel{display:block}" +
      "body.sfmenu-open{overflow:hidden}" +
      "#sfmenu-close{position:absolute;top:10px;right:10px;background:none;border:none;" +
        "color:#fff;font-size:26px;cursor:pointer;padding:6px 10px;line-height:1}" +
      "#sfmenu-panel .sfmenu-logo{display:block;padding:8px 26px 18px;border-bottom:1px solid rgba(255,255,255,.12)}" +
      "#sfmenu-panel .sfmenu-logo img{max-width:170px;height:auto}" +
      "#sfmenu-panel a.sfmenu-link{display:block;color:#fff;text-decoration:none;font-size:17px;" +
        "font-weight:600;padding:14px 26px;border-bottom:1px solid rgba(255,255,255,.08)}" +
      "#sfmenu-panel a.sfmenu-sub{font-size:14.5px;font-weight:400;padding:10px 26px 10px 42px;" +
        "border-bottom:none;background:#10192f}" +
      "#sfmenu-panel a.sfmenu-link:hover,#sfmenu-panel a.sfmenu-current{color:" + BLUE + " !important}" +
      "#sfmenu-panel .sfmenu-call{display:block;margin:22px 26px 0;background:" + BLUE + ";color:#fff;" +
        "text-align:center;font-weight:700;font-size:16px;text-decoration:none;padding:13px 0;border-radius:6px}";
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    /* ---- build panel from the (hidden) Astra nav so links stay in sync ---- */
    var backdrop = document.createElement("div");
    backdrop.id = "sfmenu-backdrop";

    var panel = document.createElement("nav");
    panel.id = "sfmenu-panel";
    panel.setAttribute("aria-label", "Mobile navigation");

    var html = '<button id="sfmenu-close" aria-label="Close menu">✕</button>';
    var logo = document.querySelector(".site-logo-img img");
    if (logo) {
      html += '<a class="sfmenu-logo" href="/"><img src="' + logo.src + '" alt="Sky Frequency"></a>';
    }
    var here = location.pathname.replace(/\/+$/, "/") || "/";
    srcMenu.querySelectorAll(":scope > .menu-item").forEach(function (li) {
      var a = li.querySelector(":scope > a");
      if (!a) return;
      var path = new URL(a.href, location.origin).pathname;
      var cur = path === here ? " sfmenu-current" : "";
      html += '<a class="sfmenu-link' + cur + '" href="' + a.href + '">' + a.textContent.trim() + "</a>";
      li.querySelectorAll(".sub-menu a").forEach(function (sa) {
        var spath = new URL(sa.href, location.origin).pathname;
        var scur = spath === here ? " sfmenu-current" : "";
        html += '<a class="sfmenu-link sfmenu-sub' + scur + '" href="' + sa.href + '">' + sa.textContent.trim() + "</a>";
      });
    });
    html += '<a class="sfmenu-call" href="tel:601-707-7228">Call 601-707-7228</a>';
    panel.innerHTML = html;

    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    /* ---- toggle wiring: intercept Astra's button before its own JS runs ---- */
    function open()  { document.body.classList.add("sfmenu-open", "ast-main-header-nav-open"); }
    function close() { document.body.classList.remove("sfmenu-open", "ast-main-header-nav-open"); }
    function isOpen() { return document.body.classList.contains("sfmenu-open"); }

    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      isOpen() ? close() : open();
    }, true);

    backdrop.addEventListener("click", close);
    panel.querySelector("#sfmenu-close").addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) close();
    });
  });

  /* ---- 2026 hero CTA ----
     The redesigned single-column heroes lost the old white CTA card, so add an
     inline button (styled by brand-2026.css). Skipped on pages where a
     "contact us" CTA is redundant. */
  document.addEventListener("DOMContentLoaded", function () {
    var skip = ["/contact-us/", "/thank-you/", "/bill-pay/", "/terms-and-policies/"];
    if (skip.indexOf(location.pathname) !== -1) return;
    var wrap = document.querySelector(
      '[data-elementor-type="wp-page"], [data-elementor-type="wp-post"][data-elementor-post-type="page"]');
    if (!wrap) return;
    var hero = wrap.querySelector(":scope > .elementor-section, :scope > .elementor-top-section");
    if (!hero || hero.querySelector(".sf-hero-cta")) return;
    var col = hero.querySelector(".elementor-column .elementor-widget-wrap");
    if (!col) return;
    var a = document.createElement("a");
    a.className = "sf-hero-cta";
    a.href = "/contact-us/";
    a.textContent = "Get a Free Consultation";
    col.appendChild(a);
  });
})();
