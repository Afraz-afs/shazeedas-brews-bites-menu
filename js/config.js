/* =============================================================
   Shazeeda's Brews & Bites — Site configuration
   -------------------------------------------------------------
   This is the ONLY file a developer needs to touch to switch the
   menu over from the local file to a live Google Sheet.

   HOW THE MENU DATA WORKS
   -----------------------
   1. By default the page reads from  data/menu.json  (works
      offline, no setup needed).
   2. To go LIVE with a Google Sheet, paste the published CSV link
      into SHEET_CSV_URL below. The page will then read the sheet
      every time it loads — the client just edits the sheet, no
      code changes and no re-deploy needed.

   HOW TO GET THE GOOGLE SHEET CSV LINK
   ------------------------------------
   - In the Google Sheet:  File ▸ Share ▸ Publish to web
   - Under "Link", pick the menu tab, choose "Comma-separated
     values (.csv)", then click Publish.
   - Copy the URL it gives you and paste it between the quotes
     for SHEET_CSV_URL.
   The sheet must have these column headers in row 1 (any order):
     name | category | price | description | icon | status
   ============================================================= */

window.MENU_CONFIG = {
  // Leave as "" to use the local data/menu.json file.
  // Paste the published-to-web CSV link here to go live with the sheet.
  SHEET_CSV_URL: "",

  // Local fallback file (used when SHEET_CSV_URL is empty, or if the
  // sheet ever fails to load).
  LOCAL_DATA_URL: "data/menu.json",

  // Order categories appear on the page. Any category not listed
  // here still shows, just after the ones that are listed.
  CATEGORY_ORDER: ["Breakfast", "Lunch", "Sides", "Beverages"],

  // Status values (case-insensitive) that HIDE an item completely.
  // Anything else (e.g. "available", blank) is shown.
  HIDDEN_STATUSES: ["sold out", "soldout", "sold-out", "discontinued", "hidden", "off", "no"],
};
