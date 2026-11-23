/* Register: three-step form, 3-2-1 countdown, printed ticket, calendar file and "My registrations". */
(function () {
  const RS = window.RS;
  const { esc, $, $$, dateBlock, fmtLong, fmtTime, parseDate, toast, confetti, regs, spotsLeft, isClosed, upcomingEvents, shortDate, whenText, eventCode, reduceMotion } = window.RSU;
  const form = $("#reg-form");
  const events = upcomingEvents();
  const byId = (id) => RS.events.find((e) => e.id === id);

  window.RSAscii.mount($("#sun-canvas"), window.RSAscii.sunrise(), { bg: "#7f3286", cell: 13 });

  let step = 1, typeFilter = "all", lastReg = null;
  let picked = new URLSearchParams(location.search).get("event");
  if (picked && !events.some((e) => e.id === picked && spotsLeft(e) > 0 && !isClosed(e) && !regs.has(e.id))) picked = null;

  /* ---------- Step 1: pick ---------- */
  const picksEl = $("#picks");
  function renderPicks() {
    const list = events.filter((e) => typeFilter === "all" || e.tag === typeFilter);
    picksEl.innerHTML = list.map((e, i) => {
      const left = spotsLeft(e), mine = regs.has(e.id), closed = isClosed(e) && !mine, full = left === 0 && !mine;
      const avail = closed ? `<strong>Closed</strong>Sign-ups ended ${shortDate(e.deadline)}`
        : full ? "<strong>Full</strong>Ask about the waitlist"
        : e.spots ? `<strong>${left}</strong>of ${e.spots} spots left<span class="meter ${left <= 5 ? "low" : ""}" aria-hidden="true"><i style="width:${Math.round(((e.spots - left) / e.spots) * 100)}%"></i></span>`
        : `<strong>Open</strong>${e.deadline ? `Sign up by ${shortDate(e.deadline)}` : "Sign up any time"}`;
      return `
        <div class="pick">
          <input type="radio" name="event" id="ev-${e.id}" value="${e.id}" ${picked === e.id ? "checked" : ""} ${mine || full || closed ? "disabled" : ""}>
          <label for="ev-${e.id}">
            <span class="radio" aria-hidden="true"></span>
            ${dateBlock(e.date, i % 2 === 1)}
            <span>
              <span class="type-tag ${mine ? "mine" : `t-${e.tag}`}">${mine ? "You're in" : esc(RS.tags[e.tag].one)}</span>
              <h3>${esc(e.title)}</h3>
              <p>${esc(e.body)}</p>
              <span class="meta">${esc(whenText(e))}. ${esc(e.grades)}. ${esc(e.host)}, ${esc(e.place)}</span>
            </span>
            <span class="avail">${avail}</span>
          </label>
        </div>`;
    }).join("") || `<p class="empty">Nothing here right now. Check back soon.</p>`;
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

  /* ---------- Step 3: why you're a good fit ---------- */
  const fit = $("#f-fit"), fitCount = $("#fit-count");
  const sentences = (s) => (s.match(/[^.!?]*[a-z][^.!?]*[.!?]+/gi) || []).length + (/[a-z][^.!?]*$/i.test(s) ? 1 : 0);
  function updateFitCount() {
    const n = sentences(fit.value.trim());
    fitCount.textContent = `${n} ${n === 1 ? "sentence" : "sentences"}, ${fit.value.length} of ${fit.maxLength} characters`;
  }
  fit.addEventListener("input", updateFitCount);

  /* ---------- Summary sidebar ---------- */
  function renderSummary() {
    const e = picked && byId(picked);
    $("#your-pick").innerHTML = e ? `
      <p class="label strong" style="margin:0">Your pick</p>
      <h3 class="title">${esc(e.title)}</h3>
      <ul class="events"><li>${dateBlock(e.date)}<div><p class="caption" style="color:var(--ink)">${esc(e.when || (e.dateLabel ? whenText(e) : fmtLong(e.date)))}</p><p class="caption">${esc(e.host)}</p></div></li></ul>`
      : `<p class="label strong" style="margin:0">Your pick</p><p class="none">Choose what you'd like to join and it will show up here.</p>`;
  }
  function renderMine() {
    const list = regs.all().filter((r) => byId(r.eventId));
    $("#mine").innerHTML = list.length ? `<ul class="mine-list">${list.map((r) => {
      const e = byId(r.eventId);
      return `<li>${dateBlock(e.date, true)}<span>${esc(e.title)}<br><span class="muted">${esc(r.code)}</span></span><button type="button" class="x" data-cancel="${esc(r.eventId)}" aria-label="Cancel registration for ${esc(e.title)}">Cancel</button></li>`;
    }).join("")}</ul>` : `<p class="none">Nothing yet. Your tickets are kept on this device.</p>`;
  }
  $("#mine").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cancel]");
    if (!b) return;
    regs.save(regs.all().filter((r) => r.eventId !== b.dataset.cancel));
    toast("Registration cancelled.", "✓");
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
    if (n === 3) $("#fit-title").textContent = `Why are you a good fit for ${byId(picked).title}?`;
    const first = $(`.panel[data-step="${n}"]`).querySelector("input:not([type=radio]), select, textarea");
    if (first && n !== 1) setTimeout(() => first.focus({ preventScroll: true }), 300);
  }

  function validStep(n) {
    if (n === 1) {
      $("#pick-error").classList.toggle("show", !picked);
      return !!picked;
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
    if (n === 3) {
      const f = fit.closest(".field");
      const ok = fit.value.trim().length >= 40;
      f.classList.remove("invalid"); void f.offsetWidth;
      f.classList.toggle("invalid", !ok);
      if (!ok) fit.focus();
      return ok;
    }
    return true;
  }

  form.addEventListener("click", (e) => {
    if (e.target.closest("[data-next]") && validStep(step)) go(step + 1);
    if (e.target.closest("[data-back]")) go(step - 1);
  });
  form.addEventListener("input", (e) => e.target.closest(".field")?.classList.remove("invalid"));
  form.addEventListener("change", (e) => e.target.closest(".field")?.classList.remove("invalid"));

  /* ---------- Submit: a 3-2-1 countdown, then the ticket prints ---------- */
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (step !== 3) { if (validStep(step)) go(step + 1); return; }
    if (!validStep(3)) return;
    const btn = $("#submit-btn");
    if (btn.disabled) return;
    btn.disabled = true;
    const reg = {
      code: eventCode(byId(picked)),
      eventId: picked,
      eventTitle: byId(picked).title,
      name: $("#f-name").value.trim(),
      grade: $("#f-grade").value,
      section: $("#f-section").value,
      email: $("#f-email").value.trim(),
      phone: $("#f-phone").value.trim(),
      suitability: fit.value.trim(),
      notes: $("#f-notes").value.trim(),
      ts: new Date().toISOString(),
    };

    const label = btn.textContent;
    let sending = Promise.resolve(null);
    if (RS.config.registrationEndpoint) {
      // text/plain keeps this a "simple" request: Google Apps Script web apps don't answer
      // CORS preflights, so a JSON content type would be blocked before it reached the sheet.
      sending = fetch(RS.config.registrationEndpoint, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8", Accept: "application/json" }, body: JSON.stringify(reg) })
        .then((res) => res.ok ? res.json().then((j) => j.ok !== false, () => true) : false).catch(() => false);
    }
    if (!reduceMotion) {
      btn.classList.add("counting");
      for (const n of ["3", "2", "1"]) { btn.textContent = n; await wait(420); }
      btn.classList.remove("counting");
    }
    const sent = await sending;
    btn.textContent = label;
    btn.disabled = false;

    regs.save([...regs.all().filter((r) => r.eventId !== reg.eventId), reg]);
    lastReg = reg;
    renderTicket(reg, sent);
    renderMine(); renderPicks();
    go(4);
    setTimeout(() => confetti(), reduceMotion ? 0 : 1300);
  });

  function renderTicket(r, sent) {
    const e = byId(r.eventId);
    // A meeting code only when the host has shared one; otherwise the event code.
    const shown = e.meetingCode || r.code, kind = e.meetingCode ? "meeting code" : "event code";
    const bars = [...shown].flatMap((ch) => { const n = ch.charCodeAt(0); return [1 + (n % 3), 1 + ((n >> 2) % 3)]; });
    const mail = `<a href="mailto:${esc(RS.config.committeeEmail)}?subject=${encodeURIComponent(`Registration ${r.code}: ${e.title}`)}">${esc(RS.config.committeeEmail)}</a>`;
    const note = sent === true
      ? `You're in. The committee has your registration. Questions? Write to ${mail}.`
      : sent === false
        ? `Your ticket is saved on this device, but it didn't reach the committee. Email your ${kind} to ${mail} to confirm your place.`
        : `You're in. Keep your ${kind} and show it at the event. Questions? Write to ${mail}.`;
    $("#ticket").innerHTML = `
      <div class="ticket-slot" aria-hidden="true"></div>
      <div class="ticket-feed">
        <div class="ticket">
          <div class="main">
            <span class="label">${esc(RS.tags[e.tag].one)} ticket</span>
            <h3 class="headline">${esc(e.title)}</h3>
            <dl>
              <div><dt>Name</dt><dd>${esc(r.name)}</dd></div>
              <div><dt>Grade</dt><dd>${esc(r.grade)}${esc(r.section)}</dd></div>
              <div><dt>${esc(e.dateLabel || "Date")}</dt><dd>${esc(e.when || parseDate(e.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }))}</dd></div>
              ${fmtTime(e.date) ? `<div><dt>Time (IST)</dt><dd>${fmtTime(e.date)}</dd></div>` : ""}
              <div style="grid-column:span 2"><dt>Where</dt><dd>${esc(e.host)}, ${esc(e.place)}</dd></div>
            </dl>
          </div>
          <div class="stub">
            <span class="label">${e.meetingCode ? "Meeting code" : "Event code"}</span>
            <span class="code">${esc(shown)}</span>
            <span class="barcode" aria-hidden="true">${bars.map((w, i) => `<i style="width:${w}px;opacity:${i % 3 ? 1 : .6}"></i>`).join("")}</span>
          </div>
        </div>
      </div>
      <p class="done-note">${note}</p>`;
  }

  /* ---------- Calendar file ---------- */
  $("#ics-btn").addEventListener("click", () => {
    if (!lastReg) return;
    const e = byId(lastReg.eventId);
    const start = parseDate(e.date);
    const f = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    // Timed events get two hours; all-day ones run to the day after their last day.
    const allDay = e.date.length === 10;
    const ymd = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    const last = parseDate(e.ends || e.date); last.setDate(last.getDate() + 1);
    const span = allDay ? [`DTSTART;VALUE=DATE:${ymd(start)}`, `DTEND;VALUE=DATE:${ymd(last)}`]
      : [`DTSTART:${f(start)}`, `DTEND:${f(new Date(start.getTime() + 2 * 3600 * 1000))}`];
    const icsText = (s) => s.replace(/([,;\\])/g, "\\$1");
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ADIS Round Square//Register//EN", "BEGIN:VEVENT",
      `UID:${lastReg.code}-${Date.parse(lastReg.ts)}@adis-roundsquare`, `DTSTAMP:${f(new Date())}`, ...span,
      `SUMMARY:${icsText(e.title)}`, `LOCATION:${icsText(`${e.host}, ${e.place}`)}`,
      `DESCRIPTION:${e.meetingCode ? `Meeting code ${icsText(e.meetingCode)}` : `Event code ${lastReg.code}`}. ${icsText(e.body)}`, "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = `${e.id}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  $("#again-btn").addEventListener("click", () => {
    picked = null;
    fit.value = ""; $("#f-notes").value = ""; updateFitCount();
    renderPicks(); renderSummary();
    go(1);
  });

  renderPicks(); renderSummary(); renderMine();
  if (picked) setTimeout(() => $(`#ev-${picked}`)?.closest(".pick").scrollIntoView({ behavior: "smooth", block: "center" }), 300);
})();
