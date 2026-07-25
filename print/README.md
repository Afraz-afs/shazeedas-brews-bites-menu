# Printable menu (for customers without internet)

A two-sided A4 handout — front and back of **one** sheet — meant to be
printed on card and laminated.

| File | What it is |
|---|---|
| `Shazeedas-Menu-Print.pdf` | **Print this one.** Ready to go — colours and the dark header band are baked in, so it prints the same from any computer, phone or print shop. |
| `menu-print.html` | The source of the PDF. Open in Chrome/Edge to print directly, or edit and re-export. |
| `Shazeedas-Menu-Editable.docx` | Same menu in Microsoft Word, for the owner to change a price or an item herself and re-print. Slightly plainer than the PDF. |

## Printing it

**From the PDF (recommended)** — open it, Ctrl+P:

- Paper **A4**, **Portrait**, Scale **100 %** (not "Fit to page")
- **Print on both sides → Flip on long edge**
- Heaviest paper the printer takes; **160–200 gsm card** is ideal
- Then laminate (A4 pouch, 125 micron or thicker)

**From `menu-print.html`** — same settings, plus you *must* tick
**"Background graphics"** in the print dialog, or the dark header band and the
gold rules will come out blank.

## Two items are deliberately not on the printed menu

- **Bagel with Cream Cheese** — no price has ever been supplied. Once the owner
  gives one, it goes in the commented-out block in the Breakfast section of
  `menu-print.html`.
- **Coke** — has no price and is marked `unavailable` in the menu data, so the
  live site hides it too.

Everything else matches `data/menu.json` exactly.

## Keeping it in sync

The live online menu is served from the Google Sheet, so it updates itself.
**This printed sheet is a snapshot** — whenever prices change in the sheet, the
files here have to be re-made and the laminated copies reprinted. The QR code
on the back is there for exactly that reason: it always points at the current
menu.

To re-export the PDF after editing `menu-print.html`:

```
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless --disable-gpu `
  --no-pdf-header-footer --print-to-pdf="Shazeedas-Menu-Print.pdf" `
  "file:///<full path to>/menu-print.html"
```
