/* Shared header, footer, helpers and site-wide easter eggs. Loaded on every page after data.js. */
(function () {
  const RS = window.RS;
  const page = document.body.dataset.page;

  /* ---------- helpers ---------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const store = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode: ignore */ } },
  };
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const parseDate = (iso) => new Date(iso.length === 10 ? iso + "T00:00" : iso);
  const dateBlock = (iso, rs) => {
    const d = parseDate(iso);
    return `<div class="date-block${rs ? " rs" : ""}" aria-hidden="true"><strong>${String(d.getDate()).padStart(2, "0")}</strong><span>${months[d.getMonth()]}</span></div>`;
  };
  const fmtLong = (iso) => parseDate(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
  const fmtTime = (iso) => iso.length > 10 ? parseDate(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Registrations kept on this device (and optionally sent to config.registrationEndpoint).
  const regs = {
    all() { return store.get("rs-registrations", []); },
    save(list) { store.set("rs-registrations", list); },
    has(eventId) { return this.all().some((r) => r.eventId === eventId); },
  };
  // Events without `spots` have no cap.
  const spotsLeft = (ev) => ev.spots ? Math.max(0, ev.spots - (ev.taken || 0) - (regs.has(ev.id) ? 1 : 0)) : Infinity;
  const dayEnd = (iso) => { const d = parseDate(iso.slice(0, 10)); d.setHours(23, 59, 59); return d; };
  const isClosed = (ev) => !!ev.deadline && dayEnd(ev.deadline) < new Date();
  // Timed events drop off when they start; all-day ones at the end of their last day.
  const upcomingEvents = () => {
    const now = new Date();
    return RS.events.filter((e) => (e.date.length > 10 ? parseDate(e.date) : dayEnd(e.ends || e.date)) > now)
      .sort((a, b) => parseDate(a.date) - parseDate(b.date));
  };
  const shortDate = (iso) => { const d = parseDate(iso); return `${d.getDate()} ${months[d.getMonth()]}`; };
  // One line that says when: "25 Nov, 14:00", "Open until 26 Nov" or "10–14 February 2027".
  const whenText = (ev) => ev.when || (ev.dateLabel ? `${ev.dateLabel} ${shortDate(ev.date)}` : `${shortDate(ev.date)}${fmtTime(ev.date) ? `, ${fmtTime(ev.date)}` : ""}`);

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg, icon = "✓") {
    let t = $(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast"; t.setAttribute("role", "status"); t.setAttribute("aria-live", "polite");
      document.body.appendChild(t);
    }
    t.innerHTML = `<span class="ico" aria-hidden="true">${esc(icon)}</span><span>${esc(msg)}</span>`;
    requestAnimationFrame(() => t.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3600);
  }

  /* ---------- fx: circles & squares confetti in brand colours ---------- */
  function fxLayer() {
    let l = $(".fx-layer");
    if (!l) { l = document.createElement("div"); l.className = "fx-layer"; l.setAttribute("aria-hidden", "true"); document.body.appendChild(l); }
    return l;
  }
  const brand = ["#7f3286", "#1b478a", "#e60048", "#d59600"];
  function confetti(n = 90) {
    if (reduceMotion) return;
    const layer = fxLayer();
    for (let i = 0; i < n; i++) {
      const p = document.createElement("span");
      const size = 6 + Math.random() * 10;
      p.className = "confetti";
      p.style.cssText = `left:${Math.random() * 100}vw;width:${size}px;height:${size}px;background:${brand[i % 4]};border-radius:${Math.random() > 0.5 ? "50%" : "2px"}`;
      layer.appendChild(p);
      const drift = (Math.random() - 0.5) * 240;
      p.animate(
        [{ transform: "translate(0,0) rotate(0)" }, { transform: `translate(${drift}px, ${window.innerHeight + 60}px) rotate(${Math.random() * 720}deg)` }],
        { duration: 1800 + Math.random() * 1600, delay: Math.random() * 400, easing: "cubic-bezier(.2,.6,.4,1)", fill: "forwards" }
      ).onfinish = () => p.remove();
    }
  }

  /* ---------- easter egg bookkeeping ---------- */
  const EGGS = {
    konami: "Round mode: the square went round",
    ideals: "You typed the IDEALS",
    roll: "The Round Square mark rolled away",
    gold: "One part gold",
    sunrise: "Plus est en vous",
    hahn: "Kurt Hahn joined the committee",
  };
  function foundEgg(id) {
    const found = store.get("rs-eggs", []);
    const isNew = !found.includes(id);
    if (isNew) { found.push(id); store.set("rs-eggs", found); }
    renderEggCounter();
    toast(`${EGGS[id]}${isNew ? `. Easter egg ${found.length} of ${Object.keys(EGGS).length}` : ""}`, "★");
    if (isNew && found.length === Object.keys(EGGS).length) setTimeout(() => { toast("All six found. You are officially an IDEALS detective.", "★"); confetti(160); }, 3800);
  }
  function renderEggCounter() {
    const el = $("#egg-counter");
    if (!el) return;
    const n = store.get("rs-eggs", []).length;
    el.hidden = n === 0;
    el.textContent = `★ Easter eggs found: ${n} of ${Object.keys(EGGS).length}`;
  }

  /* ---------- header & footer ---------- */
  const navItems = [
    { href: "index.html", label: "Common Ground", key: "home" },
    { href: "committee.html", label: "Committee", key: "committee" },
    { href: "register.html", label: "Register", key: "register", cta: true },
  ];
  const band = (extra = "") => `<div class="band ${extra}" aria-hidden="true"><span class="b-purple"></span><span class="b-blue"></span><span class="b-red"></span><span class="b-gold"></span></div>`;

  const header = $("#site-header");
  if (header) {
    header.className = "site-header";
    header.innerHTML = `
      <div class="wrap">
        <a class="lockup" href="index.html" aria-label="ADIS × Round Square home">
          <img src="assets/adis-crest.png" alt="Adani International School">
          <span class="divider"></span>
          <img class="rs-mark" src="assets/round-square-mark.png" alt="Round Square">
          <span class="lockup-name">Adani International School<span>Round Square Committee</span></span>
        </a>
        <nav aria-label="Main"><ul class="nav">
          ${navItems.map((n) => `<li><a href="${n.href}" class="${n.cta && page !== n.key ? "cta" : ""}"${page === n.key ? ' aria-current="page"' : ""}>${n.label}</a></li>`).join("")}
        </ul></nav>
      </div>
      ${band()}`;
  }

  const footer = $("#site-footer");
  if (footer) {
    footer.innerHTML = `
      ${band()}
      <div class="site-footer"><div class="wrap">
        <div class="lockup">
          <img src="assets/adis-crest.png" alt="Adani International School">
          <span class="divider"></span>
          <img src="assets/round-square-mark.png" alt="Round Square">
        </div>
        <div>
          <p class="label strong">ADIS Round Square Committee</p>
          <p class="caption"><a href="mailto:${esc(RS.config.committeeEmail)}">${esc(RS.config.committeeEmail)}</a></p>
          <p id="egg-counter" class="egg-counter" hidden></p>
        </div>
        <p class="caption" style="max-width:22ch">Internationalism, Democracy, Environmentalism, Adventure, Leadership and Service.</p>
      </div></div>`;
    renderEggCounter();
  }

  /* ---------- Egg: hover the gold of the Meeting Band ---------- */
  $$(".band .b-gold").forEach((g) => {
    g.dataset.secret = "1 part gold, 100% heart";
    g.addEventListener("mouseenter", () => { if (!g.dataset.seen) { g.dataset.seen = "1"; foundEgg("gold"); } });
  });

  /* ---------- Egg: click the Round Square mark five times ---------- */
  let markClicks = 0, markTimer;
  const mark = $(".site-header .rs-mark");
  if (mark) {
    mark.addEventListener("click", (e) => {
      e.preventDefault();
      markClicks++;
      mark.classList.remove("spin"); void mark.offsetWidth; mark.classList.add("spin");
      clearTimeout(markTimer);
      markTimer = setTimeout(() => (markClicks = 0), 1500);
      if (markClicks >= 5) { markClicks = 0; rollMark(); foundEgg("roll"); }
    });
  }
  function rollMark() {
    const img = document.createElement("img");
    img.src = "assets/round-square-mark.png"; img.alt = ""; img.className = "rolling-mark";
    document.body.appendChild(img);
    const dist = window.innerWidth + 260;
    const turns = dist / (Math.PI * 110);
    img.animate(
      [{ transform: "translateX(0) rotate(0)" }, { transform: `translateX(${dist}px) rotate(${turns * 360}deg)` }],
      { duration: reduceMotion ? 1 : 3200, easing: "cubic-bezier(.45,.05,.4,1)", fill: "forwards" }
    ).onfinish = () => img.remove();
  }

  /* ---------- Eggs: Konami code (round mode) and typing "ideals" ---------- */
  const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let kPos = 0, typed = "";
  document.addEventListener("keydown", (e) => {
    if (!e.key) return; // autofill fires keydown without a key
    const tag = (e.target.tagName || "").toLowerCase();
    const typing = tag === "input" || tag === "textarea" || tag === "select";
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    kPos = key === konami[kPos] ? kPos + 1 : key === konami[0] ? 1 : 0;
    if (kPos === konami.length) {
      kPos = 0;
      document.body.classList.toggle("round-mode");
      store.set("rs-round", document.body.classList.contains("round-mode"));
      if (document.body.classList.contains("round-mode")) foundEgg("konami"); else toast("Round mode off. Back to square one.", "★");
    }
    if (typing || key.length !== 1) return;
    typed = (typed + key).slice(-6);
    if (typed === "ideals") { typed = ""; rainIdeals(); foundEgg("ideals"); }
  });
  if (store.get("rs-round", false)) document.body.classList.add("round-mode");

  function rainIdeals() {
    if (reduceMotion) return;
    const layer = fxLayer();
    "IDEALS".split("").forEach((ch, i) => {
      for (let k = 0; k < 4; k++) {
        const s = document.createElement("span");
        s.className = "rain-letter"; s.textContent = ch;
        s.style.left = `${(i / 6) * 100 + Math.random() * 12}vw`;
        s.style.color = brand[(i + k) % 4];
        layer.appendChild(s);
        s.animate(
          [{ transform: "translateY(0) rotate(0)" }, { transform: `translateY(${window.innerHeight + 140}px) rotate(${(Math.random() - 0.5) * 120}deg)` }],
          { duration: 1600 + Math.random() * 1200, delay: k * 260 + i * 60, easing: "cubic-bezier(.5,0,.75,0)", fill: "both" }
        ).onfinish = () => s.remove();
      }
    });
  }

  /* ---------- Console note for the curious ---------- */
  console.log(
    "%c ROUND %c SQUARE %c\nYou opened the inspector, so you're curious. That's the Adventure IDEAL.\nThe committee needs a tech lead: write to " + RS.config.committeeEmail + "\nPS: there are six easter eggs on this site. Hint: ↑↑↓↓←→←→BA",
    "background:#e60048;color:#fff;font:600 14px sans-serif;padding:4px 6px",
    "background:#d59600;color:#1f1b2e;font:600 14px sans-serif;padding:4px 6px",
    "color:#7f3286;font:13px Georgia,serif"
  );

  window.RSU = { esc, $, $$, store, dateBlock, fmtLong, fmtTime, parseDate, months, toast, confetti, foundEgg, regs, spotsLeft, isClosed, upcomingEvents, shortDate, whenText, reduceMotion };
})();
