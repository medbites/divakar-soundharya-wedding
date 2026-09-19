# Mahati & Sankar – wedding invitation website

A static site: no build step, no server code, no database. Upload and it works.

```
index.html               the whole site (styling and scripts are inside this one file)
standalone.html          the same site with EVERYTHING packed into one file (photos, fonts, music)
images/                  couple photos, bells, banana tree, leaf, gopuram, monogram, favicon, share preview
fonts/                   Pinyon Script and Playfair Display (SIL Open Font License, licences included)
audio/song.mp3           the background music (128 kbps, 3 min 44 s, loops)
```

## If the page ever looks plain or unstyled

That means the browser could not find something next to `index.html`. Two quick fixes:

1. **Unzip first.** Open the unzipped folder, not the zip itself, and keep `index.html` together with the
   `images`, `fonts` and `audio` folders.
2. **Or use `standalone.html`.** It needs nothing else. Double-click it, or upload just that one file
   (rename it to `index.html` if your host expects that name).

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
- Photos: replace `images/moment-1.jpg`, `moment-2.jpg`, `moment-3.jpg` (keep the names; the third is wide).
  Captions are in the "Meet us" section.
- Calendar event times: `events`. Countdown target: `target`.
- Family and "Warm regards" names: the "Our families" section. The grandparents' names were read from the
  Tamil page of the printed card; check the spellings.
- Colours: the `:root` block at the top of the `<style>`.
- Song: replace `audio/song.mp3` with another MP3 of the same name (keep it under about 4 MB).
  If you use `standalone.html`, the song is packed inside it, so edit `index.html` and the folder instead.

## Notes

- Works best on a phone in portrait; on a computer it shows as a centred phone-width column.
- Music starts when a guest opens the curtain (browsers only allow sound after a tap) and loops. The Music button in the
  bottom bar turns all sound on or off, including the bells, and remembers the choice on that device.
- If the script cannot run, the curtain removes itself after a few seconds so guests are never stuck.
- The bell sounds are generated in the browser and need no files.
- The Tamil "உ" symbol in "Our families" uses the visitor's own system font.
