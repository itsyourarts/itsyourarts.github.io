# NEVTA BOOK — Digital Shagun Register (password-locked, pink neon glass)

A password-gated **shagun / nevta register** in neon glassmorphism with falling rose
petals. Unlock the splash screen, write entries on a dedicated writer page, review and
export the whole book from the dashboard in **7 formats**. Everything runs client-side —
no server, no account, no upload.

**Splash password: `Shadow`**

The whole app — splash, writer and dashboard — wears one **pink neon glass** theme
— rose and blush pinks sampled straight from the Ganesha artwork (`#C22558` rose,
`#EEAFB6` blush, `#C05C72` dusty rose, plum `#25000D`) — and every icon (padlock,
eye, delete cross, brand flower, feature tiles) is drawn in **pure CSS**: there is not a single emoji in
any page or export. Three wrong password attempts trigger a **30-second cooldown
lockout** with a horizontal shake.

---

## The flow

```
index.html  ──password "Shadow"──▶  write.html  ──link──▶  home.html
(splash)      unlock animation      (writer)               (dashboard + exports)
              curtain closes        Enter → next field     register table,
              curtain reopens       Next → save            filters, totals,
                                    Previous → edit        PDF/XML/JSON/CSV/
                                                           PNG/HTML/MD/ZIP
```

All three pages share one localStorage store (`nevtabook.entries.v1`), the same petal
fall and the same neon-glass design system. `write.html` and `home.html` refuse to open
without the unlock flag in `sessionStorage` — they bounce straight back to the splash.

---

## Pages & files

```
neon-glass-site/
├── index.html        # splash / lock screen (deity medallion, dashed ring, password)
├── write.html        # the entry writer (Enter→next, Save & next, Previous→edit)
├── home.html         # landing + register table + search/filters + export modal
├── assets/
│   ├── ganesha.webp        # source artwork (900×900)
│   └── ganesha-circle.png  # circle-cropped PNG medallion (512×512, transparent corners)
├── css/
│   └── styles.css    # design system incl. splash, curtain, writer sections
├── js/
│   ├── fx.js         # petal fall + unlock curtain (shared)
│   ├── lock.js       # password gate + staged unlock animation
│   ├── writer.js     # writer page: Enter/Next/Previous/recent cards
│   ├── app.js        # dashboard: table, filters, totals, localStorage
│   └── exports.js    # PDF · XML · JSON · CSV · PNG · HTML · Markdown · ZIP · Print
├── tests/            # dev-only
│   ├── smoke.js      #  41 checks — export builders, totals, breakup, no-emoji
│   ├── dom-test.js   #  83 checks — dashboard, live panel, name gate, tap-to-export, End handoff
│   ├── writer-test.js#  36 checks — Enter chain, save, edit, name gate, End → format chooser, XSS
│   ├── lock-test.js  #  28 checks — HUD card spec, emblem, streak, cooldown, granted flip
│   └── pdf-test.js   #  real multi-page PDF via jsPDF
└── README.md
```

## Running it

```bash
cd neon-glass-site
python3 -m http.server 8080        # then open http://localhost:8080
```

(Double-clicking `index.html` also works; the CDN libraries for PDF/PNG/ZIP just need
internet, everything else is fully offline.)

---

## Splash screen — pink neon HUD lock (full spec)

- **Background**: radial gradient centred at (50%, 44%) — `#C05C72 → #670528 →
  #1F0410` (the artwork's own dusty-rose/plum tones) — with a **390×390 breathing
  rose ambient glow** (`#E8789E`, opacity .22) behind the centre stage.
  No clock, no date, no subtitle anywhere
- **Top circular emblem**, exactly **15 px above the lock card**:
  - a **200×200 borderless circular stage**
  - a **188×188 circular clip** (transparent outer corners) holding the **178×178**
    circle-cropped PNG emblem (`ganesha-circle.png`) — interior colours 100%
    untouched (no filter, no tint, no overlay)
  - at radius **R = 96**: **94 crisp flat dashes** (`stroke-dasharray: 3.3 3.117`,
    `stroke-width: 0.92`, butt caps, colour **`#E4FF526E`**) rotating a smooth
    **360° every 28 s**
  - a **second, faster neon shine**: a compact **26° streak** at R = 96
    (`#E8789E → #FFFFFF`, no long dim tail) sweeping **360° every 3.6 s**
    clockwise inside a rotating `<g class="streak-spin">`, with a **white-hot orb
    on the leading tip** — 5.6 px core + star cross-glint + 16 px `#E8789E` halo
- **Lock card (444 px)**: frosted pink glass, radius 20, triple-layer
  border, **tactical HUD corner brackets** (14×14, `#F2A6BC`), a **diagonal moving
  reflection band**, and a **2 px stationary laser line** across the top
  (`transparent → #E4638F → #FFFFFF → #F2A6BC → transparent`)
- **Header**: only an **8 px pulsing dot** + **SYSTEM LOCKED** (15 px, ExtraBold,
  `#EEAFB6` — the artwork's blush highlight)
- **Password input** (44 px, radius 12): responsive neon border with a **moving
  specular shine sweep** that brightens and speeds up on hover (1.7 s) and focus
  (1.1 s); CSS-drawn padlock on the left, show/hide **CSS eye** on the right
- **UNLOCK button** (44 px, radius 12): rose neon gradient `#E4638F → #C22558`
  with a continuous moving sheen + hover glow boost
- **Footer**: `© 2026 GODXSHADOW — by Krishna UPX61` pinned bottom-centre; only
  the **X** glows neon rose (`#E4638F`, emerald `#00FFA3` while unlocking)
- **Security**: password `Shadow`; every wrong guess shakes the card horizontally
  and counts attempts; **3 wrong attempts → 30 s cooldown** (inputs disabled,
  live countdown, survives a page reload via `sessionStorage`)
- **Unlock transition**: on a valid password every pink element — aura, emblem
  halo, dash ring, streak + orb, laser line, HUD corners, header
  (SYSTEM LOCKED → **ACCESS GRANTED**), input border, button, footer X — flips to
  **neon emerald-cyan** (`#00FFA3` / `#00E5FF`) through registered `@property`
  colour variables, **holds 1.0 s**, then the curtain closes and the writer opens
- **Rose petals** still fall behind everything — 14–30 s per petal, slow and natural
- Already unlocked this session? A one-tap “continue” link appears instead of retyping

## Writer page (`write.html`)

- Fields: Name*, Father's/husband's name, Phone, Amount*, Given as, **Address**
  (kept highlighted — lit border, cyan label) and **Note** (deliberately dimmed:
  rarely used, never in the way). Side, date, event and the status checkboxes
  were removed on purpose so the book stays fast to write
- **Enter** in any field jumps to the next one; **Enter on the last field saves**
- **Save & next** stores the entry and clears the form (“Given as” is kept so
  writing twenty entries in a row stays fast); focus returns to Name
- **◀ Previous entry** below the actions reopens the last saved entry for editing;
  while editing, **◀ Older / Newer ▶** walk the book and **＋ New entry** returns to a
  blank form. Saving in edit mode overwrites that entry (same id, `updatedAt` set)
- The writer is **entry-only on purpose** — nothing else is added to this page.
  Reading, viewing, editing from the panel, deleting and exporting all live on
  the dashboard (`home.html`)
- **Before starting, the app asks for the project / nevta name** — the entry page
  opens only after naming. The name is stored once (`nevtabook.project.v1`) and
  shared by the dashboard and every export file
- **“End & download the book”** at the very bottom — for when every entry is
  written: it auto-saves any half-written entry, asks for **one format**
  (PDF / XML / JSON / CSV / PNG / HTML / Markdown), then hands off to the
  dashboard where that file **downloads instantly**, is **logged in Recent
  exports** with date & time, and the user lands on the home page
- **Recent entries** panel: the last eight as cards — tap any to open it for editing
- Live strip on top: entry count, total shagun, largest gift; link to the dashboard
- **Lock** in the header drops the unlock flag and returns to the splash

## Dashboard (`home.html`)

The full landing page plus the register table: search (name/father/phone/address/note),
method filter, select & delete, live totals (total, average, largest, cash, online),
a GRAND TOTAL row that follows the current filter, the closing **breakup-by-method**
panel — and the export modal.

The **3-dot panel at the top is a live register window**: every saved entry lands in it
(newest first) with **View / Edit / Delete** buttons, real KPIs (total shagun, entries
saved, largest gift + who gave it) and a per-method bar chart drawn from the actual
book. Its footer carries the **Save entry** and **⇩ Export book** shortcuts, and the
entry form below has a one-click **Save & Export** button (stores the entry, then opens
the export panel) — the writer page itself stays entry-only, all reading happens here. Editing from the panel fills the form, switches the button to
**Update entry** and overwrites the same entry in place; View clears any active filter
and flashes the row in the register table.

The register heading carries the **project-name chip** (with a **Rename** button), every
table row and panel row shows the entry's **recorded date & time**, and a
**Recent exports** log under the table lists every downloaded file — format, filename
and the date & time it was downloaded.

### Export — 7 formats + ZIP

PDF (neon header, KPI boxes, page numbers, breakup table + people/amount total), XML (`<shagun_register>` schema
with a `<host>` totals block), JSON (meta + entries), CSV (UTF-8 BOM + TOTAL row),
PNG (image snapshot), HTML (standalone, print-ready), Markdown (tables + totals),
or everything together in a ZIP with `SUMMARY.txt`. Column picker, entry scope
(whole book / selected / filtered), family name & book title for the heading,
optional totals summary.

**Tap any format card and that single file downloads instantly** — no extra button —
and the download is logged on the dashboard under **Recent exports** with its date and
time (the writer's **End** button hands its chosen format here too, so arriving from
the writer downloads that file at once). Every format carries the **project name + generated date & time** (PDF / HTML /
PNG header, XML `<project>` + `<generated>`, JSON meta, CSV closing lines, Markdown,
ZIP `SUMMARY.txt`), and files are named after the project
(`project-name-YYYYMMDD-HHMM.ext`).

PDF/PNG/ZIP use CDN libraries (jsPDF, html2canvas, JSZip); if they cannot load the app
says so plainly and **“Print / Save PDF”** always works. XML/JSON/CSV/HTML/Markdown
are generated 100% offline.

---

## Design notes

- Rose-pink palette sampled from the Ganesha artwork: rose `#C22558`, blush
  `#EEAFB6`, dusty rose `#C05C72`, neon rose `#E4638F` / `#E8789E` over plum
  `#25000D` / `#670528`; emerald `#00FFA3` for money & success states
- Glass panels: layered `backdrop-filter` blur + saturate, gradient hairline borders
- Petals: `contain: strict` layer, `pointer-events: none`, four rose gradients; removed
  entirely under `prefers-reduced-motion`
- Curtain: two neon-edged panels, `cubic-bezier(.76,0,.24,1)` glide
- Fully responsive from 360 px up; keyboard-friendly (Enter chain, ESC closes the modal)

---

## Tests

```bash
npm i --no-save jsdom jspdf jspdf-autotable@3.5.31
node tests/smoke.js        # 41 checks
node tests/dom-test.js     # 83 checks
node tests/writer-test.js  # 28 checks
node tests/lock-test.js    # 28 checks
node tests/pdf-test.js     # real PDF
```

Bugs these tests caught and fixed along the way: a duplicate CSV header line, DOM-state
dependent checkbox selection, an `aria-label` quote-break XSS, and a mis-ordered
Enter-chain assertion in the writer.
