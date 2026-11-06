/*
  INTERACTIVE TOOLS
  1. Shortlist test (home, #test): builds buyer prompts from four fields and opens them in AI assistants.
  2. Pipeline model (home, #model): scenario toggle + sliders.
  3. AI Shortlist Scorecard (scorecard.html): self-audit with a live score and top fixes.
  4. Sticky booking bar on phones.
  Everything runs in the browser. Nothing is sent anywhere until the visitor books a call.
*/
(function () {
  var CAL = "https://cal.com/postsearchlabs-kp4ztq/30min?overlayCalendar=true";
  function calWith(notes) { return CAL + "&notes=" + encodeURIComponent(notes); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------- 1. Shortlist test ---------- */
  var tester = $("[data-tester]");
  if (tester) {
    var form = $("[data-tester-form]", tester);
    var list = $("[data-tester-list]", tester);
    var hint = $("[data-tester-hint]", tester);
    var tTitle = $("[data-tally-title]", tester);
    var tText = $("[data-tally-text]", tester);
    var tCta = $("[data-tally-cta]", tester);
    var marks = {};

    var ENGINES = [
      { name: "ChatGPT", url: function (q) { return "https://chatgpt.com/?hints=search&q=" + encodeURIComponent(q); } },
      { name: "Perplexity", url: function (q) { return "https://www.perplexity.ai/search?q=" + encodeURIComponent(q); } },
      { name: "Claude", url: function (q) { return "https://claude.ai/new?q=" + encodeURIComponent(q); } },
      { name: "Google AI Mode", url: function (q) { return "https://www.google.com/search?udm=50&q=" + encodeURIComponent(q); } }
    ];

    function val(name) { return (form.elements[name].value || "").trim(); }

    function prompts() {
      var product = val("product"), cat = val("category"), aud = val("audience"), comp = val("competitor");
      var example = !cat && !aud && !comp && !product;
      var c = cat || "invoicing software", a = aud || "freelancers", k = comp || "FreshBooks", p = product || "";
      var out = [
        "What's the best " + c + " for " + a + "?",
        "Top " + c + " tools for " + a + " right now, compared",
        "What are the best alternatives to " + k + " for " + a + "?",
        p ? (p + " vs " + k + ": which is better for " + a + "?") : ("Is there a better option than " + k + " for " + a + "?"),
        "Which " + c + " do " + a + " recommend on Reddit?"
      ];
      if (p) out.push("What is " + p + ", who is it for, and how much does it cost?");
      return { list: out, example: example };
    }

    function render() {
      var r = prompts();
      hint.textContent = r.example
        ? "Showing example prompts. Type your own details above and the prompts update as you go."
        : "Open each prompt in a private window so your chat history doesn't sway the answer, then mark the result.";
      marks = {};
      list.innerHTML = r.list.map(function (q, i) {
        var runs = ENGINES.map(function (e) {
          return '<a href="' + esc(e.url(q)) + '" target="_blank" rel="noopener">' + esc(e.name) + ' ↗</a>';
        }).join("");
        return '<li class="tprompt">' +
          '<p class="tprompt__q">' + esc(q) + '</p>' +
          '<div class="tprompt__run">' + runs + '<button type="button" data-copy="' + esc(q) + '">Copy</button></div>' +
          '<div class="tprompt__mark"><span>Was your product named?</span>' +
            '<div class="seg" role="group" aria-label="Was your product named for prompt ' + (i + 1) + '">' +
              '<button type="button" data-i="' + i + '" data-v="yes" aria-pressed="false">Named</button>' +
              '<button type="button" data-i="' + i + '" data-v="no" aria-pressed="false">Not named</button>' +
            '</div></div>' +
        '</li>';
      }).join("");
      tally(r.list.length);
    }

    function tally(total) {
      total = total || $all(".tprompt", list).length;
      var done = Object.keys(marks).length, yes = 0;
      Object.keys(marks).forEach(function (k) { if (marks[k] === "yes") yes++; });
      var product = val("product") || "my product";
      if (!done) {
        tTitle.textContent = "Mark each answer to see your result.";
        tText.textContent = "Tip: AI answers change from run to run. On a call we run every prompt several times on six engines and average the result.";
        tCta.href = CAL;
        return;
      }
      tTitle.textContent = "Named in " + yes + " of " + done + " answers" + (done < total ? " so far" : "") + ".";
      if (done < total) tText.textContent = "Keep going. " + (total - done) + " prompt" + (total - done > 1 ? "s" : "") + " left to check.";
      else if (yes === 0) tText.textContent = "AI isn't putting you on the shortlist yet. That's fixable, and the call shows you exactly why it's happening.";
      else if (yes < total) tText.textContent = "You're on some shortlists and missing from others. The gaps usually trace back to a handful of sources AI trusts.";
      else tText.textContent = "Strong start. Now check the other engines and whether AI describes you correctly. The call covers both.";
      tCta.href = calWith("Shortlist test: " + product + " named in " + yes + " of " + done + " answers. Category: " + (val("category") || "-") + ". Competitor: " + (val("competitor") || "-") + ".");
    }

    var timer;
    form.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(render, 250); });
    form.addEventListener("submit", function (e) { e.preventDefault(); render(); });
    list.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.hasAttribute("data-copy")) {
        var text = b.getAttribute("data-copy");
        var done = function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy"; }, 1400); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
        return;
      }
      if (b.hasAttribute("data-v")) {
        var i = b.getAttribute("data-i");
        marks[i] = b.getAttribute("data-v");
        $all('button[data-i="' + i + '"]', list).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        tally();
      }
    });
    render();
  }

  /* ---------- 2. Pipeline model ---------- */
  var calc = $("[data-calc]");
  if (calc) {
    var scen = 0.2;
    var money = function (n) {
      if (n >= 1e6) return "$" + (n / 1e6).toFixed(n >= 1e7 ? 1 : 2).replace(/\.?0+$/, "") + "M";
      if (n >= 1e3) return "$" + Math.round(n / 1e3) + "K";
      return "$" + Math.round(n);
    };
    var full = function (n) { return "$" + Math.round(n).toLocaleString("en-US"); };
    var inp = function (k) { return Number($('[data-in="' + k + '"]', calc).value); };
    var out = function (k, v) { $('[data-out="' + k + '"]', calc).textContent = v; };
    var res = function (k, v) { $('[data-res="' + k + '"]', calc).textContent = v; };

    function update() {
      var demos = inp("demos"), close = inp("close") / 100, acv = inp("acv");
      out("demos", demos); out("close", Math.round(close * 100) + "%"); out("acv", full(acv));
      var extra = demos * scen;
      var custYear = extra * close * 12;
      res("demos", "+" + (extra < 10 ? extra.toFixed(1).replace(/\.0$/, "") : Math.round(extra)));
      res("cust", "+" + Math.round(custYear));
      res("arr", money(custYear * acv));
      res("pipe", money(extra * 12 * acv));
    }
    $all("[data-in]", calc).forEach(function (el) { el.addEventListener("input", update); });
    $all("[data-scen]", calc).forEach(function (b) {
      b.addEventListener("click", function () {
        scen = Number(b.getAttribute("data-scen"));
        $all("[data-scen]", calc).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        update();
      });
    });
    update();
  }

  /* ---------- 3. Scorecard ---------- */
  var quiz = $("[data-quiz]");
  if (quiz) {
    var rows = $all(".qrow", quiz);
    var answers = {};
    var ring = $("[data-score-ring]"), num = $("[data-score-num]"), band = $("[data-score-band]"), sub = $("[data-score-sub]"), cta = $("[data-score-cta]");
    var fixesBox = $("[data-fixes]"), fixesList = $("[data-fixes-list]");

    rows.forEach(function (row, i) {
      var seg = document.createElement("div");
      seg.className = "seg";
      seg.setAttribute("role", "group");
      seg.setAttribute("aria-label", "Answer for question " + (i + 1));
      [["yes", "Yes"], ["partly", "Partly"], ["no", "No / not sure"]].forEach(function (o) {
        var b = document.createElement("button");
        b.type = "button"; b.textContent = o[1];
        b.setAttribute("data-v", o[0]); b.setAttribute("aria-pressed", "false");
        b.addEventListener("click", function () {
          answers[i] = o[0];
          $all("button", seg).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
          score();
        });
        seg.appendChild(b);
      });
      row.appendChild(seg);
    });

    function score() {
      var total = 0, got = 0, done = 0, gaps = [];
      rows.forEach(function (row, i) {
        var w = Number(row.getAttribute("data-w"));
        total += w;
        var a = answers[i];
        if (a) done++;
        if (a === "yes") got += w;
        else if (a === "partly") { got += w / 2; gaps.push({ w: w / 2, row: row, i: i }); }
        else if (a === "no") gaps.push({ w: w, row: row, i: i });
      });
      var pct = Math.round((got / total) * 100);
      ring.style.setProperty("--p", done ? pct : 0);
      num.textContent = done ? pct : "–";
      if (!done) {
        band.textContent = "Answer the questions to see your score.";
        sub.textContent = "12 questions · about 3 minutes · nothing is sent anywhere";
      } else {
        band.textContent = pct >= 70 ? "Shortlist-ready" : pct >= 40 ? "On the edge of the shortlist" : "Mostly invisible to AI";
        sub.textContent = done < rows.length ? (done + " of " + rows.length + " answered. Keep going for a full score.") :
          (pct >= 70 ? "Your foundations are strong. Next step: measure share of voice against competitors."
            : pct >= 40 ? "AI can find you, but competitors give it more reasons to recommend them."
            : "AI has too little to go on. The good news: the first fixes are usually fast.");
      }
      gaps.sort(function (a, b) { return b.w - a.w; });
      var top = gaps.slice(0, 4);
      fixesBox.hidden = !top.length;
      fixesList.innerHTML = top.map(function (g) {
        return "<li><div><h3>" + esc(g.row.getAttribute("data-fix-title")) + "</h3><p>" + esc(g.row.getAttribute("data-fix")) + "</p></div></li>";
      }).join("");
      var gapNames = top.map(function (g) { return g.row.getAttribute("data-fix-title"); }).join("; ");
      cta.href = done ? calWith("AI Shortlist Scorecard: " + pct + "/100 (" + done + "/" + rows.length + " answered). Top gaps: " + (gapNames || "none") + ".") : CAL;
    }
    score();
  }

  /* ---------- 4. Sticky booking bar (phones) ---------- */
  var bar = $("[data-mbar]");
  if (bar) {
    document.body.classList.add("has-mbar");
    var hero = $(".hero");
    var onScroll = function () {
      var past = hero ? hero.getBoundingClientRect().bottom < 0 : window.scrollY > 600;
      var nearEnd = window.innerHeight + window.scrollY > document.documentElement.scrollHeight - 140;
      bar.classList.toggle("is-on", past && !nearEnd);
    };
    var typing = false;
    document.addEventListener("focusin", function (e) { if (e.target.matches("input, textarea")) { typing = true; bar.classList.remove("is-on"); } });
    document.addEventListener("focusout", function () { typing = false; onScroll(); });
    var base = onScroll;
    onScroll = function () { if (typing) return; base(); };
    window.addEventListener("scroll", function () { onScroll(); }, { passive: true });
    onScroll();
  }
})();
