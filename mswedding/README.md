# Mahati & Sankar – wedding invitation website

A static site. No build step, no server code, no database. Upload the files and it works.

```
index.html      the page
css/style.css   all styling (fonts are declared at the top)
js/main.js      curtain, bells, scratch cards, petals, countdown, calendar links
images/         couple photos, bell, leaf, banana tree, gopuram, monogram, favicon, share preview
audio/song.mp3  the background music (128 kbps, 3 min 44 s, loops)
fonts/          Pinyon Script and Playfair Display (SIL Open Font License, licences included)
```

## Put it online (pick one)

- **Netlify** – log in, choose "Add new site", "Deploy manually", and drag the unzipped folder onto the page.
- **Cloudflare Pages** – "Create a project", "Upload assets", drop the unzipped folder.
- **GitHub Pages** – put the files at the top of a repository, then Settings, Pages, deploy from the main branch.
- **Normal web hosting (cPanel, GoDaddy, Hostinger)** – upload everything inside the folder into `public_html`
  so that `index.html` sits at the top level.

Use https. Most hosts above give it to you free.

## Before you share the link

1. **Link preview (WhatsApp, iMessage).** In `index.html`, replace `https://YOUR-DOMAIN.com` in the
   `og:image` line with your real address, for example `https://mahati-sankar.netlify.app`.
   The preview picture is `images/og-image.jpg`.
2. **Photos for "Meet us".** The three scratch cards use `images/moment-1.jpg`, `moment-2.jpg` and `moment-3.jpg`
   (the third is wide). To change one, replace the file and keep the same name. Keep each under about 300 KB.
   The captions ("Eyes only for you", "In your arms", "Side by side") are in `index.html`.
3. **RSVP buttons.** In `js/main.js` find `RSVP_CONTACTS` and add family contacts, for example
   `{ name: "Priya", phone: "919876543210" }` (country code plus number, digits only).
   The RSVP section stays hidden until you add at least one.

## Guest wishes ("Leave a little love")

Guests type a wish and their name, and a note blooms onto the wall. A plain website has no database, so decide how you want to receive them:

- **Right now (no setup):** each wish is saved on the guest's own device only. Other guests do not see it, and you do not receive it.
- **To receive every wish:** create a free form at Formspree (formspree.io) or a Google Apps Script web app, copy its https address,
  and paste it into `WISHES_CFG.endpoint` in `js/main.js`. Every wish is then posted to it and emailed to you.
- **To show wishes to everyone:** copy the ones you want to show into `WISHES_CFG.curated` in `js/main.js`, like
  `{ text: "Wishing you both a lifetime of joy.", name: "Priya" }`, then upload the file again.
  Curating by hand also means nothing unwanted ever appears on your public page.

## Other things you may want to edit

- Names, dates, times, venue and map link: `index.html` (search for "Sree Varaaham Hall").
- Calendar event times: `events` in `js/main.js`. Countdown target: `target` in the same file.
- Family and "Warm regards" names: the "Our families" section in `index.html`.
  The grandparents' names were read from the Tamil page of the printed card; check the spellings.
- Colours: the `:root` block at the top of `css/style.css`.

## Test it on your computer first

Open a terminal in this folder and run `python3 -m http.server 8000`, then visit http://localhost:8000.
(Double-clicking `index.html` also works, but a local server matches real hosting more closely.)

## Notes

- Works best on a phone in portrait; on a computer it shows as a centred phone-width column.
- Music starts when a guest opens the curtain (browsers only allow sound after a tap) and loops. The Music button in the
  bottom bar turns all sound on or off, including the bell, and remembers the choice on that device. It pauses when the
  guest switches tabs.
- To change the song, replace `audio/song.mp3` with another MP3 of the same name. Keep it under about 4 MB.
- The bell sounds are generated in the browser and need no files.
- The Tamil "உ" symbol in "Our families" uses the visitor's own system font.
