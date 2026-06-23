/* ============================================================
   DF&V Lab (al-folio style) — nav/footer injection + theme
   ============================================================ */

const NAV = [
  { label: "home", href: "index.html" },
  { label: "members", href: "researchers.html", children: [["researchers", "researchers.html"], ["alumni", "alumni.html"]], extra: ["professor.html"] },
  { label: "publications", href: "papers-international.html", children: [["papers (international)", "papers-international.html"], ["papers (domestic)", "papers-domestic.html"], ["patents", "patents.html"], ["software copyrights", "software.html"], ["books & technical reports", "books.html"]] },
  { label: "researches", href: "research-area.html", children: [["research area", "research-area.html"], ["projects", "projects.html"], ["digital forensic investigations", "investigations.html"]] },
  { label: "awards", href: "awards.html" },
  { label: "lectures", href: "lectures.html" },
  { label: "news", href: "news.html", children: [["2026", "news-2026.html"], ["2025", "news-2025.html"], ["2024", "news-2024.html"], ["2023", "news-2023.html"], ["2022", "news-2022.html"], ["2021", "news-2021.html"]] },
  { label: "schedule", href: "schedule.html" },
  { label: "contact", href: "contact.html" },
];

const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
const fname = (h) => (h.split("#")[0].split("/").pop() || "index.html").toLowerCase();

const links = NAV.map((item) => {
  const active = (fname(item.href) === current || (item.children || []).some((c) => fname(c[1]) === current) || (item.extra || []).some((e) => fname(e) === current)) ? "active" : "";
  if (item.children) {
    const sub = item.children.map((c) => `<a href="${c[1]}">${c[0]}</a>`).join("");
    return `<div class="has-dd"><a href="${item.href}" class="${active}">${item.label}</a><div class="dd">${sub}</div></div>`;
  }
  return `<a href="${item.href}" class="${active}">${item.label}</a>`;
}).join("");

const NAVBAR = `
<nav class="nav" id="nav">
  <div class="nav-inner">
    <a href="index.html" class="brand" style="display:flex;align-items:center;gap:.5rem;"><img src="assets/img/logo4.png" alt="" style="height:30px;width:30px;object-fit:contain;" />DF&amp;V Lab</a>
    <div class="nav-right">
      <div class="nav-links" id="nav-links">${links}</div>
    </div>
  </div>
</nav>`;

const FOOTER = `
<footer>
  <div class="container">
    © <span id="yr"></span> DF&amp;V Lab. Styled after the
    <a href="https://github.com/alshedivat/al-folio" target="_blank" rel="noopener">al-folio</a> theme.<br>
    Digital Forensics &amp; Vulnerability Research Laboratory, Korea Maritime &amp; Ocean University.
  </div>
</footer>`;

document.addEventListener("DOMContentLoaded", () => {
  const h = document.getElementById("site-nav");
  const f = document.getElementById("site-footer");
  if (h) h.outerHTML = NAVBAR;
  if (f) f.outerHTML = FOOTER;

  const yr = document.getElementById("yr");
  if (yr) yr.textContent = "2026";

  const nav = document.getElementById("nav");
  const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // nav bar is always visible on mobile (see style.css @media) — no hamburger toggle needed.
  // The wrapping menu makes the header taller on narrow screens, so match the main top padding
  // to the actual header height (desktop keeps the CSS default).
  const fitNavPadding = () => {
    const m = document.querySelector("main");
    if (!nav || !m) return;
    m.style.paddingTop = window.innerWidth <= 860 ? nav.offsetHeight + 24 + "px" : "";
  };
  fitNavPadding();
  window.addEventListener("resize", fitNavPadding);
  window.addEventListener("load", fitNavPadding);

  // news rendering from shared data (assets/js/news-data.js)
  const NEWS = window.NEWS || [];
  const newsImg = (n) => {
    if (!n.imgs || !n.imgs.length) return "";
    const y = n.date.slice(0, 4);
    const slide = (f) => '<a href="assets/img/news/' + y + '/' + f + '"><img src="assets/img/news/' + y + '/' + f + '" loading="lazy" alt="" /></a>';
    if (n.imgs.length === 1) return '<div class="news-media single">' + slide(n.imgs[0]) + "</div>";
    return '<div class="news-media carousel">' +
      '<button class="cbtn prev" type="button" aria-label="이전 사진">&#10094;</button>' +
      '<div class="carousel-track">' + n.imgs.map(slide).join("") + "</div>" +
      '<button class="cbtn next" type="button" aria-label="다음 사진">&#10095;</button>' +
      '<div class="carousel-count"><span class="cur">1</span> / ' + n.imgs.length + "</div>" +
      "</div>";
  };
  const initCarousels = (root) => {
    root.querySelectorAll(".carousel").forEach((c) => {
      const track = c.querySelector(".carousel-track");
      const cur = c.querySelector(".cur");
      const go = (dir) => track.scrollBy({ left: dir * track.clientWidth, behavior: "smooth" });
      c.querySelector(".cbtn.prev").addEventListener("click", () => go(-1));
      c.querySelector(".cbtn.next").addEventListener("click", () => go(1));
      track.addEventListener("scroll", () => {
        const i = Math.round(track.scrollLeft / track.clientWidth) + 1;
        if (cur) cur.textContent = String(Math.min(track.children.length, Math.max(1, i)));
      }, { passive: true });
    });
  };
  const yearEl = document.getElementById("news-year");
  if (yearEl) {
    const yr = yearEl.getAttribute("data-year");
    yearEl.innerHTML = NEWS.filter((n) => n.date.slice(0, 4) === yr).map((n) =>
      '<div class="na"><div class="nh"><span class="nd">' + n.date + "</span>" + n.title + "</div>" +
      (n.body ? '<div class="nb">' + n.body + "</div>" : "") + newsImg(n) + "</div>"
    ).join("");
    initCarousels(yearEl);
  }
  const recentEl = document.getElementById("recent-news");
  if (recentEl) {
    const count = parseInt(recentEl.getAttribute("data-count") || "5", 10);
    recentEl.innerHTML = NEWS.slice(0, count).map((n) =>
      '<li><span class="d">' + n.date + "</span><span>" + n.title + "</span></li>"
    ).join("");
  }

  // intro KO / EN toggle
  const langBtns = document.querySelectorAll(".lang-btn");
  if (langBtns.length) {
    langBtns.forEach((b) => b.addEventListener("click", () => {
      const lang = b.getAttribute("data-lang");
      langBtns.forEach((x) => x.classList.toggle("active", x.getAttribute("data-lang") === lang));
      document.querySelectorAll(".intro[data-lang]").forEach((p) => { p.hidden = (p.getAttribute("data-lang") !== lang); });
    }));
  }

  // lightbox / popup for images
  const lb = document.createElement("div");
  lb.id = "lightbox";
  lb.innerHTML = '<span class="lb-close" aria-label="Close">&times;</span><img alt="" />';
  document.body.appendChild(lb);
  const lbImg = lb.querySelector("img");
  const closeLb = () => { lb.classList.remove("open"); lbImg.src = ""; };
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a");
    if (a && /\.(jpg|jpeg|png|gif|webp)$/i.test(a.getAttribute("href") || "")) {
      e.preventDefault();
      lbImg.src = a.href;
      lb.classList.add("open");
    }
  });
  lb.addEventListener("click", closeLb);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLb(); });
});
