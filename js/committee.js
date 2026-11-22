/* Committee: a searchable roster with contacts, and the circle-in-the-square canvas. */
(function () {
  const RS = window.RS;
  const { esc, $, $$, toast, foundEgg, confetti } = window.RSU;
  const groups = [
    { key: "students", label: "Student committee" },
    { key: "teachers", label: "Teachers" },
  ];
  // Easter egg: search for the educator whose ideas started Round Square.
  const HAHN = { name: "Kurt Hahn", role: "Founding spirit", group: "honorary", grade: "1886–1974", email: "", phone: "", ideal: "A" };

  const cs = window.RSAscii.circleSquare();
  window.RSAscii.mount($("#circle-canvas"), cs.shader, { bg: "#ffffff", cell: 13, frame: cs.frame });

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
    render(true);
  });

  const initials = (n) => n.replace(/^(Ms|Mr|Mrs|Dr)\.?\s+/, "").split(/\s+/).map((w) => w[0]).slice(0, 2).join("");

  function row(m, i, animate, extra = "") {
    const contact = [
      m.email && `<span class="contact-row"><a href="mailto:${esc(m.email)}">${esc(m.email)}</a><button class="copy-btn" data-copy="${esc(m.email)}">Copy</button></span>`,
      m.phone && `<span class="contact-row"><a href="tel:${esc(m.phone.replace(/\s/g, ""))}">${esc(m.phone)}</a><button class="copy-btn" data-copy="${esc(m.phone)}">Copy</button></span>`,
    ].filter(Boolean).join("") || `<span class="caption">Reach the whole committee at <a href="mailto:${esc(RS.config.committeeEmail)}">${esc(RS.config.committeeEmail)}</a></span>`;
    return `
      <li class="${animate ? "in" : ""} ${extra}" style="animation-delay:${i * 40}ms">
        <span class="avatar" data-i="${m.ideal}" aria-hidden="true">${esc(initials(m.name))}</span>
        <span class="who"><strong>${esc(m.name)}</strong><span>${esc(m.role)}</span></span>
        <span class="grade"><b>${m.group === "students" ? `Grade ${esc(m.grade)}` : esc(m.grade)}</b>${esc(RS.ideals[m.ideal].name)}</span>
        <span class="contact">${contact}</span>
      </li>`;
  }

  function matches(m) {
    if (!query) return true;
    const hay = `${m.name} ${m.role} ${m.grade} ${RS.ideals[m.ideal].name} ${m.email}`.toLowerCase();
    return query.split(/\s+/).every((w) => hay.includes(w));
  }

  function render(animate) {
    let html = "", n = 0;
    if (hahnShown) html += `<div class="group-block"><div class="col-head"><h2 class="headline">Honorary</h2></div><ul class="roster">${row(HAHN, 0, false, "honorary pop-in")}</ul></div>`;
    groups.forEach((g) => {
      if (group !== "all" && group !== g.key) return;
      const list = RS.committee.filter((m) => m.group === g.key && matches(m));
      if (!list.length) return;
      n += list.length;
      html += `<div class="group-block"><div class="col-head"><h2 class="headline">${g.label}</h2><span class="label">${list.length} ${list.length === 1 ? "person" : "people"}</span></div><ul class="roster">${list.map((m, i) => row(m, i, animate)).join("")}</ul></div>`;
    });
    if (!n && !hahnShown) html = `<p class="empty">No one matches “${esc(query)}”. Try a first name, a role or an IDEAL.</p>`;
    membersEl.innerHTML = html;
  }

  $("#search").addEventListener("input", (e) => {
    query = e.target.value.trim().toLowerCase();
    const wantHahn = /hahn/.test(query);
    if (wantHahn && !hahnShown) { hahnShown = true; render(false); foundEgg("hahn"); confetti(60); return; }
    if (!wantHahn) hahnShown = false;
    render(false);
  });

  membersEl.addEventListener("click", async (e) => {
    const copy = e.target.closest(".copy-btn");
    if (!copy) return;
    try {
      await navigator.clipboard.writeText(copy.dataset.copy);
      copy.textContent = "Copied"; copy.classList.add("done");
      setTimeout(() => { copy.textContent = "Copy"; copy.classList.remove("done"); }, 1600);
    } catch { toast("Couldn't copy. Select the text instead.", "!"); }
  });

  render(true);
})();
