/* Register: three-step form, ticket, calendar file and "My registrations". */
(function () {
  const RS = window.RS;
  const { esc, $, $$, dateBlock, fmtLong, fmtTime, parseDate, toast, confetti, regs, spotsLeft } = window.RSU;
  const order = ["I", "D", "E", "A", "L", "S"];
  const form = $("#reg-form");
  const now = new Date();
  const events = RS.events.filter((e) => parseDate(e.date) > now).sort((a, b) => parseDate(a.date) - parseDate(b.date));
  const byId = (id) => RS.events.find((e) => e.id === id);

  let step = 1, typeFilter = "all", lastReg = null;
  let picked = new URLSearchParams(location.search).get("event");
  if (picked && !events.some((e) => e.id === picked && spotsLeft(e) > 0 && !regs.has(e.id))) picked = null;

  /* ---------- Step 1: pick ---------- */
  const picksEl = $("#picks");
  function renderPicks() {
    const list = events.filter((e) => typeFilter === "all" || e.tag === typeFilter);
    picksEl.innerHTML = list.map((e, i) => {
      const left = spotsLeft(e), mine = regs.has(e.id), full = left === 0 && !mine;
      const pct = Math.round(((e.spots - left) / e.spots) * 100);
      return `
        <div class="pick">
          <input type="radio" name="event" id="ev-${e.id}" value="${e.id}" ${picked === e.id ? "checked" : ""} ${mine || full ? "disabled" : ""}>
          <label for="ev-${e.id}">
            <span class="check" aria-hidden="true">✓</span>
            <span class="top">${dateBlock(e.date, i % 2 === 1)}<span>
              <span class="type-tag ${mine ? "mine" : `t-${e.tag}`}">${mine ? "You're in" : esc(RS.tags[e.tag].one)}</span>
              <span class="caption" style="display:block;margin-top:6px">${fmtTime(e.date)}, Grades ${esc(e.grades)}</span>
            </span></span>
            <h3>${esc(e.title)}</h3>
            <p>${esc(e.body)}</p>
            <span class="caption">${esc(e.place)}</span>
            <span class="spots">${full ? "Full. Ask the committee about the waitlist." : `${left} of ${e.spots} spots left`}</span>
            <span class="meter ${left <= 5 ? "low" : ""}" aria-hidden="true"><i style="width:${pct}%"></i></span>
          </label>
        </div>`;
    }).join("") || `<p class="empty" style="grid-column:1/-1">Nothing here right now. New events go up every fortnight.</p>`;
  }
  $("#type-filter").innerHTML = `<button type="button" class="chip plain" data-t="all" aria-pressed="true">Everything</button>` +
    Object.entries(RS.tags).map(([k, t]) => `<button type="button" class="chip plain" data-t="${k}" aria-pressed="false">${esc(t.many)}</button>`).join("");
  $("#type-filter").addEventListener("click", (e) => {
    const c = e.target.closest(".chip");
    if (!c) return;
    typeFilter = c.dataset.t;
    $$("#type-filter .chip").forEach((x) => x.setAttribute("aria-pressed", x === c));
    renderPicks();
  });
  picksEl.addEventListener("change", (e) => {
    if (e.target.name !== "event") return;
    picked = e.target.value;
    $("#pick-error").classList.remove("show");
    renderSummary();
  });

  /* ---------- Step 3: IDEALS chips ---------- */
  const why = new Set();
  $("#why-ideals").innerHTML = order.map((k) => `<button type="button" class="chip" data-k="${k}" aria-pressed="false"><b data-i="${k}">${k}</b>${esc(RS.ideals[k].name)}</button>`).join("");
  $("#why-ideals").addEventListener("click", (e) => {
    const c = e.target.closest(".chip");
    if (!c) return;
    const k = c.dataset.k;
    why.has(k) ? why.delete(k) : why.add(k);
    c.setAttribute("aria-pressed", why.has(k));
    if (why.size === 6) toast("All six IDEALS. Kurt Hahn would approve.", "★");
  });

  /* ---------- Summary sidebar ---------- */
  function renderSummary() {
    const e = picked && byId(picked);
    $("#your-pick").innerHTML = e ? `
      <p class="caption" style="margin:0">Your pick</p>
      <h3 class="title">${esc(e.title)}</h3>
      <ul class="events"><li>${dateBlock(e.date)}<div><p class="caption" style="color:var(--ink)">${fmtLong(e.date)}</p><p class="caption">${fmtTime(e.date)}, ${esc(e.place.split(" · ")[0])}</p></div></li></ul>`
      : `<p class="caption" style="margin:0">Your pick</p><p class="none" style="margin-top:8px">Choose what you'd like to join and it will show up here.</p>`;
  }
  function renderMine() {
    const list = regs.all().filter((r) => byId(r.eventId));
    $("#mine").innerHTML = list.length ? `<ul class="mine-list">${list.map((r) => {
      const e = byId(r.eventId);
      return `<li>${dateBlock(e.date, true)}<span>${esc(e.title)}<br><span class="muted">${esc(r.code)}</span></span><button type="button" class="x" data-cancel="${esc(r.eventId)}" aria-label="Cancel registration for ${esc(e.title)}">×</button></li>`;
    }).join("")}</ul>` : `<p class="none">Nothing yet. Your tickets are kept on this device.</p>`;
  }
  $("#mine").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cancel]");
    if (!b) return;
    const id = b.dataset.cancel;
    regs.save(regs.all().filter((r) => r.eventId !== id));
    toast("Registration cancelled.", "×");
    renderMine(); renderPicks();
  });

  /* ---------- Steps ---------- */
  function go(n) {
    step = n;
    $$(".panel").forEach((p) => (p.hidden = +p.dataset.step !== n));
    $$("#steps li").forEach((li, i) => {
      li.classList.toggle("active", i + 1 === n);
      li.classList.toggle("done", i + 1 < n);
      if (i + 1 === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
    $("#steps").scrollIntoView({ behavior: "smooth", block: "start" });
    const panel = $(`.panel[data-step="${n}"]`);
    const first = panel.querySelector("input:not([type=radio]), select, textarea");
    if (first && n !== 1) setTimeout(() => first.focus({ preventScroll: true }), 300);
  }

  function validStep(n) {
    if (n === 1) {
      const ok = !!picked;
      $("#pick-error").classList.toggle("show", !ok);
      return ok;
    }
    if (n === 2) {
      let firstBad = null;
      const check = (id, ok) => {
        const f = $(id).closest(".field");
        f.classList.remove("invalid"); void f.offsetWidth;
        f.classList.toggle("invalid", !ok);
        if (!ok && !firstBad) firstBad = $(id);
      };
      check("#f-name", $("#f-name").value.trim().length > 1);
      check("#f-grade", !!$("#f-grade").value);
      check("#f-email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($("#f-email").value.trim()));
      check("#f-consent", $("#f-consent").checked);
      firstBad?.focus();
      return !firstBad;
    }
    return true;
  }

  form.addEventListener("click", (e) => {
    if (e.target.closest("[data-next]") && validStep(step)) go(step + 1);
    if (e.target.closest("[data-back]")) go(step - 1);
  });
  // Clear an error as soon as it's fixed.
  form.addEventListener("input", (e) => e.target.closest(".field")?.classList.remove("invalid"));
  form.addEventListener("change", (e) => e.target.closest(".field")?.classList.remove("invalid"));

  /* ---------- Submit ---------- */
  const code = () => "RS-" + Array.from({ length: 5 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (step !== 3) { if (validStep(step)) go(step + 1); return; }
    const btn = $("#submit-btn");
    btn.disabled = true;
    const reg = {
      code: code(),
      eventId: picked,
      eventTitle: byId(picked).title,
      name: $("#f-name").value.trim(),
      grade: $("#f-grade").value,
      section: $("#f-section").value,
      email: $("#f-email").value.trim(),
      phone: $("#f-phone").value.trim(),
      ideals: [...why],
      notes: $("#f-notes").value.trim(),
      ts: new Date().toISOString(),
    };

    let sent = null;
    if (RS.config.registrationEndpoint) {
      try {
        const res = await fetch(RS.config.registrationEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(reg) });
        sent = res.ok;
      } catch { sent = false; }
    }
    btn.disabled = false;

    regs.save([...regs.all().filter((r) => r.eventId !== reg.eventId), reg]);
    lastReg = reg;
    renderTicket(reg, sent);
    renderMine(); renderPicks();
    go(4);
    confetti();
  });

  function renderTicket(r, sent) {
    const e = byId(r.eventId);
    const bars = [...r.code].flatMap((ch) => { const n = ch.charCodeAt(0); return [1 + (n % 3), 1 + ((n >> 2) % 3)]; });
    const mail = `<a href="mailto:${esc(RS.config.committeeEmail)}?subject=${encodeURIComponent(`Registration ${r.code}: ${e.title}`)}">${esc(RS.config.committeeEmail)}</a>`;
    const note = sent === true
      ? `You're in. The committee has your registration. Questions? Write to ${mail}.`
      : sent === false
        ? `Your ticket is saved on this device, but it didn't reach the committee. Email your ticket code to ${mail} to confirm your place.`
        : `You're in. Keep your ticket code and show it at the event. Questions? Write to ${mail}.`;
    $("#ticket").innerHTML = `
      <div class="ticket">
        <div class="main">
          <span class="eyebrow dot-eyebrow">${esc(RS.tags[e.tag].one)} ticket</span>
          <h3 class="headline">${esc(e.title)}</h3>
          <dl>
            <div><dt>Name</dt><dd>${esc(r.name)}</dd></div>
            <div><dt>Grade</dt><dd>${esc(r.grade)}${esc(r.section)}</dd></div>
            <div><dt>Date</dt><dd>${parseDate(e.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</dd></div>
            <div><dt>Time</dt><dd>${fmtTime(e.date)}</dd></div>
            <div style="grid-column:span 2"><dt>Where</dt><dd>${esc(e.place)}</dd></div>
          </dl>
        </div>
        <div class="stub">
          <span class="eyebrow">Ticket code</span>
          <span class="code">${esc(r.code)}</span>
          <span class="barcode" aria-hidden="true">${bars.map((w, i) => `<i style="width:${w}px;opacity:${i % 3 ? 1 : .6}"></i>`).join("")}</span>
        </div>
      </div>
      <p class="done-note">${note}</p>`;
  }

  /* ---------- Calendar file ---------- */
  $("#ics-btn").addEventListener("click", () => {
    if (!lastReg) return;
    const e = byId(lastReg.eventId);
    const start = parseDate(e.date);
    const end = new Date(start.getTime() + 2 * 3600 * 1000);
    const f = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const icsText = (s) => s.replace(/([,;\\])/g, "\\$1");
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ADIS Round Square//Register//EN", "BEGIN:VEVENT",
      `UID:${lastReg.code}@adis-roundsquare`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(start)}`, `DTEND:${f(end)}`,
      `SUMMARY:${icsText(e.title)}`, `LOCATION:${icsText(e.place)}`,
      `DESCRIPTION:Ticket ${lastReg.code}. ${icsText(e.body)}`, "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = `${e.id}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  $("#again-btn").addEventListener("click", () => {
    picked = null; why.clear();
    $$("#why-ideals .chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
    $("#f-notes").value = "";
    renderPicks(); renderSummary();
    go(1);
  });

  renderPicks(); renderSummary(); renderMine();
  if (picked) setTimeout(() => $(`#ev-${picked}`)?.closest(".pick").scrollIntoView({ behavior: "smooth", block: "center" }), 300);
})();
