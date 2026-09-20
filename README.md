# Jobossky Studios

Single-page website for digital wedding invites: one link, one QR code, with events,
map, games and RSVP inside. Plain HTML, CSS and JavaScript. No build step, no dependencies,
no external services (the QR code library is built into `index.html`).

## Files

| File | What it is |
|------|------------|
| `index.html` | The whole site |
| `share.jpg` | Preview image for WhatsApp and social links (1200x630). Replace with your own design any time. |
| `me.jpg` | **Add this.** Your portrait for the contact card. Until it exists, a "J" monogram appears. |
| `.nojekyll` | Makes GitHub Pages serve the files as they are |

## Edit your details

Open `index.html`, search for `EDIT THESE` and change the `CONFIG` block:

```js
whatsapp: "919566134537",        // country code + number, digits only
phoneDisplay: "+91 95661 34537",
photo: "me.jpg",
qrUrl: "",                       // link the sample QR opens. Empty = this website
formspreeId: "",                 // optional, see below
demoUrl: "",                     // link to a sample invite to show a "see a finished one" strip
```

No email address is needed anywhere. Visitors contact you on WhatsApp or by phone.

**The sample QR code** on the page opens your website by default. To make it open a finished
sample invite instead, put that invite's address in `qrUrl`.

**The enquiry form** (under "Prefer to write it down?") asks for name, mobile number, date and a note.
Without a `formspreeId` it opens WhatsApp with the details already typed. To use Formspree instead,
create a form at https://formspree.io, copy the ID from `https://formspree.io/f/YOUR_ID`,
and paste `YOUR_ID` into `formspreeId`.

## Put it on GitHub

```bash
cd jobosskystudios-site
git init
git add .
git commit -m "Jobossky Studios landing page"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/jobosskystudios-site.git
git push -u origin main
```

No command line? On github.com create a new repository, choose "uploading an existing file",
and drag in everything from this folder.

## Publish

**Vercel (your domain is already using it):** import the GitHub repo at vercel.com/new.
Framework preset: Other. Leave build and output settings empty. Then add
`www.jobosskystudios.online` under Project Settings, Domains.

**GitHub Pages:** repository Settings, Pages, Deploy from branch, `main`, `/ (root)`.

## Before you go live

- [ ] `me.jpg` added
- [ ] Scan the sample QR code with your phone to check it opens the right page
- [ ] Formspree ID added (optional)
- [ ] `share.jpg` replaced with your own design (optional)
- [ ] If the old Divakar and Soundharya invite is still needed, save it somewhere else first. Their wedding is 31 Oct 2026.

## Credits

QR codes are generated with qrcode-generator by Kazuhiko Arase (MIT license), included in `index.html`.
