/* =============================================================
   Shazeeda's Brews & Bites — menu app
   - Loads from a published Google Sheet (CSV) if configured,
     else from local data/menu.json.
   - Caches the last good menu so repeat scans load instantly and
     a network/sheet hiccup never shows a blank page.
   - Hides sold-out / discontinued items completely.
   - Adds: search, sticky category tabs + scroll-spy, contact
     buttons, open/closed badge + hours, item tags, back-to-top.
   ============================================================= */
(function () {
  "use strict";

  var cfg = window.MENU_CONFIG || {};
  var FEAT = cfg.FEATURES || {};
  var CURRENCY = cfg.CURRENCY || "$";
  var CACHE_KEY = "sbb_menu_cache_v1";
  var DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  var menuEl = document.getElementById("menu");
  var catnavEl = document.getElementById("catnav");
  var searchWrap = document.getElementById("search-wrap");
  var searchEl = document.getElementById("search");

  var state = { items: [], query: "", cats: [] };

  // ---- Boot ------------------------------------------------------------
  setFooterYear();
  renderBusinessInfo();
  renderStatusBadge();
  setupScrollTop();
  setupSearch();
  setupScrollSpy();
  loadMenu();

  // ====================================================================
  //  Menu loading (cache → live, with graceful fallback)
  // ====================================================================
  function loadMenu() {
    var cached = readCache();
    if (cached && cached.length) {
      state.items = cached;
      renderMenu();
    }

    var useSheet = cfg.SHEET_CSV_URL && cfg.SHEET_CSV_URL.trim() !== "";
    var url = useSheet ? cfg.SHEET_CSV_URL : cfg.LOCAL_DATA_URL;

    fetchData(url, useSheet)
      .then(onFresh)
      .catch(function (err) {
        console.warn("Primary menu source failed:", err);
        if (useSheet) {
          fetchData(cfg.LOCAL_DATA_URL, false).then(onFresh).catch(function (e) {
            if (!state.items.length) showError(e);
          });
        } else if (!state.items.length) {
          showError(err);
        }
      });
  }

  function onFresh(items) {
    if (!Array.isArray(items) || !items.length) {
      if (!state.items.length) renderMenu(); // shows empty-state
      return;
    }
    state.items = items;
    writeCache(items);
    renderMenu();
  }

  function fetchData(url, isCsv) {
    return fetch(url, { cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text().then(function (text) {
        return isCsv ? parseCsv(text) : JSON.parse(text).items;
      });
    });
  }

  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      return JSON.parse(raw).items || null;
    } catch (e) { return null; }
  }
  function writeCache(items) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items: items }));
    } catch (e) { /* private mode / quota — ignore */ }
  }

  // ====================================================================
  //  Filtering & grouping
  // ====================================================================
  function isHidden(item) {
    var status = String(item.status || "").trim().toLowerCase();
    if (!status) return false;
    return (cfg.HIDDEN_STATUSES || []).indexOf(status) !== -1;
  }

  function matchesQuery(item, q) {
    if (!q) return true;
    var hay = [item.name, item.description, item.category, item.tags]
      .join(" ").toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function visibleItems() {
    var q = state.query.trim().toLowerCase();
    return state.items.filter(function (it) {
      return it && it.name && !isHidden(it) && matchesQuery(it, q);
    });
  }

  function groupByCategory(items) {
    var groups = {};
    items.forEach(function (item) {
      var cat = (item.category || "Menu").trim() || "Menu";
      (groups[cat] = groups[cat] || []).push(item);
    });
    return groups;
  }

  function orderedCategories(groups) {
    var order = cfg.CATEGORY_ORDER || [];
    var present = Object.keys(groups);
    var inOrder = order.filter(function (c) { return groups[c]; });
    var leftovers = present.filter(function (c) { return inOrder.indexOf(c) === -1; }).sort();
    return inOrder.concat(leftovers);
  }

  // ====================================================================
  //  Rendering
  // ====================================================================
  function renderMenu() {
    var items = visibleItems();
    var groups = groupByCategory(items);
    var cats = orderedCategories(groups);
    state.cats = cats;

    if (cats.length === 0) {
      catnavEl.innerHTML = "";
      menuEl.innerHTML = state.query
        ? '<div class="state"><p>No items match “' + esc(state.query) + '”.</p></div>'
        : '<div class="state"><p>Our menu is being updated — please ask a member of staff. ☕</p></div>';
      return;
    }

    var html = "";
    cats.forEach(function (cat) {
      html += '<section class="category" id="' + slug(cat) + '">';
      html += '<h2 class="category__title">' + esc(cat) + "</h2>";
      html += '<div class="card">';
      groups[cat].forEach(function (item) { html += renderItem(item); });
      html += "</div></section>";
    });
    menuEl.innerHTML = html;

    renderNav(cats);
    refreshSpyTargets();
  }

  function renderItem(item) {
    var icon = item.icon ? esc(item.icon) : "•";
    var desc = item.description && String(item.description).trim() !== ""
      ? '<p class="item__desc">' + esc(item.description) + "</p>" : "";
    return (
      '<div class="item">' +
        '<span class="item__icon" aria-hidden="true">' + icon + "</span>" +
        '<div class="item__body">' +
          '<div class="item__head">' +
            '<span class="item__name">' + esc(item.name) + "</span>" +
            '<span class="item__price">' + formatPrice(item.price) + "</span>" +
          "</div>" +
          desc + renderTags(item.tags) +
        "</div>" +
      "</div>"
    );
  }

  function renderTags(tags) {
    if (!tags) return "";
    var list = String(tags).split(",").map(function (t) { return t.trim(); })
      .filter(Boolean);
    if (!list.length) return "";
    return '<div class="tags">' + list.map(function (t) {
      return '<span class="tag">' + esc(t) + "</span>";
    }).join("") + "</div>";
  }

  function renderNav(cats) {
    if (!FEAT.categoryNav) { catnavEl.innerHTML = ""; return; }
    catnavEl.innerHTML = cats.map(function (cat) {
      return '<button type="button" class="catnav__btn" data-target="' +
        slug(cat) + '">' + esc(cat) + "</button>";
    }).join("");
    catnavEl.querySelectorAll(".catnav__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        scrollToSection(btn.getAttribute("data-target"));
      });
    });
  }

  function showError() {
    menuEl.innerHTML =
      '<div class="state"><p>Sorry, the menu couldn\'t load right now.<br>' +
      "Please refresh, or ask a member of staff. ☕</p></div>";
  }

  // ====================================================================
  //  Search
  // ====================================================================
  function setupSearch() {
    if (!FEAT.search) return;
    searchWrap.hidden = false;
    var t;
    searchEl.addEventListener("input", function () {
      clearTimeout(t);
      t = setTimeout(function () {
        state.query = searchEl.value || "";
        renderMenu();
      }, 120);
    });
  }

  // ====================================================================
  //  Category nav: smooth scroll + scroll-spy
  // ====================================================================
  function controlsOffset() {
    var c = document.getElementById("controls");
    return (c ? c.offsetHeight : 0) + 8;
  }

  function scrollToSection(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - controlsOffset();
    window.scrollTo({ top: top, behavior: "smooth" });
  }

  var spyTargets = [];
  var lastActiveId = null;
  function refreshSpyTargets() {
    spyTargets = state.cats.map(function (c) {
      return document.getElementById(slug(c));
    }).filter(Boolean);
    lastActiveId = null; // buttons were re-created — force a re-highlight
    updateActiveNav();
  }
  function setupScrollSpy() {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { updateActiveNav(); ticking = false; });
    }, { passive: true });
  }
  function updateActiveNav() {
    if (!spyTargets.length) return;
    var line = controlsOffset() + 12;
    var activeId = spyTargets[0].id;
    for (var i = 0; i < spyTargets.length; i++) {
      if (spyTargets[i].getBoundingClientRect().top <= line) activeId = spyTargets[i].id;
    }
    if (activeId === lastActiveId) return; // only touch the DOM when it changes
    lastActiveId = activeId;

    var activeBtn = null;
    catnavEl.querySelectorAll(".catnav__btn").forEach(function (btn) {
      var on = btn.getAttribute("data-target") === activeId;
      btn.classList.toggle("is-active", on);
      if (on) activeBtn = btn;
    });
    if (activeBtn) centerNavButton(activeBtn);
  }

  // Scroll ONLY the horizontal tab strip to reveal the active tab.
  // Never uses scrollIntoView, which would also scroll the whole page
  // and fight the user's own scrolling.
  function centerNavButton(btn) {
    var target = btn.offsetLeft - (catnavEl.clientWidth - btn.offsetWidth) / 2;
    target = Math.max(0, Math.min(target, catnavEl.scrollWidth - catnavEl.clientWidth));
    if (typeof catnavEl.scrollTo === "function") {
      catnavEl.scrollTo({ left: target, behavior: "smooth" });
    } else {
      catnavEl.scrollLeft = target;
    }
  }

  // ====================================================================
  //  Back to top
  // ====================================================================
  function setupScrollTop() {
    var btn = document.getElementById("to-top");
    if (!btn || !FEAT.scrollTop) return;
    window.addEventListener("scroll", function () {
      btn.hidden = window.pageYOffset < 600;
    }, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function setFooterYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  // ====================================================================
  //  Business info: contact buttons, address, hours
  // ====================================================================
  function renderBusinessInfo() {
    var biz = cfg.BUSINESS_INFO || {};
    var infoEl = document.getElementById("info");
    if (!infoEl) return;

    var actions = buildActions(biz);
    var hoursHtml = buildHours(biz.hours);
    var addressHtml = biz.address
      ? '<p class="info__address">📍 ' + esc(biz.address) + "</p>" : "";

    if (!actions && !hoursHtml && !addressHtml) return; // nothing to show

    infoEl.innerHTML =
      '<div class="info__inner">' +
        (actions ? '<div class="actions">' + actions + "</div>" : "") +
        addressHtml + hoursHtml +
      "</div>";
    infoEl.hidden = false;
    wireShareButton();
  }

  function buildActions(biz) {
    var out = [];
    if (biz.phone) {
      out.push(actionBtn("tel:" + biz.phone.replace(/[^+\d]/g, ""), "📞", "Call"));
    }
    if (biz.whatsapp) {
      var msg = encodeURIComponent("Hi Shazeeda's Brews & Bites! I'd like to place an order:");
      out.push(actionBtn("https://wa.me/" + biz.whatsapp.replace(/[^\d]/g, "") + "?text=" + msg,
        "💬", "WhatsApp", true));
    }
    if (biz.mapsUrl) out.push(actionBtn(biz.mapsUrl, "🧭", "Directions", true));
    if (biz.instagram) {
      out.push(actionBtn("https://instagram.com/" + biz.instagram.replace(/^@/, ""),
        "📸", "Instagram", true));
    }
    // Share is always available.
    out.push('<button type="button" id="share-btn" class="action">' +
      '<span class="action__icon" aria-hidden="true">🔗</span><span>Share</span></button>');
    return out.join("");
  }

  function actionBtn(href, icon, label, external) {
    return '<a class="action" href="' + esc(href) + '"' +
      (external ? ' target="_blank" rel="noopener"' : "") + ">" +
      '<span class="action__icon" aria-hidden="true">' + icon + "</span>" +
      "<span>" + esc(label) + "</span></a>";
  }

  function wireShareButton() {
    var btn = document.getElementById("share-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var data = { title: document.title, text: "Shazeeda's Brews & Bites menu", url: location.href };
      if (navigator.share) {
        navigator.share(data).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(location.href).then(function () { toast("Link copied!"); });
      } else {
        toast(location.href);
      }
    });
  }

  function buildHours(hours) {
    if (!hours || !Object.keys(hours).length) return "";
    var today = new Date().getDay();
    var rows = DAY_KEYS.map(function (key, i) {
      var val = (hours[key] || "").trim();
      var label = val && val.toLowerCase() !== "closed" ? prettyRange(val) : "Closed";
      return '<li class="hours__row' + (i === today ? " is-today" : "") + '">' +
        "<span>" + DAY_NAMES[i] + "</span><span>" + esc(label) + "</span></li>";
    }).join("");
    var note = (cfg.BUSINESS_INFO || {}).hoursNote;
    var noteHtml = note ? '<p class="hours__note">' + esc(note) + "</p>" : "";
    return '<details class="hours"><summary>🕒 Opening hours</summary>' +
      '<ul class="hours__list">' + rows + "</ul>" + noteHtml + "</details>";
  }

  function renderStatusBadge() {
    var badge = document.getElementById("status-badge");
    var biz = cfg.BUSINESS_INFO || {};
    if (!badge || !biz.hours || !Object.keys(biz.hours).length) return;
    var st = openState(biz.hours);
    if (!st) return;
    badge.textContent = st.open ? "● Open now" : "● Closed";
    badge.className = "status-badge " + (st.open ? "is-open" : "is-closed");
    if (st.detail) {
      var span = document.createElement("span");
      span.className = "status-badge__detail";
      span.textContent = " · " + st.detail;
      badge.appendChild(span);
    }
    badge.hidden = false;
  }

  function openState(hours) {
    var now = new Date();
    var key = DAY_KEYS[now.getDay()];
    var val = (hours[key] || "").trim();
    var mins = now.getHours() * 60 + now.getMinutes();
    if (val && val.toLowerCase() !== "closed") {
      var r = parseRange(val);
      if (r) {
        var open = r.close > r.start
          ? (mins >= r.start && mins < r.close)
          : (mins >= r.start || mins < r.close); // overnight
        if (open) return { open: true, detail: "until " + to12h(r.close % (24 * 60)) };
      }
    }
    return { open: false, detail: nextOpen(hours, now) };
  }

  function nextOpen(hours, now) {
    for (var d = 0; d < 7; d++) {
      var idx = (now.getDay() + d) % 7;
      var val = (hours[DAY_KEYS[idx]] || "").trim();
      if (val && val.toLowerCase() !== "closed") {
        var r = parseRange(val);
        if (!r) continue;
        if (d === 0 && now.getHours() * 60 + now.getMinutes() >= r.start) continue;
        var when = d === 0 ? "today" : d === 1 ? "tomorrow" : DAY_NAMES[idx];
        return "opens " + when + " " + to12h(r.start);
      }
    }
    return "";
  }

  // ====================================================================
  //  Small helpers
  // ====================================================================
  function parseRange(val) {
    var m = String(val).match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!m) return null;
    return { start: (+m[1]) * 60 + (+m[2]), close: (+m[3]) * 60 + (+m[4]) };
  }
  function prettyRange(val) {
    var r = parseRange(val);
    return r ? to12h(r.start) + " – " + to12h(r.close % (24 * 60)) : val;
  }
  function to12h(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    var ap = h >= 12 ? "PM" : "AM";
    var h12 = h % 12 || 12;
    return h12 + (m ? ":" + String(m).padStart(2, "0") : "") + " " + ap;
  }

  function formatPrice(price) {
    if (price === undefined || price === null || String(price).trim() === "") return "";
    var raw = String(price).trim();
    if (/[^0-9.,\s]/.test(raw)) return esc(raw); // already has symbol/letters
    var num = parseFloat(raw.replace(/,/g, ""));
    if (isNaN(num)) return esc(raw);
    var hasCents = num % 1 !== 0;
    return CURRENCY + num.toLocaleString("en-US", {
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: 2,
    });
  }

  function slug(str) {
    return "cat-" + String(str).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function esc(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  var toastTimer;
  function toast(msg) {
    var t = document.getElementById("toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.className = "toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("is-shown"); }, 2200);
  }

  // ---- CSV parsing (Google Sheet) -------------------------------------
  function parseCsv(text) {
    var rows = csvToRows(text);
    if (rows.length < 2) return [];
    var headers = rows[0].map(function (h) { return h.trim().toLowerCase(); });
    return rows.slice(1).map(function (cells) {
      var obj = {};
      headers.forEach(function (h, i) { obj[h] = cells[i] !== undefined ? cells[i] : ""; });
      return obj;
    });
  }

  function csvToRows(text) {
    var rows = [], row = [], field = "", inQuotes = false;
    text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
        } else { field += c; }
      } else if (c === '"') { inQuotes = true; }
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); field = ""; rows.push(row); row = []; }
      else { field += c; }
    }
    row.push(field);
    if (row.length > 1 || row[0].trim() !== "") rows.push(row);
    return rows;
  }
})();
