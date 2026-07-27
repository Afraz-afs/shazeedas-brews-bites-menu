# How to update your menu — Shazeeda's Brews & Bites

You can change prices, add items and hide sold-out items yourself.
**You never touch any code, and you never need to re-print the QR code.**

---

## The menu lives in one Google Sheet

Each **row** is one menu item. Each **column** controls one thing:

| Column        | What it does                                                                      |
|---------------|-----------------------------------------------------------------------------------|
| `name`        | The item name (e.g. *Creamy Latte*)                                               |
| `category`    | The section it appears under — see the list below                                 |
| `price`       | Just the number, e.g. `400` (the `$` is added for you). No `$`, no commas.        |
| `description` | Optional. A short line under the name. Leave blank if you don't want one.         |
| `icon`        | A single emoji, e.g. ☕ 🥐 🍰 (see "Getting an emoji" below)                        |
| `status`      | `available` to show it. Type `sold out` or `unavailable` to **hide it**.          |

Your seven sections, in the order they appear on the page:

**Breakfast** · **Lunch** · **Sides** · **Beverages** · **Frappé** · **Milkshakes** · **Ice Cream**

> **Copy the category from a row that already exists** rather than typing it out.
> Spelling it even slightly differently — `Frappe` without the é, or `Beverage`
> instead of `Beverages` — creates a brand-new section at the bottom of the menu
> instead of adding to the one you meant.

---

## Three rules that keep the menu working

These matter more than anything else on this page:

1. **Never merge cells.** Merging cells in the sheet is what blanked the menu for
   customers in July. If you want a heading or a note, put it somewhere outside
   the menu columns — or better, don't.
2. **Don't delete or rename row 1.** That top row (`name`, `category`, `price`, …)
   is how the website knows what each column means.
3. **Add new items as a new row**, in the columns that already exist. Don't insert
   new columns between the existing ones.

If the menu ever looks wrong to customers, the website automatically falls back to
a saved copy of the menu rather than showing a blank page — so nobody sees an
empty screen. But the saved copy can go out of date, so tell your developer if it
happens.

---

## Common tasks

**Change a price** → edit the `price` cell. Type just the number, e.g. `480`.

**Hide a sold-out item** → put `sold out` in its `status` cell. It disappears from
the menu completely. Change it back to `available` to bring it back.
Any of these work, in any capitalisation: `sold out`, `unavailable`,
`out of stock`, `discontinued`, `hidden`, `no`.

**Add a new item** → add a new row at the bottom of its section and fill in
`name`, `category`, `price`, `icon` and `status`. Leave `description` blank unless
you want a line under the name.

**Remove an item permanently** → delete the whole row (or set `status` to
`discontinued`).

> Changes appear as soon as a customer refreshes the page — there is no waiting
> and nothing to publish. Google saves your sheet automatically.
> If an item doesn't show up, check that `status` says `available` and that the
> `category` is spelled exactly like the others.

---

## Important: the printed menu is a separate thing

The laminated sheet on the tables is a **snapshot** taken on the day it was made.
Editing the Google Sheet updates the **online** menu only — it does **not** change
the printed copies.

So when you change a price or add an item, remember:

- The online menu (the QR code) is correct straight away. ✅
- The laminated menus are now out of date until they're re-printed. ⚠️

Ask your developer to re-make the printed menu when you've made enough changes to
be worth reprinting. The QR code on the printed sheet always points at the live
menu, which is exactly why it's there.

---

## Getting an emoji

- **iPhone/iPad:** tap the 🙂 (or globe) key on the keyboard.
- **Android:** tap the 🙂 emoji key on the keyboard.
- **Windows:** press `Windows key + .` (period).
- **Mac:** press `Control + Command + Space`.

Pick one emoji per item. If you leave it blank, a small dot is shown instead.

---

## Your QR code never changes

The QR code points at the *address* of your menu, not at the menu contents. Prices
and items can change as often as you like and the same printed QR keeps working.

---

That's it. Edit the sheet, and you're done. 🎉
