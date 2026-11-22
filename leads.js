/*
  LEAD FORM ("AI visibility check" on the home page)
  1. The website box in the hero copies the site into the form below and scrolls to it.
  2. The form saves each submission to the "website_leads" table in Supabase.
     The key below is Supabase's public "publishable" key. It can only add a row to
     that table; it cannot read, change or delete anything.
  To see your leads: Supabase dashboard > project "agencyos" > Table editor > website_leads.
*/
(function () {
  var SUPABASE_URL = "https://jbthimqagqthsoraffyl.supabase.co";
  var SUPABASE_KEY = "sb_publishable_M4MbmkOciErD-UV8A9GSMw_BEWVk7rj";
  var TABLE = "website_leads";

  var EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

  function clean(v, max) { return String(v || "").trim().replace(/\s+/g, " ").slice(0, max); }
  function normSite(v) {
    v = clean(v, 300);
    if (v && !/^https?:\/\//i.test(v)) v = "https://" + v;
    return v;
  }
  function looksLikeSite(v) { return /^https?:\/\/[^\s\/.]+(\.[^\s\/.]+)*\.[a-z]{2,}([\/?#]\S*)?$/i.test(v); }
  function reduceMotion() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  var form = document.querySelector("[data-lead-form]");
  var siteForm = document.querySelector("[data-site-form]");

  /* 1. Hero website box */
  if (siteForm) {
    var siteInput = siteForm.elements.namedItem("website");
    var hint = document.querySelector("[data-site-hint]");
    siteForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = normSite(siteInput.value);
      if (!looksLikeSite(v)) {
        siteForm.classList.add("is-invalid");
        if (hint) hint.hidden = false;
        siteInput.focus();
        return;
      }
      siteForm.classList.remove("is-invalid");
      if (hint) hint.hidden = true;
      if (form) form.elements.namedItem("website").value = v;
      var target = document.querySelector("#audit .audit__grid") || document.getElementById("audit");
      if (target) target.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
      if (form) setTimeout(function () {
        try { form.elements.namedItem("full_name").focus({ preventScroll: true }); } catch (err) {}
      }, reduceMotion() ? 0 : 700);
    });
    siteInput.addEventListener("input", function () {
      siteForm.classList.remove("is-invalid");
      if (hint) hint.hidden = true;
    });
  }

  /* 2. The form */
  if (!form) return;
  var field = function (name) { return form.elements.namedItem(name); };
  var errorBox = form.querySelector(".lead__error");
  var button = form.querySelector(".lead__submit");
  var buttonLabel = button.querySelector("span");
  var done = form.parentElement.querySelector(".lead__done");
  var openedAt = Date.now();

  function fail(message, el) {
    errorBox.textContent = message;
    errorBox.hidden = false;
    if (el) { el.setAttribute("aria-invalid", "true"); el.focus(); }
  }
  Array.prototype.forEach.call(form.querySelectorAll("input, select"), function (el) {
    el.addEventListener("input", function () { el.removeAttribute("aria-invalid"); errorBox.hidden = true; });
    el.addEventListener("change", function () { el.removeAttribute("aria-invalid"); });
  });

  function utm() {
    var out = {};
    try {
      var p = new URLSearchParams(window.location.search);
      ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref"].forEach(function (k) {
        var v = p.get(k);
        if (v) out[k] = v.slice(0, 120);
      });
    } catch (e) {}
    return out;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorBox.hidden = true;

    // Bots fill the hidden field or submit instantly. Pretend it worked and drop it.
    if (field("company_fax").value || Date.now() - openedAt < 2500) { showDone(); return; }

    var data = {
      website: normSite(field("website").value),
      full_name: clean(field("full_name").value, 120),
      email: clean(field("email").value, 254).toLowerCase(),
      role: clean(field("role").value, 80),
      stage: clean(field("stage").value, 80),
      product: clean(field("product").value, 300),
      competitors: clean(field("competitors").value, 300) || null,
      timezone: (function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone.slice(0, 64); } catch (err) { return null; } })(),
      page: window.location.pathname.slice(0, 200),
      referrer: document.referrer ? document.referrer.slice(0, 500) : null,
      utm: utm()
    };

    if (!looksLikeSite(data.website)) return fail("Please enter your company website, for example https://yourstartup.com.", field("website"));
    if (!data.full_name) return fail("Please enter your name.", field("full_name"));
    if (!EMAIL_RE.test(data.email)) return fail("Please enter a valid work email.", field("email"));
    if (!data.role) return fail("Please choose your role.", field("role"));
    if (!data.stage) return fail("Please choose your company stage.", field("stage"));
    if (!data.product) return fail("Please tell us in one line what your product does.", field("product"));

    button.disabled = true;
    buttonLabel.textContent = "Sending…";

    fetch(SUPABASE_URL + "/rest/v1/" + TABLE, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(data)
    }).then(function (res) {
      if (!res.ok) throw new Error("Status " + res.status);
      showDone(data);
    }).catch(function () {
      button.disabled = false;
      buttonLabel.textContent = "Get my AI visibility check";
      fail("Sorry, that didn't go through. Please check your connection and try again in a minute.");
    });
  });

  function showDone(data) {
    data = data || {
      full_name: field("full_name").value,
      website: field("website").value,
      email: field("email").value
    };
    var first = clean(data.full_name, 120).split(" ")[0] || "there";
    done.querySelector("[data-done-name]").textContent = first;
    done.querySelector("[data-done-site]").textContent = String(data.website || "your site").replace(/^https?:\/\//i, "");
    done.querySelector("[data-done-email]").textContent = data.email || "your email";
    form.hidden = true;
    done.hidden = false;
    done.focus();
  }
})();
