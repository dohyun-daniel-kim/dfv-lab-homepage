# DF&V Lab — al-folio style (static replica)

A second design option for comparison, styled after the popular academic theme
**[al-folio](https://github.com/alshedivat/al-folio)**: right-aligned profile, slab-serif headings,
a "news" table, a year-gutter publication list, social icons, and a light/dark toggle.

Built as **plain static HTML** so you can preview instantly (just double-click `index.html`) —
no Ruby/Jekyll needed. Compare against the dark "tech" version in `..\dfv-lab-site\`.

## Pages
`index.html` (about) · `members.html` · `publications.html` · `projects.html` · `awards.html` · `lectures.html` · `news.html` · `contact.html`

**This is the chosen design (option B).** Content mirrors dfv-lab.com: Korean stays Korean, English stays English (Noto Sans KR loaded). Logos in `assets/img/` (logo1 banner on about, logo4 emblem in navbar/favicon). A `CNAME` file (`www.dfv-lab.com`) is included for GitHub Pages.

## Edit
- Navbar / footer: `assets/js/main.js`
- Colors, fonts, layout: `assets/css/style.css` — accent is `--theme` (one line, currently `#0b6bcb`; al-folio's default is `#b509ac`).
- Profile photo: replace the `<div class="ph">DK</div>` placeholder in `index.html` with `<img src="assets/img/prof.jpg" alt="Dohyun Kim">`.
- Social links: fill the `#` placeholders (Google Scholar, ORCID, GitHub) in `index.html`.

## Two ways to ship this look

**A) This static replica** — deploy like any static site (Cloudflare Pages / Netlify / GitHub Pages), then
point `www.dfv-lab.com` at it. Fastest; no toolchain.

**B) The real al-folio (Jekyll)** — if you prefer the genuine theme with its built-in features
(automatic BibTeX rendering from `.bib`, blog, CV, collections):
1. Use the al-folio template repo on GitHub (fork / "use this template").
2. Edit `_config.yml`, `_pages/about.md`, `_news/`, `_bibliography/papers.bib`, `_data/`.
3. Enable GitHub Pages (or `bundle exec jekyll serve` locally — needs Ruby + Bundler).
4. Add a `CNAME` file with `www.dfv-lab.com` and update DNS.

The content here maps 1:1 onto al-folio's structure, so moving to option B later is straightforward.
