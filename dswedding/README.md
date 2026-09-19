# Divakar weds Soundharya

A one-page wedding invitation built as an airline boarding pass.
31 October and 1 November 2026 · The Royal Palms, Vettuvankeni, ECR, Chennai.

Plain static HTML. No build step, no framework, no dependencies to install.

---

## Deploy to Vercel

### Option A — drag and drop (fastest)

1. Go to <https://vercel.com/new>
2. Drag this whole folder onto the page
3. Framework Preset: **Other**. Leave Build Command and Output Directory empty.
4. Deploy

### Option B — Vercel CLI

```bash
npm i -g vercel
cd this-folder
vercel          # preview deployment
vercel --prod   # production
```

### Option C — Git

Push this folder to a GitHub repo, then Import Project on Vercel.
Framework Preset: **Other**. No build command, no output directory.

---

## Do this immediately after the first deploy

Vercel gives you a URL such as `divakar-soundharya.vercel.app`.
Open `index.html` and replace every occurrence of:

```
REPLACE-WITH-YOUR-DOMAIN.vercel.app
```

with your real domain. There are **five** occurrences, all in `<head>`:
`canonical`, `og:image`, `og:url`, `twitter:image`, and the description block.

This matters more than it sounds. Those tags are what WhatsApp, Instagram
and iMessage read to build the link preview. Until they point at the real
domain, guests sharing the link will see a bare URL instead of the card.

Then redeploy.

---

## Turn on RSVP replies

Check-in replies are not connected yet. Open `index.html`, find `CONFIG`
near the top of the `<script>` block, and put your WhatsApp number in:

```js
const CONFIG = {
  weddingISO: "2026-11-01T10:30:00+05:30",
  flight: "DS 3110",
  whatsapp: "91XXXXXXXXXX"        // country code + number. No +, no spaces.
};
```

Example: `whatsapp: "919840123456"`

Until you do, the form still issues each guest their boarding pass on
screen, but nothing is sent to you and the form says so honestly.

Prefer a spreadsheet? Two alternatives are documented in a comment right
above the check-in function: a Google Form POST, or Firebase Firestore.

---

## What's in here

| File | What it is |
|---|---|
| `index.html` | The entire site. All CSS and JS inline. 93 KB. |
| `pg1.jpg` … `pg6.jpg` | The six photos behind the scratch-off foil |
| `pax-divakar.png`, `pax-soundharya.png` | Childhood passport photos on the pass |
| `share.jpg` | 1200×630 link preview card for WhatsApp and social |
| `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192/512.png` | Icons, built from the D/S monogram |
| `site.webmanifest` | Lets guests add it to a phone home screen |
| `vercel.json` | Clean URLs, plus a one-year immutable cache on images |
| `assets/` | Optional `bg.mp3` for the audio button. See the note inside. |

Fonts load from Google Fonts: Archivo Black, IBM Plex Sans, IBM Plex Mono.

---

## Editing the content

Everything lives in `index.html`. Useful anchors to search for:

- **Dates and times** — `CONFIG.weddingISO` drives the countdown. The itinerary
  times are plain text in the `<section id="itinerary">` block.
- **Calendar buttons** — each event carries `data-start` / `data-end` in
  **UTC**, not IST. IST is UTC+5:30, so 09:00 IST is `033000Z`.
- **The venue** — `<section id="arrival">`
- **Family names** — `<section id="manifest">`
- **Photo captions** — the `<figcaption>` and `data-memory` on each figure
- **Colours** — the `:root` block at the top. Navy `--navy-abyss`, gold `--gold`.

To swap a photo, replace the `.jpg` file and keep the same name. The gold
foil sits on top and needs no change. Photos are cropped to 3:4.

---

## Notes

- Single committed theme. The page is navy and gold in every browser, and
  deliberately does not follow the visitor's light or dark setting.
- Every animation is disabled automatically for visitors who have
  "reduce motion" turned on. The scratch panels open for them on load.
- No cookies, no analytics, no tracking, no third-party scripts.
  The only external request is the Google Fonts stylesheet.
- Tested for horizontal overflow at 320, 360, 390, 430 and 1150px wide.
