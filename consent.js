/*
  COOKIE CONSENT
  Paste the ID of each tracking tool you use between the quotes. A tool loads ONLY
  after the visitor allows its category in the cookie banner, and stops again if
  they withdraw. Leave an ID empty ("") if you don't use that tool. The cookie
  policy page (cookies.html) only lists the tools that have an ID here.

  To gate any other script, write it like this (category "analytics" or "marketing"):
    <script type="text/plain" data-consent="analytics" src="https://..."></script>

  After adding a new tool, raise CONSENT_VERSION by 1 so every visitor is asked again.
*/
var CONSENT_TOOLS = {
  ga4: "",       // Google Analytics 4 Measurement ID, e.g. "G-XXXXXXXXXX"   (Analytics)
  clarity: "",   // Microsoft Clarity project ID, e.g. "abcd1234ef"        (Analytics)
  linkedin: "",  // LinkedIn Insight Tag partner ID, e.g. "1234567"        (Marketing)
  metaPixel: ""  // Meta (Facebook) Pixel ID, e.g. "123456789012345"       (Marketing)
};
var CONSENT_VERSION = 1;

(function () {
  var COOKIE = "psl_consent";
  var MAX_AGE = 60 * 60 * 24 * 180; // 6 months, then we ask again
  var POLICY_URL = "/cookies";
  var CATEGORY = { ga4: "analytics", clarity: "analytics", linkedin: "marketing", metaPixel: "marketing" };
  var COOKIES = {
    analytics: [/^_ga($|_)/, /^_gid$/, /^_gat/, /^_clck$/, /^_clsk$/],
    marketing: [/^_fbp$/, /^_fbc$/, /^li_fat_id$/, /^_gcl_/]
  };

  /* Google Consent Mode v2: everything off until the visitor chooses. */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  if (!window.gtag) window.gtag = gtag;
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500
  });

  function toolId(name) { return String(CONSENT_TOOLS[name] || "").trim(); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  /* Stored choice */
  function read() {
    var m = document.cookie.match(new RegExp("(?:^|;\\s*)" + COOKIE + "=([^;]*)"));
    if (!m) return null;
    try {
      var c = JSON.parse(decodeURIComponent(m[1]));
      if (c && c.v === CONSENT_VERSION) return { analytics: c.a === 1, marketing: c.m === 1, time: c.t };
    } catch (e) {}
    return null;
  }
  function write(c) {
    var value = encodeURIComponent(JSON.stringify({ v: CONSENT_VERSION, a: c.analytics ? 1 : 0, m: c.marketing ? 1 : 0, t: Date.now() }));
    document.cookie = COOKIE + "=" + value + "; Max-Age=" + MAX_AGE + "; Path=/; SameSite=Lax" + (location.protocol === "https:" ? "; Secure" : "");
  }

  /* Remove first-party tracking cookies for categories the visitor turned off */
  function clearCookies(category) {
    var parts = location.hostname.split("."), domains = [""];
    for (var i = 0; i < parts.length - 1; i++) domains.push("; Domain=." + parts.slice(i).join("."));
    each(document.cookie.split(";"), function (pair) {
      var name = pair.split("=")[0].trim();
      var match = COOKIES[category].some(function (re) { return re.test(name); });
      if (!match) return;
      domains.forEach(function (d) { document.cookie = name + "=; Max-Age=0; Path=/" + d; });
    });
  }

  /* Tool loaders, each runs at most once per page */
  var loaded = {};
  function addScript(src) {
    var s = document.createElement("script");
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }
  var LOADERS = {
    ga4: function (id) {
      addScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id));
      gtag("js", new Date());
      gtag("config", id);
    },
    clarity: function (id) {
      window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
      addScript("https://www.clarity.ms/tag/" + encodeURIComponent(id));
      window.clarity("consent");
    },
    linkedin: function (id) {
      window._linkedin_partner_id = id;
      window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
      window._linkedin_data_partner_ids.push(id);
      if (!window.lintrk) {
        window.lintrk = function (a, b) { window.lintrk.q.push([a, b]); };
        window.lintrk.q = [];
      }
      addScript("https://snap.licdn.com/li.lms-analytics/insight.min.js");
    },
    metaPixel: function (id) {
      if (!window.fbq) {
        var n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!window._fbq) window._fbq = n;
        n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
        addScript("https://connect.facebook.net/en_US/fbevents.js");
      }
      window.fbq("init", id);
      window.fbq("track", "PageView");
    }
  };

  /* <script type="text/plain" data-consent="..."> blocks */
  function activateScripts(c) {
    each(document.querySelectorAll('script[type="text/plain"][data-consent]'), function (old) {
      var category = old.getAttribute("data-consent");
      if (!c[category]) return;
      var s = document.createElement("script");
      each(old.attributes, function (a) {
        if (a.name !== "type" && a.name !== "data-consent") s.setAttribute(a.name, a.value);
      });
      s.setAttribute("data-consent-ran", category);
      if (!old.src) s.text = old.text;
      old.parentNode.replaceChild(s, old);
    });
  }

  var state = null;
  function apply(c) {
    state = c;
    gtag("consent", "update", {
      analytics_storage: c.analytics ? "granted" : "denied",
      ad_storage: c.marketing ? "granted" : "denied",
      ad_user_data: c.marketing ? "granted" : "denied",
      ad_personalization: c.marketing ? "granted" : "denied"
    });
    Object.keys(LOADERS).forEach(function (name) {
      var id = toolId(name);
      if (id && c[CATEGORY[name]] && !loaded[name]) {
        loaded[name] = true;
        LOADERS[name](id);
      }
    });
    if (!c.analytics) clearCookies("analytics");
    if (!c.marketing) clearCookies("marketing");
    activateScripts(c);
    updateStatus();
    try { document.dispatchEvent(new CustomEvent("psl:consent", { detail: { analytics: c.analytics, marketing: c.marketing } })); } catch (e) {}
  }

  function choose(c) {
    write(c);
    apply(c);
    hide();
    // A tracker that already ran keeps running until the page reloads, so reload after a withdrawal.
    var stillRunning = Object.keys(loaded).some(function (name) { return !c[CATEGORY[name]]; }) ||
      ["analytics", "marketing"].some(function (cat) {
        return !c[cat] && document.querySelector('script[data-consent-ran="' + cat + '"]');
      });
    if (stillRunning) location.reload();
  }

  /* Banner */
  var box, prefs, toggles = {}, mainBtn, opener;

  function build() {
    box = document.createElement("div");
    box.className = "cc";
    box.id = "cookie-consent";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "false");
    box.setAttribute("aria-labelledby", "cc-title");
    box.setAttribute("aria-describedby", "cc-desc");
    box.tabIndex = -1;
    box.hidden = true;
    box.innerHTML =
      '<h2 class="cc__title" id="cc-title">Cookie preferences</h2>' +
      '<p class="cc__text" id="cc-desc">We use cookies to improve the site and measure what’s working, as described in our <a href="' + POLICY_URL + '">Cookie Policy</a>. You can opt out of certain cookies.</p>' +
      '<div class="cc__prefs" id="cc-prefs" hidden>' +
        '<div class="cc__opt"><span class="cc__opt-text"><strong>Necessary</strong><small>Keeps the site working and remembers this choice.</small></span><span class="cc__always">Always on</span></div>' +
        '<label class="cc__opt"><span class="cc__opt-text"><strong>Analytics</strong><small>Shows us which pages help visitors, using anonymous usage stats.</small></span><input class="cc__switch" type="checkbox" role="switch" data-cc-toggle="analytics"></label>' +
        '<label class="cc__opt"><span class="cc__opt-text"><strong>Marketing</strong><small>Lets ad platforms such as LinkedIn measure our campaigns.</small></span><input class="cc__switch" type="checkbox" role="switch" data-cc-toggle="marketing"></label>' +
      '</div>' +
      '<div class="cc__actions">' +
        '<button type="button" class="cc__btn cc__btn--light" data-cc="accept">Accept all</button>' +
        '<button type="button" class="cc__btn cc__btn--light" data-cc="reject">Reject all</button>' +
        '<button type="button" class="cc__btn cc__btn--dark" data-cc="customize" aria-controls="cc-prefs" aria-expanded="false">Customize</button>' +
      '</div>';
    document.body.appendChild(box);
    prefs = box.querySelector(".cc__prefs");
    mainBtn = box.querySelector('[data-cc="customize"]');
    each(box.querySelectorAll("[data-cc-toggle]"), function (el) { toggles[el.getAttribute("data-cc-toggle")] = el; });

    box.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-cc]");
      if (!btn) return;
      var action = btn.getAttribute("data-cc");
      if (action === "accept") choose({ analytics: true, marketing: true });
      else if (action === "reject") choose({ analytics: false, marketing: false });
      else if (action === "customize") {
        if (prefs.hidden) showPrefs(true);
        else choose({ analytics: toggles.analytics.checked, marketing: toggles.marketing.checked });
      }
    });
    box.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && state) hide();
    });
  }

  function showPrefs(focus) {
    toggles.analytics.checked = !!(state && state.analytics);
    toggles.marketing.checked = !!(state && state.marketing);
    prefs.hidden = false;
    mainBtn.textContent = "Save preferences";
    mainBtn.setAttribute("aria-expanded", "true");
    mainBtn.classList.add("is-save");
    if (focus) toggles.analytics.focus({ preventScroll: true });
  }

  function show(withPrefs) {
    if (!box) build();
    if (withPrefs) showPrefs(false);
    else {
      prefs.hidden = true;
      mainBtn.textContent = "Customize";
      mainBtn.setAttribute("aria-expanded", "false");
      mainBtn.classList.remove("is-save");
    }
    box.hidden = false;
    requestAnimationFrame(function () { box.classList.add("is-in"); });
  }

  function hide() {
    if (!box || box.hidden) return;
    box.classList.remove("is-in");
    box.hidden = true;
    if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    opener = null;
  }

  function open(fromEl) {
    opener = fromEl || document.activeElement;
    show(true);
    box.focus({ preventScroll: true });
  }

  /* Cookie policy page: list only the tools in use and show the current choice */
  function updateStatus() {
    each(document.querySelectorAll("[data-cc-status]"), function (el) {
      el.textContent = state
        ? "Your current choice: Analytics " + (state.analytics ? "on" : "off") + ", Marketing " + (state.marketing ? "on" : "off") + "."
        : "You haven’t made a choice yet, so only necessary cookies are used.";
    });
  }
  function syncPolicyPage() {
    each(document.querySelectorAll("[data-cc-tool]"), function (row) {
      row.hidden = !toolId(row.getAttribute("data-cc-tool"));
    });
    each(document.querySelectorAll("[data-cc-cat]"), function (group) {
      var inUse = group.querySelector("[data-cc-tool]:not([hidden])");
      each(group.querySelectorAll("[data-cc-table]"), function (t) { t.hidden = !inUse; });
      each(group.querySelectorAll("[data-cc-none]"), function (n) { n.hidden = !!inUse; });
    });
    updateStatus();
  }

  var saved = read();
  if (saved) apply(saved);

  function init() {
    if (state) activateScripts(state); // scripts further down the page
    syncPolicyPage();
    document.addEventListener("click", function (e) {
      var link = e.target.closest("[data-cookie-settings]");
      if (!link) return;
      e.preventDefault();
      open(link);
    });
    if (!state) show(false);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.PSLConsent = {
    get: function () { return state ? { analytics: state.analytics, marketing: state.marketing } : null; },
    open: function () { open(); },
    reset: function () { document.cookie = COOKIE + "=; Max-Age=0; Path=/"; location.reload(); }
  };
})();
