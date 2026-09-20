# Jobossky Studios

Single-page website for wedding websites and digital invites.
Plain HTML, CSS and JavaScript. No build step, no dependencies.

## Files

| File | What it is |
|------|------------|
| `index.html` | The whole site |
| `share.jpg` | Preview image for WhatsApp and social links (1200x630). Replace with your own design any time. |
| `me.jpg` | **Add this.** Your portrait, shown on the contact card. Until it exists, a "J" monogram appears. |
| `.nojekyll` | Makes GitHub Pages serve the files as they are |

## Edit your details

Open `index.html`, search for `EDIT THESE` and change the `CONFIG` block:

```js
whatsapp: "919566134537",   // country code + number, digits only
phoneDisplay: "+91 95661 34537",
email: "hello@jobosskystudios.online",   // replace with your real email
photo: "me.jpg",
formspreeId: "",            // paste your Formspree form ID to activate the enquiry form
demoUrl: "",                // link to a sample wedding site to show a "see a finished one" strip
```

To get a Formspree ID: create a form at https://formspree.io, copy the ID from the endpoint
`https://formspree.io/f/YOUR_ID`, and paste `YOUR_ID` into `formspreeId`.

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

- [ ] Real email in `CONFIG`
- [ ] `me.jpg` added
- [ ] Formspree ID added (optional)
- [ ] `share.jpg` replaced with your own design (optional)
- [ ] If the old Divakar and Soundharya invite is still needed, save it somewhere else first. Their wedding is 31 Oct 2026.
