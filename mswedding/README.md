# Mahati & Sankar – wedding invitation website

A static site: no build step, no server code, no database. Upload and it works.

```
index.html               the whole site. Styling, scripts, fonts, ornaments, your three photos AND the music are all BUILT IN
audio/song.mp3           the same music as a normal file (used first when present, because it starts a little faster)
standalone.html          an identical copy of the site, for hosts that want a single file
images/                  your three couple photos, bells, banana tree, leaf, gopuram, monogram, favicon and the link-preview picture
fonts/                   Pinyon Script and Playfair Display (SIL Open Font License, licences included)
```

## Nothing can go missing

Everything the page needs is inside `index.html`, including the song. So even if only that one file reaches your host,
the photos, the fonts and the music all still work. If `audio/song.mp3` is there it is used; if not, the built-in copy
plays. `index.html` is about 6 MB because of this, which is normal for a music-and-photo invitation.

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
3. **Photo gallery and QR code, and guest wishes.** See the next two sections.

## Event photo gallery and QR code ("Share your photos")

The QR code appears automatically once the site is online. Guests scan it, the invitation opens, they tap the curtain,
and the page jumps straight to the gallery. Print it from the "Save the QR code" link (a large PNG).
Choose how guests share photos; all settings are in the `GALLERY` block in `index.html` (search for `var GALLERY`).

**Option 1: a shared album (easiest, 5 minutes).** Create a shared album in Google Photos, turn on collaboration, copy
its link and paste it into `albumUrl`. The gallery shows an "Open the shared album" button, and the QR code opens the
album directly. Guests need a Google account to add photos.

**Option 2: upload right inside the page (no accounts for guests).** Uses a free Cloudinary account:
1. Sign up at cloudinary.com and copy your **Cloud name** from the dashboard.
2. Settings, Upload, Upload presets, "Add upload preset". Set **Signing mode: Unsigned**, name it (for example `wedding`), save.
3. Settings, Security: make sure **Resource list** is *not* ticked under "Restricted media types", so the gallery can list photos.
4. In `GALLERY`, fill in `cloudName`, `uploadPreset`, and `siteUrl` (your website address, so the QR points to it).

Guests then tap "Add your photos", pick several at once (they are shrunk on the phone first to save data), and everyone
sees the gallery. Tap a photo to view it large. Anyone with the link can upload, so check the photos in your Cloudinary
Media Library and delete anything unwanted. This option needs internet access to Cloudinary, so I could only test it
against a simulated service, not a real account. Try one upload before the wedding.

The big "Click to upload your photos" button is always visible. With Option 2 it uploads; with Option 1 it opens your album.
If you set neither option, the button only shows guests a preview of their own photos on their own phone (it says so), so
connect one of the two options before you share the link. A small "Show QR code" link under the gallery reveals the QR.

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
- The story: the "Our story" section holds your text; the threads graphic beside it follows the scroll.
- The credit box at the very bottom: search for `class="credit"`. Delete that whole `<a>` block to remove it.
- Colours: the `:root` block near the top of the `<style>`.
- Song: to change it, ask for a rebuild, because the song is packed inside `index.html` and `standalone.html`.
  (Replacing `audio/song.mp3` alone only works if you also delete the built-in copy, the `songData` block at the end of `index.html`.)

## Notes

- Works best on a phone in portrait; on a computer it shows as a centred phone-width column.
- The music is your MH track. It starts when a guest opens the curtain (browsers only allow sound after a tap) and loops. The Music button in the
  bottom bar turns all sound on or off, including the bells, and remembers the choice on that device.
- If the script cannot run, the curtain removes itself after a few seconds so guests are never stuck.
- The bell sounds are generated in the browser and need no files.
- The "Our story" graphic pins to the screen while guests scroll, and follows their scroll. With reduced motion turned on in
  a phone's settings, it shows the finished heart instead.
