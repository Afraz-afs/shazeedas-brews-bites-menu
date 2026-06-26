# How to update your menu — Shazeeda's Brews & Bites

You can change prices, add items, and hide sold-out items yourself.
**You never touch any code, and you never need to re-print the QR code.**

---

## The menu lives in one Google Sheet

Each **row** is one menu item. Each **column** controls one thing:

| Column        | What it does                                                                 |
|---------------|------------------------------------------------------------------------------|
| `name`        | The item name (e.g. *Caramel Latte*)                                         |
| `category`    | The section it appears under (*Brews*, *Bites*, *Cold Drinks*, *Sweets*)    |
| `price`       | Just the number, e.g. `4.50` (the `$` is added for you)                      |
| `description` | Optional. A short line under the name. Leave blank if you don't want one.    |
| `icon`        | A single emoji, e.g. ☕ 🥐 🍰 (on phone/Mac press the emoji key)              |
| `status`      | `available` to show it. Type `sold out` or `discontinued` to **hide it**.   |
| `tags`        | *(Optional)* Little labels under an item, e.g. `Popular` or `Spicy, Veg`.    |

---

## Common tasks

**Change a price** → edit the `price` cell. Type just the number.

**Hide a sold-out item** → set its `status` to `sold out`.
It disappears from the menu completely. Change it back to `available` to bring it back.

**Add a new item** → add a new row and fill in the columns.

**Highlight an item** → put a word in the `tags` column, e.g. `Popular`,
`Chef's pick`, `Spicy`. Separate several with commas: `Popular, Spicy`.

**Remove an item permanently** → set `status` to `discontinued` (or delete the row).

> Changes show up on the live menu within about a minute — just refresh the page.
> If something looks off, check that `status` is spelled `available`.

---

## Getting an emoji

- **iPhone/iPad:** tap the 🙂 (or globe) key on the keyboard.
- **Android:** tap the 🙂 emoji key on the keyboard.
- **Mac:** press `Control + Command + Space`.
- **Windows:** press `Windows key + .` (period).

Pick one emoji per item. If you leave it blank, a small dot is shown instead.

---

That's it. Edit the sheet, save (Google saves automatically), done. 🎉
