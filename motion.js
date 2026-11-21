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
