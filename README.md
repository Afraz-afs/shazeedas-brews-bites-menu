# Shazeeda's Brews & Bites — Digital Menu

A single-page, mobile-first menu website that customers open by scanning a QR
code. No app, no login — it just opens in the phone's browser. The menu content
is managed by the (non-technical) client through a Google Sheet, so prices,
new items and sold-out items can be changed without touching code or re-deploying.

```
index.html            The menu page
legal.html            Terms of Use + Privacy Notice (linked from the footer)
qr.html               One-time QR-code generator (run after hosting is live)
404.html              Branded not-found page (also disables Pages' SPA fallback)
css/styles.css        Brand styling (colours pulled from the logo)
css/legal.css         Styling for legal.html and 404.html
css/qr.css            Styling for the QR generator
js/config.js          ⭐ The one file you edit: data source + business details
js/app.js             Loads + renders the menu, hides sold-out items
js/qr.js              QR generator page logic
js/vendor/qrcode.js   Self-hosted QR library (no CDN, so the strict CSP applies)
data/menu.json        Local fallback menu (used if the Sheet can't be read)
menu-template.csv     Import this into Google Sheets to create the client's sheet
print/                Printable two-sided A4 menu for customers with no internet
manifest.webmanifest  Makes the page installable ("Add to Home Screen")
_headers              Security headers for Cloudflare Pages (CSP, HSTS, …)
robots.txt            Keeps the internal /qr tool out of search results
assets/logo.jpeg      The logo
CLIENT-GUIDE.md       Plain-English instructions to hand to the client
```

See `print/README.md` for how the printed menu is built and re-exported — it is a
**snapshot** of `data/menu.json`, so it has to be re-made whenever prices change.

---

## Features

- **Live Google Sheet menu** with local-file fallback.
- **Instant-load cache** — the last good menu is saved in the browser, so repeat
  scans render immediately and a sheet/network hiccup never shows a blank page.
- **Search** box to filter items as you type.
- **Sticky category tabs** that jump to a section and highlight on scroll.
- **Open / Closed-now badge + opening hours** (from `BUSINESS_INFO.hours`).
- **Contact buttons** — Call, WhatsApp (pre-filled order), Directions, Instagram,
  Share. Each appears only if you fill in that detail.
- **Item tags** (e.g. *Popular*, *Spicy*) via an optional `tags` column.
- **Halal note**, allergy + pricing disclaimers, back-to-top button, installable.

### Business details & toggles (`js/config.js`)
Fill in `BUSINESS_INFO` (phone, whatsapp, instagram, address, mapsUrl, hours) to
light up the contact bar and the open/closed badge — empty fields stay hidden.
`FEATURES` toggles search / category tabs / back-to-top on or off.

---

## How the menu data works

The page tries the **Google Sheet** first (if configured in `js/config.js`),
and falls back to the local `data/menu.json` if the sheet is empty or
unreachable. So it works immediately out of the box, and upgrading to the live
sheet is a one-line change.

### Data columns
`name` · `category` · `price` · `description` · `icon` · `status` · `tags` *(optional)*

Items whose `status` is `sold out`, `discontinued`, `hidden`, etc. are **fully
removed** from the page (not greyed out). See `HIDDEN_STATUSES` in `js/config.js`.

---

## Step 1 — Connect the Google Sheet (recommended)

1. Create a new Google Sheet.
2. **File ▸ Import ▸ Upload** and choose `menu-template.csv` (replace current sheet).
   This gives you the correct column headers and some starter rows.
3. **Share ▸ General access ▸ Anyone with the link (Viewer).**
4. Open `js/config.js` and set `SHEET_CSV_URL` to the sheet's **gviz CSV** export —
   take the sheet ID out of the share link and use:
   ```js
   SHEET_CSV_URL: "https://docs.google.com/spreadsheets/d/<SHEET_ID>/gviz/tq?tqx=out:csv",
   ```
   This is the form the site actually uses. (The older *Publish to web*
   `/pub?output=csv` link also works, but Google caches it, so it can lag a few
   minutes behind an edit. The gviz export above has been observed reflecting
   sheet edits immediately.)
5. Save. The page now reads live from the sheet. Hand `CLIENT-GUIDE.md` to the client.

> The site fetches this URL from the browser, so it must stay reachable
> cross-origin. Google echoes the requesting origin back in
> `Access-Control-Allow-Origin`, and `docs.google.com` is allow-listed in the
> `connect-src` directive in `_headers` — if you ever change the data host, that
> CSP line has to change with it or the fetch will be blocked.

> **First version without a sheet?** Skip this step. The page already shows the
> menu from `data/menu.json`. You can connect the sheet later — nothing else changes.

---

## Step 2 — Put it online (live URL)

This site is a plain static site (no build step), connected to a GitHub repo and
deployed on **Cloudflare Pages**.

### Deploy on Cloudflare Pages (connected to GitHub)
1. Push this repo to GitHub (already set up — see below).
2. Go to the Cloudflare dashboard ▸ **Workers & Pages ▸ Create ▸ Pages ▸
   Connect to Git**.
3. Authorise GitHub and pick this repository.
4. Build settings:
   - **Framework preset:** `None`
   - **Build command:** *(leave blank)*
   - **Build output directory:** `/`  (the site is at the repo root)
5. Click **Save and Deploy**. You get a URL like
   `https://shazeedas-brews-bites-menu.pages.dev`.
6. (Optional) Add a custom domain under the project's **Custom domains** tab.

> Every `git push` to the `main` branch auto-deploys. Menu **content** edits,
> though, happen in the Google Sheet and appear with no deploy at all.

---

## Step 3 — Generate the QR code (once)

1. Open `qr.html` in a browser (or visit `<your-live-url>/qr.html`).
2. Paste the **live menu URL** and click **Generate QR code**, then **Download PNG**.
3. Print it. Because it points at the URL — not at the menu content — **the QR
   code never has to change**, even when prices or items do.

Test it with a phone camera before printing for tables/windows.

---

## Local preview

Because the page uses `fetch()`, open it through a tiny local server (not by
double-clicking the file):

```bash
# from this folder
python -m http.server 8000
# then visit http://localhost:8000
```

---

## Scope (this version)

In: one page, mobile-first, categories, hidden sold-out items, footer notes,
Sheet-or-JSON data, QR generator.
Out (by request): multi-page, online ordering/payments, accounts, multiple menus.
Item icons are emoji placeholders — easy to swap for photos later.
