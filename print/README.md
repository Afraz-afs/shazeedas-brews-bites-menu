# Printable menu (for customers without internet)

A two-sided A4 handout — front and back of **one** sheet — meant to be
printed on card and laminated.

| File | What it is |
|---|---|
| `Shazeedas-Menu-Print.pdf` | **Print this one.** Ready to go — colours and the dark header band are baked in, so it prints the same from any computer, phone or print shop. |
| `menu-print.html` | The source of the PDF. Open in Chrome/Edge to print directly, or edit and re-export. |
| `Shazeedas-Menu-Editable.docx` | Same menu in Microsoft Word, for the owner to change a price or an item herself and re-print. Slightly plainer than the PDF. |
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

## One item is deliberately not on the printed menu

- **Bagel with Cream Cheese** — no price has ever been supplied. Once the owner
  gives one, it goes in the commented-out block in the Breakfast section of
  `menu-print.html`.

Everything else matches `data/menu.json` exactly — 53 printed items out of the
54 the owner sells.

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
`… bytes written to file …`. Paths with spaces are fine as arguments, but
`file:///` URLs need spaces written as `%20`.

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

Two Word-specific traps, both already handled in the source — check for them
after any rebuild by exporting to PDF and looking at where page 1 ends:

- Word's HTML importer **ignores `page-break-before` on a `<div>`**. The
  front/back split relies on `<br clear="all" class="pagebreak">` with
  `mso-special-character: line-break`. Without it the page count is still 2,
  but Beverages starts halfway down the front — so a page count alone does
  not prove the split is right.
- Word paginates differently from Chrome, so the `.docx` uses its own tighter
  spacing to stay at two pages. If a batch of items is added it will spill to a
third page — tighten `td { padding }` and the `h2` margins in the source HTML
until `ComputeStatistics(2)` returns 2 again.
