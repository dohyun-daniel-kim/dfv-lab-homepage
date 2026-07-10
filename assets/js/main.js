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
    <a href="index.html" class="brand" style="display:flex;align-items:center;gap:.5rem;"><img src="assets/img/logo4.png" alt="DF&amp;V Lab" style="height:30px;width:30px;object-fit:contain;" /><span class="brand-text">DF&amp;V Lab</span></a>
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
  const isMobileNav = () => window.matchMedia("(max-width: 860px)").matches;

  // background after scrolling a bit + (mobile) auto-hide the header on scroll-down,
  // reveal on scroll-up, so the taller wrapping menu doesn't eat reading space.
  let lastY = window.scrollY;
  const onScroll = () => {
    if (!nav) return;
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 8);
    if (isMobileNav() && y > 140 && y > lastY) {
      nav.classList.add("nav-hidden");                       // scrolling down → hide
      document.querySelectorAll(".has-dd.open").forEach((o) => o.classList.remove("open"));
    } else if (!isMobileNav() || y < lastY) {
      nav.classList.remove("nav-hidden");                    // scrolling up / desktop → show
    }
    lastY = y;
  };
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

  // mobile: tap a section that has a sub-menu to expand/collapse it (hover doesn't work on touch)
  document.querySelectorAll(".has-dd").forEach((dd) => {
    const link = dd.querySelector(":scope > a");
    if (!link) return;
    link.addEventListener("click", (e) => {
      if (!isMobileNav()) return;            // desktop keeps hover behavior
      e.preventDefault();                    // first tap toggles instead of navigating
      const wasOpen = dd.classList.contains("open");
      document.querySelectorAll(".has-dd.open").forEach((o) => o.classList.remove("open"));
      if (!wasOpen) dd.classList.add("open");
    });
  });
  // close any open sub-menu when tapping outside the nav
  document.addEventListener("click", (e) => {
    if (e.target.closest && !e.target.closest(".has-dd")) {
      document.querySelectorAll(".has-dd.open").forEach((o) => o.classList.remove("open"));
    }
  });

  // news rendering from shared data (assets/js/news-data.js)
  const NEWS = window.NEWS || [];

  // stable per-item anchor id (date digits, suffixed when a date repeats) so the
  // homepage recent-news cards can deep-link to the exact item on the year page.
  const newsAnchor = (() => {
    const seen = {};
    const map = new Map();
    NEWS.forEach((n) => {
      const base = "n-" + n.date.replace(/[^0-9]/g, "");
      const c = (seen[base] = (seen[base] || 0) + 1);
      map.set(n, base + (c > 1 ? "-" + c : ""));
    });
    return (n) => map.get(n);
  })();

  // news hub: sync each year-card preview to that year's most recent photo
  document.querySelectorAll(".year-card").forEach((card) => {
    const m = (card.getAttribute("href") || "").match(/news-(\d{4})\.html/);
    const ylEl = card.querySelector(".yl");
    const year = m ? m[1] : (ylEl ? ylEl.textContent.trim() : "");
    if (!year) return;
    const latest = NEWS.find((n) => n.date.slice(0, 4) === year && n.imgs && n.imgs.length);
    const img = card.querySelector("img");
    if (latest && img) img.src = "assets/img/news/" + year + "/" + latest.imgs[0];
  });
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
      '<div class="na" id="' + newsAnchor(n) + '"><div class="nh"><span class="nd">' + n.date + "</span>" + n.title + "</div>" +
      (n.body ? '<div class="nb">' + n.body + "</div>" : "") + newsImg(n) + "</div>"
    ).join("");
    initCarousels(yearEl);

    // items are injected by JS, so the browser's native scroll-to-hash on load
    // finds nothing — scroll to the deep-linked item ourselves, offset for the
    // fixed nav, and briefly highlight it.
    if (location.hash) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) requestAnimationFrame(() => {
        const navH = (nav ? nav.offsetHeight : 0) + 16;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: "auto" });
        target.classList.add("news-flash");
        setTimeout(() => target.classList.remove("news-flash"), 2000);
      });
    }
  }
  // homepage: recent news as a card grid (representative photo + date + title)
  const recentEl = document.getElementById("recent-news");
  if (recentEl) {
    const recentCount = parseInt(recentEl.getAttribute("data-count") || "5", 10);
    const card = (n) => {
      const y = n.date.slice(0, 4);
      const thumb = (n.imgs && n.imgs.length)
        ? '<img src="assets/img/news/' + y + '/' + n.imgs[0] + '" loading="lazy" alt="" />'
        : '<span class="nc-noimg"><i class="fa-regular fa-newspaper"></i></span>';
      return '<a class="news-card" href="news-' + y + '.html#' + newsAnchor(n) + '">' +
        '<div class="nc-thumb">' + thumb + "</div>" +
        '<div class="nc-body"><span class="nc-date">' + n.date + "</span>" +
        '<span class="nc-title">' + n.title + "</span></div></a>";
    };
    recentEl.innerHTML = NEWS.slice(0, recentCount).map(card).join("");
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
