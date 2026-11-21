/*
  DAY / NIGHT MODE
  Loaded in the <head> of every page so the saved choice applies before the page paints.
  Until a visitor clicks the toggle, the site follows their device setting.
  The choice is kept in the browser (localStorage "psl_theme"); nothing is sent anywhere.
  Any element with [data-theme-toggle] switches the mode.
*/
(function () {
  var KEY = "psl_theme";
  var root = document.documentElement;
  var system = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function saved() {
    try {
      var v = localStorage.getItem(KEY);
      return v === "dark" || v === "light" ? v : null;
    } catch (e) { return null; }
  }
  function current() {
    return root.getAttribute("data-theme") || (system && system.matches ? "dark" : "light");
  }

  var choice = saved();
  if (choice) root.setAttribute("data-theme", choice);

  function sync() {
    var label = current() === "dark" ? "Switch to day mode" : "Switch to night mode";
    Array.prototype.forEach.call(document.querySelectorAll("[data-theme-toggle]"), function (b) {
      b.hidden = false;
      b.setAttribute("aria-label", label);
      b.setAttribute("title", label);
    });
  }

  function toggle() {
    var next = current() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
    sync();
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("[data-theme-toggle]")) toggle();
  });
  if (system && system.addEventListener) system.addEventListener("change", sync);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", sync);
  else sync();

  window.PSLTheme = {
    get: current,
    toggle: toggle,
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} root.removeAttribute("data-theme"); sync(); }
  };
})();
