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

/* Home page chapters: turn each [data-tabs] group into tabs. Without this script the panels simply stack.
   A link to an id inside a panel (for example #how or #model) opens that tab first. */
(function () {
  var groups = document.querySelectorAll("[data-tabs]");
  if (!groups.length) return;
  var openers = {};

  Array.prototype.forEach.call(groups, function (group) {
    var list = group.querySelector("[data-tabs-list]");
    var tabs = Array.prototype.slice.call(list.querySelectorAll("[data-tab]"));
    var panels = tabs.map(function (t) { return group.querySelector('[data-panel="' + t.getAttribute("data-tab") + '"]'); });

    function select(i, focus) {
      tabs.forEach(function (t, j) {
        var on = j === i;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
      });
      if (focus) tabs[i].focus();
      if (tabs[i].scrollIntoView && list.scrollWidth > list.clientWidth) {
        list.scrollLeft = Math.max(0, tabs[i].offsetLeft - 16);
      }
      // swipe rows inside the newly shown panel measure themselves on resize
      try { window.dispatchEvent(new Event("resize")); } catch (e) {}
    }

    list.setAttribute("role", "tablist");
    tabs.forEach(function (t, i) {
      var p = panels[i];
      t.id = "tab-" + p.id;
      t.setAttribute("role", "tab");
      t.setAttribute("aria-controls", p.id);
      p.setAttribute("role", "tabpanel");
      p.setAttribute("aria-labelledby", t.id);
      openers[p.id] = function () { select(i); return group; };
      t.addEventListener("click", function () { select(i); });
      t.addEventListener("keydown", function (e) {
        var k = e.key, n = tabs.length, to = -1;
        if (k === "ArrowRight") to = (i + 1) % n;
        else if (k === "ArrowLeft") to = (i + n - 1) % n;
        else if (k === "Home") to = 0;
        else if (k === "End") to = n - 1;
        if (to > -1) { e.preventDefault(); select(to, true); }
      });
    });
    group.classList.add("tabs--on");
    select(0);
  });

  // Returns the tab group if the id lives in a panel, after opening that panel.
  function open(hash) {
    var id = "";
    try { id = decodeURIComponent(String(hash || "").replace(/^#/, "")); } catch (e) {}
    var el = id && document.getElementById(id);
    var panel = el && el.closest(".tabs__panel");
    return panel && openers[panel.id] ? openers[panel.id]() : null;
  }
  function go(hash) {
    var group = open(hash);
    if (group) group.scrollIntoView();
    return !!group;
  }

  go(location.hash);
  // The signal map and the tools change the page height once they start, so line the tab up again
  // when everything has loaded, unless the visitor has already started scrolling.
  var touched = false;
  ["wheel", "touchstart", "keydown", "mousedown"].forEach(function (type) {
    window.addEventListener(type, function () { touched = true; }, { passive: true, once: true });
  });
  window.addEventListener("load", function () {
    if (touched || !location.hash) return;
    go(location.hash);
    setTimeout(function () { if (!touched) go(location.hash); }, 400);
  });
  window.addEventListener("hashchange", function () { go(location.hash); });
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href*="#"]');
    if (!a || a.target === "_blank") return;
    var url;
    try { url = new URL(a.href); } catch (err) { return; }
    if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
    if (!open(url.hash)) return;
    e.preventDefault();
    if (location.hash !== url.hash) history.pushState(null, "", url.hash);
    go(url.hash);
  });
})();
