# TalkCX Website

Marketing site for **TalkCX** — a vendor-neutral CCaaS and conversational AI consultancy, and official reseller partner for [PolyAI](https://poly.ai). Built as a static HTML/CSS/JS site with no build step, deployed to GitHub Pages via GitHub Actions.

## Structure

```
index.html          Home
about.html           About TalkCX
services.html        Services & indicative fees
partners.html        Partners (PolyAI, Casey Business Solution)
contact.html         Contact form (mailto) + details
assets/css/style.css Design system (neon palette, components)
assets/js/main.js    Mobile nav, scroll reveal, contact form
assets/img/          Favicon and other images
.github/workflows/   GitHub Pages deploy workflow
```

## Brand palette

| Color | Hex | Usage |
|---|---|---|
| Neon Yellow | `#faeb2c` | Accents, stat highlights |
| Neon Pink | `#f52789` | Primary accent, links, eyebrows |
| Neon Magenta | `#e900ff` | Gradient accent, glows |
| Neon Blue | `#1685f8` | Gradient accent, focus states |
| Deep Purple | `#3d144c` | Background base |

## Local preview

No build step — just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which publishes the repo root to GitHub Pages. Enable Pages once under **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## To update before going live

- Contact email is `info@talkcx.co.uk` (in every `.html` footer/contact section and in `assets/js/main.js`) — update everywhere if it changes again.
- Confirm the Casey Business Solution description on `partners.html` — it's a neutral placeholder pending their own copy/logo.
- Add real logos for PolyAI and Casey Business Solution in `assets/img/` and swap them in for the text wordmarks on `index.html` and `partners.html`.
- Add a custom domain via `CNAME` if you don't want the default `github.io` URL.
