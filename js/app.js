/* =============================================================
   Shazeeda's Brews & Bites — menu rendering
   - Loads from a published Google Sheet (CSV) if configured,
     otherwise from the local data/menu.json file.
   - Hides any item marked sold out / discontinued.
   - Groups items by category and renders the page.
   See js/config.js to switch the data source.
   ============================================================= */
(function () {
  "use strict";

  var cfg = window.MENU_CONFIG || {};
  var menuEl = document.getElementById("menu");

  // ---- Boot ------------------------------------------------------------
  load();

  function load() {
    var useSheet = cfg.SHEET_CSV_URL && cfg.SHEET_CSV_URL.trim() !== "";
    var url = useSheet ? cfg.SHEET_CSV_URL : cfg.LOCAL_DATA_URL;

    fetchData(url, useSheet)
      .then(function (items) {
        render(items);
      })
      .catch(function (err) {
        console.warn("Primary menu source failed:", err);
        // If the live sheet fails, fall back to the local file.
        if (useSheet) {
          fetchData(cfg.LOCAL_DATA_URL, false)
            .then(render)
            .catch(showError);
        } else {
          showError(err);
        }
      });
  }

  function fetchData(url, isCsv) {
    return fetch(url, { cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text().then(function (text) {
        return isCsv ? parseCsv(text) : JSON.parse(text).items;
      });
    });
  }

  // ---- Filtering & grouping -------------------------------------------
  function isHidden(item) {
    var status = String(item.status || "").trim().toLowerCase();
    if (!status) return false;
    var hidden = cfg.HIDDEN_STATUSES || [];
    return hidden.indexOf(status) !== -1;
  }

  function groupByCategory(items) {
    var groups = {};
    items.forEach(function (item) {
      if (isHidden(item)) return;
      if (!item.name) return; // skip blank rows
      var cat = (item.category || "Menu").trim() || "Menu";
      (groups[cat] = groups[cat] || []).push(item);
    });
    return groups;
  }

  function orderedCategories(groups) {
    var order = cfg.CATEGORY_ORDER || [];
    var present = Object.keys(groups);
    var inOrder = order.filter(function (c) { return groups[c]; });
    var leftovers = present
      .filter(function (c) { return inOrder.indexOf(c) === -1; })
      .sort();
    return inOrder.concat(leftovers);
  }

  // ---- Rendering -------------------------------------------------------
  function render(items) {
    if (!Array.isArray(items)) items = [];
    var groups = groupByCategory(items);
    var cats = orderedCategories(groups);

    if (cats.length === 0) {
      menuEl.innerHTML =
        '<div class="state"><p>Our menu is being updated — please ask a member of staff. ☕</p></div>';
      return;
    }

    var html = "";
    cats.forEach(function (cat) {
      html += '<section class="category">';
      html += '<h2 class="category__title">' + esc(cat) + "</h2>";
      html += '<div class="card">';
      groups[cat].forEach(function (item) {
        html += renderItem(item);
      });
      html += "</div></section>";
    });

    menuEl.innerHTML = html;
  }

  function renderItem(item) {
    var icon = item.icon ? esc(item.icon) : "•";
    var desc = item.description && String(item.description).trim() !== ""
      ? '<p class="item__desc">' + esc(item.description) + "</p>"
      : "";
    return (
      '<div class="item">' +
        '<span class="item__icon" aria-hidden="true">' + icon + "</span>" +
        '<div class="item__body">' +
          '<div class="item__head">' +
            '<span class="item__name">' + esc(item.name) + "</span>" +
            '<span class="item__price">' + formatPrice(item.price) + "</span>" +
          "</div>" +
          desc +
        "</div>" +
      "</div>"
    );
  }

  function showError() {
    menuEl.innerHTML =
      '<div class="state"><p>Sorry, the menu couldn\'t load right now.<br>' +
      "Please refresh, or ask a member of staff. ☕</p></div>";
  }

  // ---- Helpers ---------------------------------------------------------
  function formatPrice(price) {
    if (price === undefined || price === null || String(price).trim() === "") return "";
    var raw = String(price).trim();
    // If it already has a currency symbol or letters, show as-is.
    if (/[^0-9.,\s]/.test(raw)) return esc(raw);
    var num = parseFloat(raw.replace(/,/g, ""));
    if (isNaN(num)) return esc(raw);
    // Whole amounts show with thousands separators and no cents ($1,200);
    // amounts with cents keep two decimals ($4.50).
    var hasCents = num % 1 !== 0;
    return "$" + num.toLocaleString("en-US", {
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: 2,
    });
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* Minimal CSV parser that handles quoted fields, commas and
     newlines inside quotes, and "" escaped quotes. Returns an
     array of objects keyed by the header row. */
  function parseCsv(text) {
    var rows = csvToRows(text);
    if (rows.length < 2) return [];
    var headers = rows[0].map(function (h) { return h.trim().toLowerCase(); });
    return rows.slice(1).map(function (cells) {
      var obj = {};
      headers.forEach(function (h, i) {
        obj[h] = cells[i] !== undefined ? cells[i] : "";
      });
      return obj;
    });
  }

  function csvToRows(text) {
    var rows = [];
    var row = [];
    var field = "";
    var inQuotes = false;
    text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else { inQuotes = false; }
        } else {
          field += c;
        }
      } else if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field); field = "";
      } else if (c === "\n") {
        row.push(field); field = "";
        rows.push(row); row = [];
      } else {
        field += c;
      }
    }
    // last field / row
    row.push(field);
    if (row.length > 1 || row[0].trim() !== "") rows.push(row);
    return rows;
  }
})();
