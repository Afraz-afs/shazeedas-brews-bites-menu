/* =============================================================
   Shazeeda's Brews & Bites — Site configuration
   -------------------------------------------------------------
   This is the main file a developer edits. Two things live here:
     1) where the menu data comes from (Google Sheet or local file)
     2) the business details shown on the page (contact, hours)

   HOW THE MENU DATA WORKS
   -----------------------
   1. By default the page reads from  data/menu.json  (works
      offline, no setup needed).
   2. To go LIVE with a Google Sheet, paste the CSV export link
      into SHEET_CSV_URL below. The page reads the sheet on every
      load — the client just edits the sheet, no code changes and
      no re-deploy needed.

   GOOGLE SHEET CSV LINK (recommended form)
   ----------------------------------------
   Take the sheet ID from the share link and use:
     https://docs.google.com/spreadsheets/d/<SHEET_ID>/gviz/tq?tqx=out:csv
   The sheet must be shared "Anyone with the link – Viewer", and
   have these column headers in row 1 (any order):
     name | category | price | description | icon | status | tags
   (`tags` is optional — comma-separated, e.g. "Popular, Spicy".)
   ============================================================= */

window.MENU_CONFIG = {
  // ---- Menu data source ------------------------------------------------
  // Leave as "" to use the local data/menu.json file.
  SHEET_CSV_URL: "https://docs.google.com/spreadsheets/d/1FYfq_4dm31diwKL_dO8zMFn3MIOtZ9ikCCl2e_YpcCM/gviz/tq?tqx=out:csv",

  // Local fallback file (used when SHEET_CSV_URL is empty, or if the
  // sheet ever fails to load).
  LOCAL_DATA_URL: "data/menu.json",

  // Order categories appear on the page. Any category not listed
  // here still shows, just after the ones that are listed.
  CATEGORY_ORDER: ["Breakfast", "Lunch", "Sides", "Beverages"],

  // Status values (case-insensitive) that HIDE an item completely.
  // Anything else (e.g. "available", blank) is shown.
  HIDDEN_STATUSES: ["sold out", "soldout", "sold-out", "discontinued", "hidden", "off", "no"],

  // Currency symbol shown before numeric prices.
  CURRENCY: "$",

  // ---- Business details (all optional) ---------------------------------
  // Fill these in to light up the contact buttons and the open/closed
  // badge. Leave any field "" and its button simply won't appear.
  BUSINESS_INFO: {
    phone: "",            // e.g. "+1 868 123 4567"  → tap-to-call button
    whatsapp: "",         // digits only, e.g. "18681234567" → WhatsApp order button
    instagram: "",        // handle only, no @, e.g. "shazeedasbrews"
    address: "",          // shown as text under the menu
    mapsUrl: "",          // a Google Maps link → "Directions" button

    // Opening hours. Use 24-hour "HH:MM-HH:MM", or "closed".
    // Leave the whole object empty ({}) to hide the hours section.
    // Example:
    //   hours: { sun:"closed", mon:"07:00-19:00", tue:"07:00-19:00",
    //            wed:"07:00-19:00", thu:"07:00-19:00",
    //            fri:"07:00-21:00", sat:"08:00-21:00" }
    hours: {},
  },

  // ---- Feature toggles -------------------------------------------------
  FEATURES: {
    search: true,        // show the search box
    categoryNav: true,   // show the sticky category tabs
    scrollTop: true,     // show the back-to-top button
  },
};
