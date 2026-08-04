/* SkyFrequency — shared slide/fade rotator.
   Used by the home services carousel (.sf-svc-carousel) and the About
   testimonial slider (.sf-tsl). Slides are absolutely stacked; this script
   sizes the viewport to the tallest slide and rotates on a timer.
   CSS transitions do the slide+fade in real browsers; a settle timer also
   clears transient classes so environments without transitions end correct. */
(function () {
  "use strict";
  if (window.__sfWidgetsLoaded) return;
  window.__sfWidgetsLoaded = true;

  function initRotator(root, opts) {
    var viewport = root.querySelector(opts.viewport);
    var slides = [].slice.call(root.querySelectorAll(opts.slide));
    var dotsWrap = root.querySelector(opts.dots);
    if (!viewport || slides.length < 2) return;

    var current = 0, timer = null, settle = null;

    var dots = [];
    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Go to slide " + (i + 1));
        if (i === 0) b.className = "is-on";
        b.addEventListener("click", function () { go(i, true); });
        dotsWrap.appendChild(b);
        dots.push(b);
      });
    }

    function sizeViewport() {
      var h = 0;
      slides.forEach(function (sl) { h = Math.max(h, sl.offsetHeight); });
      if (h) viewport.style.height = h + "px";
    }

    function go(n, manual, dir) {
      n = (n + slides.length) % slides.length;
      if (n === current) return;
      dir = dir || 1; /* 1 = forward (leave left), -1 = back (leave right) */
      var prev = slides[current], next = slides[n];
      clearTimeout(settle);
      slides.forEach(function (sl) { sl.classList.remove("is-leaving", "is-leaving-r", "from-left"); });
      prev.classList.remove("is-active");
      prev.classList.add(dir < 0 ? "is-leaving-r" : "is-leaving");
      if (dir < 0) { next.classList.add("from-left"); void next.offsetWidth; }
      next.classList.add("is-active");
      dots.forEach(function (d, i) { d.className = i === n ? "is-on" : ""; });
      current = n;
      settle = setTimeout(function () {
        slides.forEach(function (sl) { sl.classList.remove("is-leaving", "is-leaving-r", "from-left"); });
      }, 700);
      if (manual) restart();
    }

    if (opts.arrows) {
      var mk = function (cls, glyph, label, dir) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "sf-rot-arrow " + cls;
        b.setAttribute("aria-label", label);
        b.innerHTML = glyph;
        b.addEventListener("click", function () { go(current + dir, true, dir); });
        root.appendChild(b);
      };
      mk("sf-rot-prev", "&#10094;", "Previous slide", -1);
      mk("sf-rot-next", "&#10095;", "Next slide", 1);
    }

    function tick() { go(current + 1, false); }
    function start() { stop(); timer = setInterval(tick, opts.interval); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { start(); }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);

    sizeViewport();
    window.addEventListener("resize", sizeViewport);
    // re-measure once images finish loading
    [].slice.call(root.querySelectorAll("img")).forEach(function (im) {
      if (!im.complete) im.addEventListener("load", sizeViewport);
    });
    setTimeout(sizeViewport, 400);
    start();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var svc = document.querySelector(".sf-svc-carousel");
    if (svc) initRotator(svc, { viewport: ".sf-svc-viewport", slide: ".sf-svc-slide", dots: ".sf-svc-dots", arrows: true, interval: 3500 });
    var tsl = document.querySelector(".sf-tsl");
    if (tsl) initRotator(tsl, { viewport: ".sf-tsl-viewport", slide: ".sf-tsl-slide", dots: ".sf-tsl-dots", arrows: true, interval: 7000 });

    /* Contact form: Structured Cabling / Invoice Management have no Salesforce
       checkbox fields, so fold those selections into the message text. */
    var form = document.querySelector("form.sf_form_light");
    if (form && form.querySelector(".sf-extra-interest")) {
      form.addEventListener("submit", function () {
        var picked = [].slice.call(form.querySelectorAll(".sf-extra-interest:checked"))
          .map(function (b) { return b.getAttribute("data-label"); });
        if (!picked.length) return;
        var msg = form.querySelector('[name="00N3i00000DG6r0"]');
        if (msg && msg.value.indexOf("Also interested in:") === -1) {
          msg.value = (msg.value ? msg.value + "\n\n" : "") + "Also interested in: " + picked.join(", ");
        }
      });
    }
  });
})();
