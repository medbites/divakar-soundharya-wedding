# Mahati & Sankar – wedding invitation website

A static site: no build step, no server code, no database. Upload and it works.

```
index.html               the whole site. Styling, scripts, fonts, bells, ornaments and the three photos are BUILT IN
audio/song.mp3           the background music (128 kbps, 3 min 44 s, loops). The only separate file the page needs
standalone.html          the same site with the music packed in too, so it needs nothing else
images/ and fonts/       plain copies of the pictures and fonts, for your own use and for the link-preview image
```

## The one rule

Put `audio/song.mp3` next to `index.html` (inside an `audio` folder). If the music file is missing or in the wrong
place the site still looks perfect, including the photos, but plays no music. The page also tries `song.mp3` in the
same folder, so a flat upload works too. Or upload `standalone.html` alone, which has the music inside.

If you unzip and double-click, open the unzipped folder, not the zip itself.

## Put it online (pick one)

- **Netlify** – "Add new site", "Deploy manually", drag the unzipped folder onto the page.
- **Cloudflare Pages** – "Create a project", "Upload assets", drop the unzipped folder.
- **GitHub Pages** – put the files at the top of a repository, then Settings, Pages, deploy from the main branch.
- **Normal web hosting (cPanel, GoDaddy, Hostinger)** – upload everything inside the folder into `public_html`
  so that `index.html` sits at the top level.

Use https. The hosts above give it to you free.

## Before you share the link

1. **Link preview (WhatsApp, iMessage).** In `index.html`, find `YOUR-DOMAIN.com` and replace it with your real
   address, for example `https://mahati-sankar.netlify.app`. The preview picture is `images/og-image.jpg`.
2. **RSVP buttons.** In `index.html`, search for `RSVP_CONTACTS` and add family contacts, for example
   `{ name: "Priya", phone: "919876543210" }` (country code plus number, digits only).
   The RSVP section stays hidden until you add at least one.
3. **Guest wishes.** See the next section.

## Guest wishes ("Leave a little love")

A plain website has no database, so decide how you want to receive wishes:

- **Right now (no setup):** each wish is saved on the guest's own device only. Other guests do not see it, and you do not receive it.
- **To receive every wish:** create a free form at Formspree (formspree.io) or a Google Apps Script web app, copy its https address,
  and paste it into `WISHES_CFG.endpoint` in `index.html`. Every wish is then posted to it and emailed to you.
- **To show wishes to everyone:** copy the ones you want to show into `WISHES_CFG.curated`, like
  `{ text: "Wishing you both a lifetime of joy.", name: "Priya" }`, then upload the file again.
  Curating by hand also means nothing unwanted ever appears on your public page.

## Other things you may want to edit (all inside `index.html`)

- Names, dates, times, venue and map link: search for "Sree Varaaham Hall".
- Photos: they are built into `index.html`. To swap them, upload your own JPGs and set the paths in `PHOTOS`
  (for example `p1: "images/moment-1.jpg"`), or send them to whoever built the site to rebuild. The third card is wide.
  Captions are in the "Meet us" section.
- Calendar event times: `events`. Countdown target: `target`.
- Family and "Warm regards" names: the "Our families" section. The grandparents' names were read from the
  Tamil page of the printed card; check the spellings.
- Colours: the `:root` block near the top of the `<style>`.
- Song: replace `audio/song.mp3` with another MP3 of the same name (keep it under about 4 MB).
  `standalone.html` has the old song packed inside it, so use `index.html` plus the folder if you change the song.

## Notes

- Works best on a phone in portrait; on a computer it shows as a centred phone-width column.
- Music starts when a guest opens the curtain (browsers only allow sound after a tap) and loops. The Music button in the
  bottom bar turns all sound on or off, including the bells, and remembers the choice on that device.
- If the script cannot run, the curtain removes itself after a few seconds so guests are never stuck.
- The bell sounds are generated in the browser and need no files.
- The Tamil "உ" symbol in "Our families" uses the visitor's own system font.
