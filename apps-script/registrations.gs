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
 *   2. Deploy > New deployment > type "Web app".
 *      Execute as: Me.  Who has access: Anyone.  Deploy, then allow access.
 *   3. Copy the Web app URL (ends in /exec) into registrationEndpoint in js/data.js.
 * After editing this script, use Deploy > Manage deployments > Edit > New version,
 * so the same URL keeps working.
 */

const SHEET_ID = "1Lrql9sWd0CJEh0iXd2zPd_2YcNr9JsjpTQnGBI7r1gk";
const SHEET_GID = 0; // the tab from the link (#gid=0)
const TIME_ZONE = "Asia/Kolkata";

const DEFAULT_HEADERS = [
  "Timestamp", "Event code", "Event", "Event date", "Host",
  "Name", "Grade", "Section", "Email", "UID", "Phone", "Why suitable", "Notes",
];

// Header text -> field. The first rule whose test matches wins, so the order matters
// ("Why suitable for this event" before "Event", "Event code" before "Event",
// "Event date" before "Timestamp").
const RULES = [
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

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const r = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (!r.name || !r.email || !r.eventTitle) return reply({ ok: false, error: "Missing name, email or event." });

    const sheet = targetSheet();
    let headers = sheet.getLastColumn() ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0] : [];
    if (!headers.some((h) => String(h).trim())) {
      headers = DEFAULT_HEADERS;
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    const values = fieldValues(r);
    sheet.appendRow(headers.map((h) => {
      const key = fieldFor(h);
      return key ? clean(values[key]) : "";
    }));
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Opening the /exec URL in a browser shows this, which is a quick way to check the deployment.
function doGet() {
  return reply({ ok: true, sheet: targetSheet().getName(), columns: DEFAULT_HEADERS });
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
    // School emails look like name.adani1234@adaniinternational.edu.in; the digits are the UID.
    uid: (String(r.email || "").match(/adani(\d+)@/i) || [])[1] || "",
    phone: r.phone,
    suitability: r.suitability,
    notes: r.notes,
  };
}

// Keep cells short, and stop text that starts with = + - @ from running as a formula.
function clean(v) {
  const s = String(v == null ? "" : v).slice(0, 2000);
  return /^[=+\-@]/.test(s) ? `'${s}` : s;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
