/**
 * ADIS Round Square: registrations to Google Sheets.
 *
 * The website POSTs each registration here and this script appends one row to
 * the sheet. It reads the sheet's own header row and fills each column by its
 * name, so the columns can be in any order and named the way the committee
 * likes ("Student name", "Class", "Event code", "Why suitable" and so on).
 * Columns it doesn't recognise are left blank. If the sheet is empty, it writes
 * DEFAULT_HEADERS first.
 *
 * Setup (once, by the sheet's owner):
 *   1. Open the sheet > Extensions > Apps Script. Replace Code.gs with this file.
 *   2. Deploy > New deployment > type "Web app". Execute as: Me.
 *      Who has access: "Anyone within adaniinternational.edu.in" (set
 *      registrationSignIn: true in js/data.js) or "Anyone" (set it to false).
 *   3. Copy the Web app URL (ends in /exec) into registrationEndpoint in js/data.js.
 * After editing this script, use Deploy > Manage deployments > Edit > New version,
 * so the same URL keeps working.
 */

const SHEET_ID = "1Lrql9sWd0CJEh0iXd2zPd_2YcNr9JsjpTQnGBI7r1gk";
const SHEET_GID = 0; // the tab from the link (#gid=0)
const TIME_ZONE = "Asia/Kolkata";
const COMMITTEE_EMAIL = "kumar.abhishek@adaniinternational.edu.in";

const DEFAULT_HEADERS = [
  "Timestamp", "Event code", "Event", "Event date", "Host",
  "Name", "Grade", "Section", "Email", "UID", "Phone", "Why suitable", "Notes", "Signed in as",
];

// Header text -> field. The first rule whose test matches wins, so the order matters
// ("Why suitable for this event" before "Event", "Event code" before "Event",
// "Event date" before "Timestamp").
const RULES = [
  [/account|signed|verified|submitted by/, "account"],
  [/mail/, "email"],
  [/\bwhy\b|suitab|\bfit\b|reason|motivat|statement/, "suitability"],
  [/\buid\b|admission|\bgr no|student id|\bid\b/, "uid"],
  [/\bcode\b|ticket|\bref\b|reference/, "code"],
  [/(event|session).*(date|day|when)|(date|day|when).*(event|session)/, "eventDate"],
  [/\bhost|partner|organis|organiz/, "host"],
  [/event|session|activity|programme|program|conference|\blab\b|postcard/, "eventTitle"],
  [/time ?stamp|submitted|registered|^date|^time/, "ts"],
  [/first name/, "firstName"],
  [/last name|surname/, "lastName"],
  [/name/, "name"],
  [/(grade|class|std|standard).*(section|div)|(section|div).*(grade|class)/, "gradeSection"],
  [/section|\bdiv/, "section"],
  [/grade|class|\byear\b|\bstd\b|standard/, "grade"],
  [/phone|mobile|whatsapp|contact no|contact number/, "phone"],
  [/note|comment|remark|anything|other|question/, "notes"],
];

// The website opens this URL in a new tab with the registration in the query string
// (the student is signed in there, which a school-only deployment needs), and the
// tab shows a confirmation. With no registration in the URL, it reports the setup.
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (!p.name && !p.email) return reply({ ok: true, sheet: targetSheet().getName(), columns: DEFAULT_HEADERS });
  return page(p, record(p));
}

// Background JSON POST, used when the web app is deployed for "Anyone".
function doPost(e) {
  try {
    return reply(record(JSON.parse((e && e.postData && e.postData.contents) || "{}")));
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

function record(r) {
  if (!r.name || !r.email || !r.eventTitle) return { ok: false, error: "The registration was missing a name, email or event." };
  // A refreshed or reopened tab sends the same registration again; add it only once.
  const cache = CacheService.getScriptCache();
  const key = `reg:${r.email}:${r.ts}`.slice(0, 250);
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    if (cache.get(key)) return { ok: true, duplicate: true };
    const sheet = targetSheet();
    let headers = sheet.getLastColumn() ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0] : [];
    if (!headers.some((h) => String(h).trim())) {
      headers = DEFAULT_HEADERS;
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
    const values = fieldValues(r);
    sheet.appendRow(headers.map((h) => {
      const k = fieldFor(h);
      return k ? clean(values[k]) : "";
    }));
    cache.put(key, "1", 21600);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  } finally {
    lock.releaseLock();
  }
}

function page(r, result) {
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const body = result.ok
    ? `<h1>Registration received</h1>
       <p>${esc(r.name)}, you're on the list for <b>${esc(r.eventTitle)}</b>.</p>
       <p class="code">${esc(r.code)}</p>
       <p class="small">The Round Square committee has it. You can close this tab.</p>`
    : `<h1>That didn't go through</h1>
       <p>${esc(result.error)}</p>
       <p class="small">Go back to the registration page and try again, or email your event code to ${esc(COMMITTEE_EMAIL)}.</p>`;
  return HtmlService.createHtmlOutput(`<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body { margin: 0; font: 17px/1.5 Georgia, serif; color: #1d1d1b; background: #fff; }
      main { max-width: 520px; margin: 12vh auto; padding: 0 20px; }
      h1 { font: 600 30px/1.2 Georgia, serif; color: #7f3286; margin: 0 0 16px; }
      .code { font: 700 22px/1 Arial, sans-serif; letter-spacing: .08em; color: #7f3286; border: 2px solid #7f3286; display: inline-block; padding: 10px 14px; }
      .small { font: 15px/1.5 Arial, sans-serif; color: #555; }
    </style>
    <main>${body}</main>`).setTitle(result.ok ? "Registration received" : "Registration not sent");
}

function targetSheet() {
  const book = SpreadsheetApp.openById(SHEET_ID);
  return book.getSheets().find((s) => s.getSheetId() === SHEET_GID) || book.getSheets()[0];
}

function fieldFor(header) {
  const h = String(header).toLowerCase().replace(/[^a-z ]+/g, " ").replace(/\s+/g, " ").trim();
  if (!h) return null;
  const rule = RULES.find(([test]) => test.test(h));
  return rule ? rule[1] : null;
}

function fieldValues(r) {
  const when = new Date(r.ts);
  const parts = String(r.name || "").trim().split(/\s+/);
  return {
    ts: Utilities.formatDate(isNaN(when) ? new Date() : when, TIME_ZONE, "dd/MM/yyyy HH:mm:ss"),
    code: r.code,
    eventTitle: r.eventTitle,
    eventDate: r.eventWhen,
    host: r.host,
    name: r.name,
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
    grade: r.grade,
    section: r.section,
    gradeSection: `${r.grade || ""}${r.section || ""}`,
    email: r.email,
    // The school account the student was signed in with (school-only deployments).
    account: signedInAs(),
    // School emails look like name.adani1234@adaniinternational.edu.in; the digits are the UID.
    uid: (String(r.email || "").match(/adani(\d+)@/i) || [])[1] || "",
    phone: r.phone,
    suitability: r.suitability,
    notes: r.notes,
  };
}

function signedInAs() {
  try { return Session.getActiveUser().getEmail(); } catch (err) { return ""; }
}

// Keep cells short, and stop text that starts with = + - @ from running as a formula.
function clean(v) {
  const s = String(v == null ? "" : v).slice(0, 2000);
  return /^[=+\-@]/.test(s) ? `'${s}` : s;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
