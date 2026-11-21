/*
  HEADER MENU: the "+" button opens the full-screen menu on tablets and phones.
*/
(function () {
  var h = document.querySelector(".gh");
  if (!h) return;
  var t = h.querySelector(".gh__toggle"), p = h.querySelector(".gh__panel");
  if (!t || !p) return;
  function set(open) {
    h.classList.toggle("is-open", open);
    document.documentElement.classList.toggle("gh-lock", open);
    t.setAttribute("aria-expanded", open ? "true" : "false");
    t.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  t.addEventListener("click", function () { set(!h.classList.contains("is-open")); });
  p.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
  window.addEventListener("resize", function () { if (window.innerWidth >= 1024) set(false); });
})();

/*
  MOTION: scroll fade-ins and count-up stats.
  Content is fully visible without JavaScript and for visitors who prefer
  reduced motion, so crawlers and AI engines always read the full page.
*/
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;

  document.documentElement.classList.add("js-motion");

  // 1. Fade-in on scroll (cards stagger)
  var groups = [
    ".section__head", ".stats > div", ".cols > .col", ".steps > .step",
    ".explore > .explore__card", ".final", ".engines", ".hero .book"
  ];
  var items = document.querySelectorAll(groups.join(","));
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

  Array.prototype.forEach.call(items, function (el) {
    var sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    el.style.setProperty("--d", Math.min(sibs, 5) * 0.08 + "s");
    el.classList.add("reveal");
    io.observe(el);
  });

  // 2. Count-up numbers ("51%", "69%", "1 in 3" stays as is)
  var nums = document.querySelectorAll(".stat__num");
  var co = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      co.unobserve(e.target);
      var el = e.target, text = el.textContent.trim();
      var m = text.match(/^(\d+)(\D*)$/);
      if (!m) return;
      var end = parseInt(m[1], 10), suffix = m[2], t0 = null, dur = 1200;
      function tick(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick); else el.textContent = text;
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  Array.prototype.forEach.call(nums, function (n) { co.observe(n); });
})();
