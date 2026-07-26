/* Site behaviour: sidebar rendering, on-page TOC, code block chrome,
   copy-to-clipboard, mobile nav, and a lightweight command-palette search.
   Works over file:// because it never uses fetch() — NAV_DATA is a plain
   global loaded via <script src="nav-data.js">. */
(function () {
  "use strict";

  const body = document.body;
  const loc = body.dataset.loc || "root"; // "root" | "chapter"
  const currentFile = body.dataset.file || "";

  function hrefFor(file) {
    return loc === "root" ? "chapters/" + file : file;
  }
  function homeHref() {
    return loc === "root" ? "index.html" : "../index.html";
  }

  /* ------------------------- Chapter numbering ------------------------- */
  const FLAT_CHAPTERS = [];
  NAV_DATA.forEach((g) => g.items.forEach((it) => FLAT_CHAPTERS.push(it)));
  const CHAPTER_NUM = new Map(FLAT_CHAPTERS.map((it, i) => [it.file, i + 1]));
  const TOTAL_CHAPTERS = FLAT_CHAPTERS.length;

  /* ------------------------------ Sidebar ------------------------------ */
  function buildSidebar() {
    const nav = document.getElementById("sidebar-nav");
    if (!nav) return;
    const frag = document.createDocumentFragment();
    NAV_DATA.forEach((group) => {
      const wrap = document.createElement("div");
      wrap.className = "nav-section";
      const h = document.createElement("div");
      h.className = "nav-section-title";
      h.textContent = group.section;
      wrap.appendChild(h);
      const ul = document.createElement("ul");
      ul.className = "nav-list";
      group.items.forEach((item) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = hrefFor(item.file);
        const num = document.createElement("span");
        num.className = "nav-num";
        num.textContent = String(CHAPTER_NUM.get(item.file)).padStart(2, "0");
        const label = document.createElement("span");
        label.className = "nav-label";
        label.textContent = item.title;
        a.appendChild(num);
        a.appendChild(label);
        if (item.file === currentFile) a.classList.add("active");
        li.appendChild(a);
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
      frag.appendChild(wrap);
    });
    nav.appendChild(frag);

    const active = nav.querySelector("a.active");
    if (active) {
      active.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  /* --------------------------- Prev / next links --------------------------- */
  function buildPageNav() {
    const holder = document.getElementById("page-nav");
    if (!holder) return;
    const idx = FLAT_CHAPTERS.findIndex((it) => it.file === currentFile);
    if (idx === -1) return;
    const prev = FLAT_CHAPTERS[idx - 1];
    const next = FLAT_CHAPTERS[idx + 1];
    let html = "";
    if (prev) {
      html += `<a class="prev" href="${hrefFor(prev.file)}"><span class="dir">&larr; Chapter ${idx} · Previous</span><span class="title">${prev.title}</span></a>`;
    } else {
      html += `<span></span>`;
    }
    if (next) {
      html += `<a class="next" href="${hrefFor(next.file)}"><span class="dir">Chapter ${idx + 2} · Next &rarr;</span><span class="title">${next.title}</span></a>`;
    }
    holder.innerHTML = html;
  }

  /* --------------------------- Chapter badge (top of page) --------------------------- */
  function buildChapterBadge() {
    const badge = document.getElementById("chapter-badge");
    if (!badge) return;
    const num = CHAPTER_NUM.get(currentFile);
    if (!num) return;
    badge.textContent = `Chapter ${num} of ${TOTAL_CHAPTERS}`;
  }

  /* --------------------------- On-page TOC (right rail) --------------------------- */
  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  function buildToc() {
    const content = document.querySelector("main.content");
    const tocList = document.getElementById("toc-list");
    if (!content || !tocList) return;
    const headings = content.querySelectorAll("h2, h3");
    if (!headings.length) {
      const tocBox = document.getElementById("toc");
      if (tocBox) tocBox.style.display = "none";
      return;
    }
    const used = new Set();
    const links = [];
    headings.forEach((h) => {
      if (!h.id) {
        let base = slugify(h.textContent);
        let id = base;
        let n = 1;
        while (used.has(id)) id = base + "-" + n++;
        used.add(id);
        h.id = id;
      }
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent;
      a.className = h.tagName.toLowerCase();
      li.appendChild(a);
      tocList.appendChild(li);
      links.push({ id: h.id, a });
    });

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = links.find((l) => l.id === entry.target.id);
          if (!link) return;
          if (entry.isIntersecting) {
            links.forEach((l) => l.a.classList.remove("active"));
            link.a.classList.add("active");
            link.a.scrollIntoView({ block: "nearest", behavior: "smooth" });
          }
        });
      },
      { rootMargin: "-15% 0px -70% 0px" }
    );
    headings.forEach((h) => spy.observe(h));
  }

  /* --------------------------- Code block chrome --------------------------- */
  function decorateCodeBlocks() {
    document.querySelectorAll(".code-block").forEach((block) => {
      const lang = block.dataset.lang;
      if (lang && !block.querySelector(".code-label")) {
        const label = document.createElement("div");
        label.className = "code-label";
        label.innerHTML = `<span>${lang}</span>`;
        block.insertBefore(label, block.firstChild);
      }
      const codeEl = block.querySelector("pre code");
      if (codeEl && !block.querySelector(".copy-btn")) {
        const btn = document.createElement("button");
        btn.className = "copy-btn";
        btn.type = "button";
        btn.textContent = "Copy";
        btn.addEventListener("click", () => {
          navigator.clipboard.writeText(codeEl.textContent).then(() => {
            btn.textContent = "Copied!";
            setTimeout(() => (btn.textContent = "Copy"), 1500);
          });
        });
        block.appendChild(btn);
      }
    });
    if (window.hljs) {
      document.querySelectorAll("pre code").forEach((el) => hljs.highlightElement(el));
    }
  }

  /* --------------------------- Mobile sidebar toggle --------------------------- */
  function setupMobileNav() {
    const toggle = document.getElementById("menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    if (!toggle || !sidebar) return;
    toggle.addEventListener("click", () => sidebar.classList.toggle("open"));
    document.addEventListener("click", (e) => {
      if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
        sidebar.classList.remove("open");
      }
    });
  }

  /* --------------------------- Search palette --------------------------- */
  function setupSearch() {
    const overlay = document.getElementById("search-overlay");
    const input = document.getElementById("search-input");
    const results = document.getElementById("search-results");
    const openBtn = document.getElementById("search-open");
    if (!overlay || !input || !results) return;

    const index = [];
    NAV_DATA.forEach((group) => {
      group.items.forEach((item) => {
        index.push({ title: item.title, section: group.section, href: hrefFor(item.file) });
      });
    });

    let selected = -1;

    function render(list) {
      results.innerHTML = "";
      selected = -1;
      if (!list.length) {
        results.innerHTML = '<div class="search-empty">No pages match.</div>';
        return;
      }
      list.forEach((item) => {
        const a = document.createElement("a");
        a.href = item.href;
        a.innerHTML = `${item.title}<small>${item.section}</small>`;
        results.appendChild(a);
      });
    }

    function filter(q) {
      q = q.trim().toLowerCase();
      if (!q) return render(index);
      render(index.filter((i) => i.title.toLowerCase().includes(q) || i.section.toLowerCase().includes(q)));
    }

    function open() {
      overlay.classList.add("open");
      input.value = "";
      filter("");
      setTimeout(() => input.focus(), 30);
    }
    function close() {
      overlay.classList.remove("open");
    }

    if (openBtn) openBtn.addEventListener("click", open);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    input.addEventListener("input", () => filter(input.value));

    document.addEventListener("keydown", (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      const typing = tag === "input" || tag === "textarea";
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        open();
      } else if (e.key === "Escape") {
        close();
      } else if (overlay.classList.contains("open") && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        const links = Array.from(results.querySelectorAll("a"));
        if (!links.length) return;
        links[selected]?.classList.remove("sel");
        selected += e.key === "ArrowDown" ? 1 : -1;
        selected = (selected + links.length) % links.length;
        links[selected].classList.add("sel");
        links[selected].scrollIntoView({ block: "nearest" });
      } else if (overlay.classList.contains("open") && e.key === "Enter") {
        const links = Array.from(results.querySelectorAll("a"));
        if (links[selected]) {
          e.preventDefault();
          window.location.href = links[selected].getAttribute("href");
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildSidebar();
    buildPageNav();
    buildChapterBadge();
    buildToc();
    decorateCodeBlocks();
    setupMobileNav();
    setupSearch();
    const homeLinks = document.querySelectorAll("[data-home-link]");
    homeLinks.forEach((a) => (a.href = homeHref()));
  });
})();
