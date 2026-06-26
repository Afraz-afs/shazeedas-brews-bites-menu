# Shazeeda's Brews & Bites — Digital Menu

A single-page, mobile-first menu website that customers open by scanning a QR
code. No app, no login — it just opens in the phone's browser. The menu content
is managed by the (non-technical) client through a Google Sheet, so prices,
new items and sold-out items can be changed without touching code or re-deploying.

```
index.html          The menu page
qr.html             One-time QR-code generator (run after hosting is live)
css/styles.css      Brand styling (colours pulled from the logo)
js/config.js        ⭐ The one file you edit to point at the Google Sheet
js/app.js           Loads + renders the menu, hides sold-out items
data/menu.json      Local fallback menu (used until the Sheet is connected)
menu-template.csv   Import this into Google Sheets to create the client's sheet
assets/logo.jpeg    The logo
CLIENT-GUIDE.md     Plain-English instructions to hand to the client
```

---

## How the menu data works

The page tries the **Google Sheet** first (if configured in `js/config.js`),
and falls back to the local `data/menu.json` if the sheet is empty or
unreachable. So it works immediately out of the box, and upgrading to the live
sheet is a one-line change.

### Data columns
`name` · `category` · `price` · `description` · `icon` · `status`

Items whose `status` is `sold out`, `discontinued`, `hidden`, etc. are **fully
removed** from the page (not greyed out). See `HIDDEN_STATUSES` in `js/config.js`.

---

## Step 1 — Connect the Google Sheet (recommended)

1. Create a new Google Sheet.
2. **File ▸ Import ▸ Upload** and choose `menu-template.csv` (replace current sheet).
   This gives you the correct column headers and some starter rows.
3. **File ▸ Share ▸ Publish to web.**
   - Choose the menu tab.
   - Choose **Comma-separated values (.csv)**.
   - Click **Publish** and copy the link.
4. Open `js/config.js` and paste that link into `SHEET_CSV_URL`:
   ```js
   SHEET_CSV_URL: "https://docs.google.com/spreadsheets/d/e/XXXX/pub?output=csv",
   ```
5. Save. The page now reads live from the sheet. Hand `CLIENT-GUIDE.md` to the client.

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
