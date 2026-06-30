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
    instagram: "",        // handle only, no @, e.g. "shazeedasbrews" (not on social yet)
    address: "12–13 Rosignol, West Coast Berbice, Guyana",
    // "Directions" button → opens Google Maps directions straight to the
    // exact shop location (lat,lng provided by the client).
    mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=6.276446163506728%2C-57.53998856150444",

    // Opening hours. Use 24-hour "HH:MM-HH:MM", or "closed".
    // Mon–Sat 6:00 AM – 8:00 PM; Sunday 6:00 AM – 2:00 PM.
    hours: {
      sun: "06:00-14:00",
      mon: "06:00-20:00",
      tue: "06:00-20:00",
      wed: "06:00-20:00",
      thu: "06:00-20:00",
      fri: "06:00-20:00",
      sat: "06:00-20:00",
    },
    // Optional free-text line shown under the hours (holidays can't be
    // auto-detected, so we state them here).
    hoursNote: "Public holidays: 6:00 AM – 2:00 PM",
  },

  // ---- Feature toggles -------------------------------------------------
  FEATURES: {
    search: true,        // show the search box
    categoryNav: true,   // show the sticky category tabs
    scrollTop: true,     // show the back-to-top button
  },
};
