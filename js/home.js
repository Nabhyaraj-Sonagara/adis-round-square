/* Home: opening animation, hero, orbit globe, IDEALS, newsletter reader and RS Bulletin. */
(function () {
  const RS = window.RS;
  const { esc, $, $$, dateBlock, parseDate, foundEgg, reduceMotion, spotsLeft } = window.RSU;
  const order = ["I", "D", "E", "A", "L", "S"];
  const now = new Date();
  const upcoming = RS.events.filter((e) => parseDate(e.date) > now).sort((a, b) => parseDate(a.date) - parseDate(b.date));
  const latest = RS.newsletters[0];

  /* ---------- Opening animation: ends on its own, or on any click or key ---------- */
  const root = document.documentElement;
  if (root.classList.contains("intro")) {
    const end = () => { root.classList.remove("intro"); document.removeEventListener("keydown", end); };
    $(".intro-cols").addEventListener("animationend", (e) => { if (e.animationName === "introFold") end(); });
    $(".intro-overlay").addEventListener("click", end);
    document.addEventListener("keydown", end);
    setTimeout(end, 3500); // safety net if animations are blocked
  }

  /* ---------- Hero ---------- */
  $("#hero-meta").innerHTML = `
    <div><dt>Latest issue</dt><dd>No. ${esc(latest.id)}</dd></div>
    <div><dt>Ideal of the fortnight</dt><dd>${esc(RS.ideals[RS.config.idealOfFortnight].name)}</dd></div>
    ${upcoming[0] ? `<div><dt>Next event</dt><dd>${parseDate(upcoming[0].date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</dd></div>` : ""}`;

  // The ADIS panel (rays and sun) stays still. Only the Round Square circle responds to the pointer.
  const svg = $("#hero-svg");
  const NS = "http://www.w3.org/2000/svg";
  const mini = $("#mini-ideals");
  order.forEach((k, i) => {
    const g = document.createElementNS(NS, "g");
    const cx = 320 + (i % 3) * 64, cy = 238 + Math.floor(i / 3) * 70;
    g.setAttribute("data-i", k);
    g.innerHTML = `<circle cx="${cx}" cy="${cy}" r="21" style="fill:var(--ic);stroke:var(--ic-stroke);stroke-width:3"/><text x="${cx}" y="${cy + 5}" style="fill:var(--ic-on)">${k}</text>`;
    mini.appendChild(g);
  });

  const ball = $("#rs-ball");
  const follow = document.createElementNS(NS, "g");
  ball.parentNode.insertBefore(follow, ball);
  follow.appendChild(ball);
  ball.style.transformBox = "fill-box";
  ball.style.transformOrigin = "center";
  const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  let raf = 0;
  function step() {
    let moving = false;
    for (const k of ["x", "y"]) {
      cur[k] += (target[k] - cur[k]) * 0.12;
      if (Math.abs(target[k] - cur[k]) > 0.01) moving = true; else cur[k] = target[k];
    }
    follow.setAttribute("transform", `translate(${cur.x.toFixed(1)} ${cur.y.toFixed(1)})`);
    raf = moving ? requestAnimationFrame(step) : 0;
  }
  if (!reduceMotion) {
    svg.addEventListener("pointermove", (e) => {
      const b = svg.getBoundingClientRect();
      const px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
      target.x = Math.max(-1, Math.min(1, (px * 480 - 384) / 200)) * 14;
      target.y = Math.max(-1, Math.min(1, (py * 360 - 96) / 200)) * 14;
      if (!raf) raf = requestAnimationFrame(step);
    });
    svg.addEventListener("pointerleave", () => { target.x = target.y = 0; if (!raf) raf = requestAnimationFrame(step); });
  }
  const boing = () => ball.animate(
    [{ transform: "scale(1)" }, { transform: "scale(.7,1.2)" }, { transform: "scale(1.15,.85)" }, { transform: "scale(1)" }],
    { duration: 600, easing: "cubic-bezier(.34,1.56,.64,1)" }
  );
  ball.addEventListener("click", boing);
  ball.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); boing(); } });

  // Egg: click the rising sun three times for a sunrise.
  const sun = $("#sun");
  let sunClicks = 0, sunTimer, sunriseTimer;
  function pokeSun() {
    sunClicks++;
    clearTimeout(sunTimer);
    sunTimer = setTimeout(() => (sunClicks = 0), 1200);
    if (sunClicks >= 3) {
      sunClicks = 0;
      document.body.classList.add("sunrise");
      foundEgg("sunrise");
      clearTimeout(sunriseTimer);
      sunriseTimer = setTimeout(() => document.body.classList.remove("sunrise"), 4500);
    }
  }
  sun.addEventListener("click", pokeSun);
  sun.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pokeSun(); } });

  /* ---------- Orbit: ASCII globe with live "now facing" readout ---------- */
  const globe = window.RSAscii.globe();
  const facingEl = $("#facing");
  let lastFacing = null;
  window.RSAscii.mount($("#orbit-canvas"), globe.shader, {
    bg: "#1f1b2e", cell: 10, draggable: true,
    frame(s) {
      globe.frame(s);
      const f = Math.round(s.facing);
      if (f !== lastFacing) { lastFacing = f; facingEl.textContent = `${Math.abs(f)}° ${f >= 0 ? "E" : "W"}`; }
    },
  });

  /* ---------- IDEALS ---------- */
  let filter = "all";
  const idealsEl = $("#ideals");
  idealsEl.innerHTML = order.map((k) => `
    <button class="ideal" data-k="${k}" data-i="${k}" aria-pressed="false">
      ${k === RS.config.idealOfFortnight ? '<span class="focus-badge">Now</span>' : ""}
      <span class="ring" aria-hidden="true">${k}</span>
      <span class="name">${esc(RS.ideals[k].name)}</span>
    </button>`).join("");

  const detail = $("#ideal-detail");
  function showIdeal(k) {
    const isNow = k === RS.config.idealOfFortnight;
    detail.dataset.i = k;
    detail.innerHTML = `
      <span class="focus-dot" aria-hidden="true">${k}</span>
      <div>
        <p class="title">${esc(RS.ideals[k].name)}${isNow ? '<span class="label" style="margin-left:12px">Ideal of the fortnight</span>' : ""}</p>
        <p>${esc(RS.ideals[k].blurb)}</p>
      </div>`;
    detail.classList.remove("bump"); void detail.offsetWidth; detail.classList.add("bump");
  }
  showIdeal(RS.config.idealOfFortnight);

  idealsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".ideal");
    if (!btn) return;
    const k = btn.dataset.k;
    const on = btn.getAttribute("aria-pressed") !== "true";
    setFilter(on ? k : "all");
    showIdeal(on ? k : RS.config.idealOfFortnight);
  });

  /* ---------- Newsletter reader ---------- */
  const tabs = $("#issue-tabs");
  const paper = $("#paper");
  tabs.innerHTML = RS.newsletters.map((n, i) => `
    <button class="issue-tab" role="tab" id="tab-${n.id}" aria-selected="${i === 0}" data-index="${i}">
      Issue ${esc(n.id)}${i === 0 ? " (latest)" : ""}<small>${esc(n.dates)}</small>
    </button>`).join("");

  function photoArt(seed) {
    // A placeholder in the brand's shapes. Swap for a real photo: <img src="..." alt="...">.
    const c = ["#7f3286", "#1b478a", "#e60048", "#d59600"];
    const r = (n) => ((Math.sin(seed * 99 + n * 13.7) + 1) / 2);
    let s = `<rect width="300" height="200" fill="#f2ede4"/>`;
    for (let i = 0; i < 7; i++) {
      const col = c[i % 4], x = r(i) * 300, y = r(i + 9) * 200, size = 20 + r(i + 3) * 60;
      s += i % 2 ? `<circle cx="${x}" cy="${y}" r="${size / 2}" fill="${col}"/>` : `<rect x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" fill="${col}"/>`;
    }
    return `<svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${s}</svg>`;
  }

  function renderIssue(i) {
    const n = RS.newsletters[i];
    const ideal = RS.ideals[n.ideal];
    paper.setAttribute("aria-labelledby", `tab-${n.id}`);
    paper.innerHTML = `
      <div class="paper-mast">
        <div>
          <span class="label">Issue ${esc(n.id)}, ${esc(n.dates)}</span>
          <h3 class="display">Common Ground</h3>
          <p class="caption" style="margin-top:8px">The Adani International School × Round Square newsletter</p>
        </div>
        <div class="lockup" aria-hidden="true">
          <img src="assets/adis-crest.png" alt=""><span class="divider"></span><img src="assets/round-square-mark.png" alt="">
        </div>
      </div>
      <div class="band" aria-hidden="true"><span class="b-purple"></span><span class="b-blue"></span><span class="b-red"></span><span class="b-gold"></span></div>
      <section class="focus" data-i="${n.ideal}">
        <span class="focus-dot" aria-hidden="true">${n.ideal}</span>
        <div><span class="label">Ideal of the fortnight</span><p class="title">${esc(ideal.name)}</p><p>${esc(ideal.blurb)}</p></div>
      </section>
      <p class="lead intro">${esc(n.intro)}</p>
      <div class="paper-body">
        <div class="col">
          <article class="story">
            <div class="photo">${photoArt(+n.id)}</div>
            <p class="caption" style="margin:8px 0 24px">${esc(n.lead.caption)}</p>
            <span class="label">Lead story</span>
            <h3 class="headline">${esc(n.lead.title)}</h3>
            <p>${esc(n.lead.body)}</p>
          </article>
          <div class="net-pair">
            ${n.network.map((s) => `<article><span class="label">${esc(s.school)}</span><h4>${esc(s.title)}</h4><p>${esc(s.body)}</p></article>`).join("")}
          </div>
        </div>
        <div class="col">
          <article class="story">
            <span class="label">At ADIS</span>
            <h3 class="title">${esc(n.adis.title)}</h3>
            <p>${esc(n.adis.body)}</p>
          </article>
          <aside class="coming-up">
            <h3 class="title">Coming up</h3>
            <ul class="events">${upcoming.slice(0, 3).map((e, j) => `
              <li>${dateBlock(e.date, j % 2 === 1)}<div><h4>${esc(e.title)}</h4><p class="caption">${esc(e.place.split(",")[0])}</p></div></li>`).join("")}
            </ul>
            <a class="btn primary" href="register.html" style="margin-top:16px">Register</a>
          </aside>
          <figure class="pull">
            <blockquote class="quote">“${esc(n.quote.text)}”</blockquote>
            <figcaption class="caption">${esc(n.quote.by)}</figcaption>
          </figure>
        </div>
      </div>
      <div class="paper-foot">
        <span class="caption">Common Ground, issue ${esc(n.id)}</span>
        ${n.pdf ? `<a class="btn secondary" href="${esc(n.pdf)}" download>Download the PDF</a>` : `<span class="caption">Printed copies on the notice boards</span>`}
      </div>`;
  }

  let current = 0;
  renderIssue(0);
  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".issue-tab");
    if (!btn) return;
    const i = +btn.dataset.index;
    if (i === current) return;
    current = i;
    $$(".issue-tab", tabs).forEach((t) => t.setAttribute("aria-selected", t === btn));
    if (reduceMotion) return renderIssue(i);
    paper.classList.add("turning");
    setTimeout(() => {
      renderIssue(i);
      paper.classList.remove("turning");
      paper.classList.add("arriving");
      void paper.offsetWidth;
      paper.classList.remove("arriving");
    }, 450);
  });

  /* ---------- RS Bulletin: highlights index ---------- */
  const filters = $("#hl-filters");
  filters.innerHTML = `<button class="chip plain" data-k="all" aria-pressed="true">All</button>` +
    order.map((k) => `<button class="chip" data-k="${k}" aria-pressed="false"><span class="marker" data-i="${k}">${k}</span>${esc(RS.ideals[k].name)}</button>`).join("");
  filters.addEventListener("click", (e) => {
    const c = e.target.closest(".chip");
    if (c) setFilter(c.dataset.k === filter && c.dataset.k !== "all" ? "all" : c.dataset.k);
  });

  const hlEl = $("#highlights");
  function renderHighlights(animate) {
    const list = RS.highlights.filter((h) => filter === "all" || h.ideal === filter);
    hlEl.innerHTML = list.length ? list.map((h, i) => {
      const d = parseDate(h.date);
      return `
      <li class="${animate ? "in" : ""}" style="animation-delay:${i * 50}ms">
        <span class="when">${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "short" })}<span>${esc(RS.ideals[h.ideal].name)}</span></span>
        <span class="marker" data-i="${h.ideal}" aria-hidden="true">${h.ideal}</span>
        <div class="entry"><h3>${esc(h.title)}</h3><p>${esc(h.body)}</p></div>
      </li>`;
    }).join("") : `<li class="empty">No highlights for ${esc(RS.ideals[filter].name)} yet. Be the first: <a href="register.html">join an event</a>.</li>`;
  }
  function setFilter(k) {
    filter = k;
    $$(".chip", filters).forEach((c) => c.setAttribute("aria-pressed", c.dataset.k === k));
    $$(".ideal", idealsEl).forEach((b) => b.setAttribute("aria-pressed", b.dataset.k === k));
    renderHighlights(true);
  }
  renderHighlights(false);

  /* ---------- RS Bulletin: upcoming with T-minus countdowns ---------- */
  const upEl = $("#upcoming");
  upEl.innerHTML = upcoming.map((e, i) => `
    <li>
      ${dateBlock(e.date, i % 2 === 1)}
      <div class="info">
        <h4>${esc(e.title)}</h4>
        <p class="caption">${esc(RS.tags[e.tag].one)}, ${spotsLeft(e)} spots left</p>
        <p class="tminus" data-t="${parseDate(e.date).getTime()}"><span>T–</span><span class="digits"></span></p>
      </div>
      <a class="go" href="register.html?event=${encodeURIComponent(e.id)}" aria-label="Sign up for ${esc(e.title)}">Sign up</a>
    </li>`).join("");
  const pad = (n) => String(n).padStart(2, "0");
  function tick() {
    const t = Date.now();
    $$(".tminus", upEl).forEach((el) => {
      let s = Math.max(0, Math.floor((+el.dataset.t - t) / 1000));
      const d = Math.floor(s / 86400); s %= 86400;
      const h = Math.floor(s / 3600); s %= 3600;
      const m = Math.floor(s / 60); s %= 60;
      const text = `${d}d ${pad(h)}:${pad(m)}:${pad(s)}`;
      const box = el.querySelector(".digits");
      if (box.children.length !== text.length) {
        box.innerHTML = [...text].map((ch) => `<b class="${/\d/.test(ch) ? "" : "sep"}">${ch}</b>`).join("");
        return;
      }
      [...text].forEach((ch, i) => {
        const b = box.children[i];
        if (b.textContent !== ch) { b.textContent = ch; if (!reduceMotion) { b.classList.remove("flip"); void b.offsetWidth; b.classList.add("flip"); } }
      });
    });
  }
  tick();
  setInterval(tick, 1000);
})();
