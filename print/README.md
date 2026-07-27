# Printable menu (for customers without internet)

A two-sided A4 handout — front and back of **one** sheet — meant to be
printed on card and laminated.

| File | What it is |
|---|---|
| `Shazeedas-Menu-Print.pdf` | **Print this one.** Ready to go — colours and the dark header band are baked in, so it prints the same from any computer, phone or print shop. |
| `menu-print.html` | The source of the PDF. Open in Chrome/Edge to print directly, or edit and re-export. |
| `Shazeedas-Menu-Editable.docx` | Same menu in Microsoft Word, for the owner to change a price or an item herself and re-print. Laid out to match the PDF — same header band, two columns, gold rules, leader dots and QR footer. |
| `menu-docx-source.html` | The source of the `.docx`. Not for printing — see "Rebuilding the Word file" below. |

## Printing it

**From the PDF (recommended)** — open it, Ctrl+P:

- Paper **A4**, **Portrait**, Scale **100 %** (not "Fit to page")
- **Print on both sides → Flip on long edge**
- Heaviest paper the printer takes; **160–200 gsm card** is ideal
- Then laminate (A4 pouch, 125 micron or thicker)

**From `menu-print.html`** — same settings, plus you *must* tick
**"Background graphics"** in the print dialog, or the dark header band and the
gold rules will come out blank.

## The printed menu carries every item

All **55** items match `data/menu.json` exactly. Nothing is held back —
Bagel with Cream Cheese was previously left off for want of a price, and the
owner supplied it ($400) on 2026-07-25.

Items in each section are listed **cheapest first**; keep that order when
adding anything. The one deliberate exception is **Loaded Fries** at the foot
of Lunch — it is cheaper than the three items above it, but it carries the only
description line, which reads better at the bottom of the section than mid-list.

**A price change can break that order.** When the owner reprices something,
check whether it still sits in the right place: on 2026-07-27 Country Milk went
$800 → $480 and had to move up three rows, past Slushie and both Lucozades.
Page count alone will not catch this.

## Keeping it in sync

The live online menu is served from the Google Sheet, so it updates itself.
**This printed sheet is a snapshot** — whenever prices change in the sheet, the
files here have to be re-made and the laminated copies reprinted. The QR code
on the back is there for exactly that reason: it always points at the current
menu.

The front page is deliberately set in larger type than the back
(the `.cols--front` block in `menu-print.html`) — it carries fewer items, so
at the shared size it left about a third of the sheet empty. If items are ever
added back to Breakfast or Lunch, check the front still fits on one page.

Breakfast took a 10th item (Boulanger choka & Roti) on 2026-07-27 and the front
page still fits, but the left column — Breakfast plus Lunch — is now the binding
constraint, with roughly one row of slack left. The next item added there will
likely need the front type stepped back down.

To re-export the PDF after editing `menu-print.html`:

```powershell
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
Start-Process $chrome -Wait -NoNewWindow -ArgumentList `
  "--headless=new","--disable-gpu","--no-sandbox",
  "--user-data-dir=$env:TEMP\menu-chrome","--no-pdf-header-footer",
  "--virtual-time-budget=15000",
  "--print-to-pdf=$PWD\Shazeedas-Menu-Print.pdf",
  "file:///<full path to>/menu-print.html"
```

`--headless=new` and `--user-data-dir` both matter: with plain `--headless`,
or when another Chrome is already running without a separate profile
directory, Chrome exits silently and leaves the **old** PDF in place. Always
check the file's timestamp afterwards — a successful run also prints
`… bytes written to file …`.

Spaces in the path are the other way this fails quietly. This repo lives under
`…\OneDrive\Documents\Desktop\Shazeeda's Brews & Bites\`, and
`Start-Process -ArgumentList` splits `--print-to-pdf=<path with spaces>` into
two arguments, at which point Chrome answers `Multiple targets are not
supported in headless mode` and writes nothing. Easiest fix: copy
`menu-print.html` to a space-free working directory (e.g. `$env:TEMP\menubuild`),
render there, and copy the PDF back. `file:///` URLs need spaces as `%20`
regardless.

## Rebuilding the Word file

`Shazeedas-Menu-Editable.docx` is generated from `menu-docx-source.html` by
driving Word (installed locally) — edit the HTML, then:

```powershell
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open("$PWD\menu-docx-source.html", [ref]$false, [ref]$false)
$doc.SaveAs2([ref]"$PWD\Shazeedas-Menu-Editable.docx", [ref]16)   # 16 = .docx
$doc.ComputeStatistics(2)     # page count — must be 2
$doc.Close([ref]$false); $word.Quit()
```

A page count of 2 does **not** prove the rebuild is good. Always export to PDF
and look at both pages — several of the ways this breaks still count as two
pages. Word's HTML importer is the constraint behind almost every odd-looking
choice in `menu-docx-source.html`; each is commented where it appears:

- **Margins.** Word ignores a bare `@page { margin }` and uses its 1 inch
  default, which narrows the columns until half the item names wrap. The
  margins only stick via the named `@page Section1` plus the `div.Section1`
  wrapper around the body.
- **The front/back split.** Word carries a page break on a *paragraph* only —
  not a `<div>`, not a `<br>` (with or without `mso-special-character`), not a
  `<table>`. Both pages open with the header band table, so the break rides on
  the 1pt `p.pagebreak` paragraph in front of it. Without it the two pages run
  together and Beverages starts halfway down the front.
- **One class per element.** Word keeps only the *first* class name and drops
  the rest, so `class="items itemsbig"` silently strips the gold prices and the
  leader dots off the front page. The item CSS spells every rule out for both
  class names instead.
- **Colour.** Only table cell shading and cell borders print. A background on a
  `<div>` is dropped, and page colour is not printed at all by default — which
  is why the dark band and every gold rule is a table.
- **Long names.** The name cells are `white-space: nowrap` (that is what lets
  the leader dots take up the slack), so a name too long for its column pushes
  the table wide instead of wrapping. Anything up to about the length of
  *Diamond Sparkling Water (355 ml)* is safe; past that, shorten the name or
  drop the column's font size.
- **Pagination.** Word paginates differently from Chrome, so the `.docx` sets
  its own spacing. If a batch of items is added it will spill to a third page —
  tighten the `td` padding and the `p.cat` margins until
  `ComputeStatistics(2)` returns 2 again.

Three deliberate differences from the PDF remain, all of them Word limits:
the page is white rather than cream (Word will not print a page colour), the
header band stops at a 0.6 cm margin rather than bleeding off the paper edge
(zero margins make Word warn the person printing), and the bottom strip and
footer follow the content instead of being pinned to the foot of the page.
The logo is embedded as a pre-rounded PNG with transparent corners, because
Word cannot round a picture's corners the way the PDF's `border-radius` does.
