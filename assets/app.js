(function () {
  var pages = Array.prototype.slice.call(document.querySelectorAll(".page"));
  var hints = {
    1: "Жаль. Расскажите, что пошло не так",
    2: "Спасибо, учтём каждое замечание",
    3: "Спасибо! Что можно сделать лучше?",
    4: "Спасибо, рады, что понравилось",
    5: "Отличная партия! Спасибо"
  };
  var ids = pages.map(function (p) { return p.id; });

  function showPage() {
    var name = (location.hash || "#home").slice(1) || "home";
    var anchor = null;
    if (ids.indexOf(name) === -1) {
      var el = document.getElementById(name);
      var host = el && el.closest(".page");
      if (host) { anchor = el; name = host.id; } else { name = "home"; }
    }
    pages.forEach(function (p) { p.classList.toggle("is-active", p.id === name); });
    document.body.setAttribute("data-page", name);
    if (anchor) { anchor.scrollIntoView({ block: "start" }); } else { window.scrollTo(0, 0); }
  }

  if (/[?&]shot=1(?:&|$)/.test(location.search)) document.documentElement.classList.add("shot");
  window.addEventListener("hashchange", showPage);
  showPage();

  // menu tabs: keep page active, scroll to section
  document.querySelectorAll(".tabs a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var t = document.querySelector(a.getAttribute("href"));
      if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
      document.querySelectorAll(".tabs a").forEach(function (x) { x.removeAttribute("style"); });
    });
  });

  // stars
  var stars = Array.prototype.slice.call(document.querySelectorAll(".star"));
  var hint = document.getElementById("rating-hint");
  var rating = 0;
  function paint(v) {
    stars.forEach(function (b) { b.classList.toggle("is-on", Number(b.getAttribute("data-value")) <= v); });
    if (hint) hint.innerHTML = v ? hints[v] : "&nbsp;";
  }
  stars.forEach(function (b) {
    b.addEventListener("click", function () { rating = Number(b.getAttribute("data-value")); paint(rating); });
    b.addEventListener("mouseenter", function () { paint(Number(b.getAttribute("data-value"))); });
  });
  var box = document.querySelector(".stars");
  if (box) box.addEventListener("mouseleave", function () { paint(rating); });
  var m = location.search.match(/[?&]stars=(\d)/);
  if (m) { rating = Number(m[1]); paint(rating); }

  // copy
  var toast = document.getElementById("toast");
  var tt;
  function say(t) {
    if (!toast) return;
    toast.textContent = t; toast.classList.add("is-on");
    clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove("is-on"); }, 1600);
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var a = document.createElement("textarea");
      a.value = text; a.setAttribute("readonly", ""); a.style.position = "fixed"; a.style.left = "-9999px";
      document.body.appendChild(a); a.select(); a.setSelectionRange(0, text.length);
      try { document.execCommand("copy") ? resolve() : reject(); } catch (e) { reject(e); } finally { document.body.removeChild(a); }
    });
  }
  document.querySelectorAll(".copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy") || "";
      copyText(text).then(function () {
        var c = btn.querySelector(".i-copy"), k = btn.querySelector(".i-check"), l = btn.querySelector(".copy__txt");
        btn.classList.add("is-done");
        if (c) c.setAttribute("hidden", ""); if (k) k.removeAttribute("hidden");
        if (l) { l.dataset.prev = l.textContent; l.textContent = l.getAttribute("data-done"); }
        say("Скопировано: " + text);
        setTimeout(function () {
          btn.classList.remove("is-done");
          if (c) c.removeAttribute("hidden"); if (k) k.setAttribute("hidden", "");
          if (l && l.dataset.prev) l.textContent = l.dataset.prev;
        }, 1600);
      }, function () { say("Не удалось скопировать"); });
    });
  });
})();
