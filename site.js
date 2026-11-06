/*
  VIDEO SETUP
  Paste each page's video link between the quotes.
  Works with: YouTube embed links (https://www.youtube.com/embed/VIDEO_ID),
  Vimeo (https://player.vimeo.com/video/ID), Loom (https://www.loom.com/embed/ID)
  or a direct .mp4 file link.
*/
var VIDEOS = {
  home: ""
};

(function () {
  var boxes = document.querySelectorAll("[data-video]");
  Array.prototype.forEach.call(boxes, function (box) {
    var btn = box.querySelector(".video__play");
    var note = box.querySelector(".video__note");
    var poster = box.querySelector(".video__poster");
    if (!btn || !poster) return;

    btn.addEventListener("click", function () {
      var src = (VIDEOS[box.getAttribute("data-video")] || "").trim();
      if (!src) {
        if (note) note.hidden = false;
        return;
      }
      var el;
      if (/\.(mp4|webm|mov)(\?|#|$)/i.test(src)) {
        el = document.createElement("video");
        el.src = src;
        el.controls = true;
        el.autoplay = true;
        el.playsInline = true;
      } else {
        el = document.createElement("iframe");
        el.src = src + (src.indexOf("?") > -1 ? "&" : "?") + "autoplay=1&playsinline=1";
        el.title = "PostSearchLabs video";
        el.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
        el.setAttribute("allowfullscreen", "");
      }
      poster.replaceWith(el);
    });
  });
})();

/* Mobile menu, sticky header that hides while scrolling down, swipe-row dots */
(function () {
  var header = document.querySelector(".site-header");
  var btn = document.querySelector(".menu-btn");
  var links = document.querySelector(".nav__links");
  if (btn && links) {
    var setOpen = function (open) {
      links.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open && header) header.classList.remove("is-hidden");
    };
    btn.addEventListener("click", function () { setOpen(btn.getAttribute("aria-expanded") !== "true"); });
    links.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
    document.addEventListener("click", function (e) { if (!e.target.closest(".site-header")) setOpen(false); });
  }

  if (header) {
    var lastY = window.scrollY, ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY, open = links && links.classList.contains("is-open");
        if (!open && window.innerWidth <= 860) {
          if (y > lastY + 6 && y > 120) header.classList.add("is-hidden");
          else if (y < lastY - 6 || y < 120) header.classList.remove("is-hidden");
        } else header.classList.remove("is-hidden");
        lastY = y; ticking = false;
      });
    }, { passive: true });
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-swipe]"), function (row) {
    var items = row.children;
    if (items.length < 2) return;
    var dots = document.createElement("div");
    dots.className = "dots";
    dots.setAttribute("aria-hidden", "true");
    for (var i = 0; i < items.length; i++) dots.appendChild(document.createElement("span"));
    row.after(dots);
    var update = function () {
      var w = items[0].getBoundingClientRect().width + 12;
      var idx = Math.round(row.scrollLeft / (w || 1));
      if (row.scrollLeft + row.clientWidth >= row.scrollWidth - 4) idx = items.length - 1;
      Array.prototype.forEach.call(dots.children, function (d, j) { d.classList.toggle("is-on", j === idx); });
      dots.style.display = row.scrollWidth > row.clientWidth + 4 ? "" : "none";
    };
    row.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });
})();
