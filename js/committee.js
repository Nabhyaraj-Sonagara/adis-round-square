/* Committee: searchable flip cards with contacts. */
(function () {
  const RS = window.RS;
  const { esc, $, $$, toast, foundEgg, confetti } = window.RSU;
  const groups = [
    { key: "students", label: "Student committee" },
    { key: "teachers", label: "Teachers" },
  ];
  // Easter egg: search for the educator whose ideas started Round Square.
  const HAHN = { name: "Kurt Hahn", role: "Honorary member", group: "honorary", grade: "1886–1974", email: "", phone: "", ideal: "A", fact: "The educator whose ideas inspired Round Square in 1966. His motto: Plus est en vous, there is more in you." };

  let group = "all", query = "", hahnShown = false;
  const membersEl = $("#members");
  const filterEl = $("#group-filter");
  $("#mail-all").href = `mailto:${RS.config.committeeEmail}`;

  filterEl.innerHTML = `<button class="chip plain" data-g="all" aria-pressed="true">Everyone</button>` +
    groups.map((g) => `<button class="chip plain" data-g="${g.key}" aria-pressed="false">${g.label}</button>`).join("");
  filterEl.addEventListener("click", (e) => {
    const c = e.target.closest(".chip");
    if (!c) return;
    group = c.dataset.g;
    $$(".chip", filterEl).forEach((x) => x.setAttribute("aria-pressed", x === c));
    render();
  });

  const initials = (n) => n.replace(/^(Ms|Mr|Mrs|Dr)\.?\s+/, "").split(/\s+/).map((w) => w[0]).slice(0, 2).join("");

  function card(m, i, extra = "") {
    const contact = [
      m.email && `<div class="contact-row"><a href="mailto:${esc(m.email)}">${esc(m.email)}</a><button class="copy-btn" data-copy="${esc(m.email)}">Copy</button></div>`,
      m.phone && `<div class="contact-row"><a href="tel:${esc(m.phone.replace(/\s/g, ""))}">${esc(m.phone)}</a><button class="copy-btn" data-copy="${esc(m.phone)}">Copy</button></div>`,
    ].filter(Boolean).join("");
    return `
      <div class="member ${extra}">
        <div class="flip">
          <button class="face front" aria-label="${esc(m.name)}, ${esc(m.role)}. Show contact details">
            <span class="avatar" data-i="${m.ideal}" data-ideal="${m.ideal}" aria-hidden="true">${esc(initials(m.name))}</span>
            <span class="eyebrow dot-eyebrow ${m.group === "teachers" ? "blue" : "adis"} role">${esc(m.role)}</span>
            <span class="name">${esc(m.name)}</span>
            <span class="caption">${m.group === "teachers" || m.group === "honorary" ? esc(m.grade) : `Grade ${esc(m.grade)}`}, ${esc(RS.ideals[m.ideal].name)}</span>
            <span class="flip-hint" aria-hidden="true">↻</span>
          </button>
          <div class="face back" inert>
            <span class="eyebrow">${esc(m.role)}</span>
            <span class="name">${esc(m.name)}</span>
            <p class="fact">${esc(m.fact)}</p>
            ${contact || `<p class="caption" style="color:#d8d4df">Reach the whole committee at <a style="color:#fff" href="mailto:${esc(RS.config.committeeEmail)}">${esc(RS.config.committeeEmail)}</a></p>`}
            <button class="flip-back">↺ Flip back</button>
          </div>
        </div>
      </div>`;
  }

  function matches(m) {
    if (!query) return true;
    const hay = `${m.name} ${m.role} ${m.grade} ${RS.ideals[m.ideal].name} ${m.email}`.toLowerCase();
    return query.split(/\s+/).every((w) => hay.includes(w));
  }

  function render() {
    let html = "", n = 0;
    if (hahnShown) {
      html += `<div class="group-block"><h2 class="headline group-title">Honorary <span class="count">1</span></h2><div class="members">${card(HAHN, 0, "honorary pop-in")}</div></div>`;
    }
    groups.forEach((g) => {
      if (group !== "all" && group !== g.key) return;
      const list = RS.committee.filter((m) => m.group === g.key && matches(m));
      if (!list.length) return;
      n += list.length;
      html += `<div class="group-block"><h2 class="headline group-title">${g.label} <span class="count">${list.length}</span></h2><div class="members">${list.map((m, i) => card(m, i)).join("")}</div></div>`;
    });
    if (!n && !hahnShown) html = `<p class="empty">No one matches “${esc(query)}”. Try a first name, a role or an IDEAL.</p>`;
    membersEl.innerHTML = html;
  }

  $("#search").addEventListener("input", (e) => {
    query = e.target.value.trim().toLowerCase();
    const wantHahn = /hahn/.test(query);
    if (wantHahn && !hahnShown) { hahnShown = true; render(); foundEgg("hahn"); confetti(60); return; }
    if (!wantHahn) hahnShown = false;
    render();
  });

  membersEl.addEventListener("click", async (e) => {
    const copy = e.target.closest(".copy-btn");
    if (copy) {
      try { await navigator.clipboard.writeText(copy.dataset.copy); toast(`Copied ${copy.dataset.copy}`); }
      catch { toast("Couldn't copy. Select the text instead.", "!"); }
      return;
    }
    const front = e.target.closest(".face.front");
    const back = e.target.closest(".flip-back");
    if (!front && !back) return;
    const member = e.target.closest(".member");
    const flipped = member.classList.toggle("flipped");
    $(".face.front", member).inert = flipped;
    $(".face.back", member).inert = !flipped;
    (flipped ? $(".face.back a, .face.back .flip-back", member) : $(".face.front", member))?.focus({ preventScroll: true });
  });

  render();
})();
