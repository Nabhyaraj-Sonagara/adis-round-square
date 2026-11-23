/**
 * ADIS × Round Square: writes each sign-up from register.html into the Google Sheet.
 *
 * Setup (once): see "Collecting registrations" in README.md.
 * After any change to this file, deploy a NEW VERSION of the web app
 * (Deploy > Manage deployments > Edit > Version: New version) or the old code keeps running.
 */
const SPREADSHEET_ID = "1hIr-vqbOJcg2Q9QPCQpzXvNItbpPCXVa";
const SHEET_GID = 1264311299;          // the tab from the sheet link (#gid=...)
const FALLBACK_TAB = "Registrations";  // used if that tab can't be found

const COLUMNS = [
  ["ts", "Submitted at"],
  ["code", "Event code"],
  ["eventId", "Event ID"],
  ["eventTitle", "Event"],
  ["name", "Name"],
  ["grade", "Grade"],
  ["section", "Section"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["suitability", "Why a good fit"],
  ["notes", "Notes"],
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (!data.name || !data.email || !data.eventId) return reply({ ok: false, error: "missing fields" });

    const sheet = getSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(COLUMNS.map((c) => c[1]));
      sheet.setFrozenRows(1);
    }
    sheet.appendRow(COLUMNS.map((c) => clean(data[c[0]])));
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Lets you open the web-app URL in a browser to check it's live.
function doGet() {
  return reply({ ok: true, message: "ADIS Round Square registrations endpoint is running." });
}

function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheets().find((s) => s.getSheetId() === SHEET_GID)
    || ss.getSheetByName(FALLBACK_TAB)
    || ss.insertSheet(FALLBACK_TAB);
}

// Plain text, capped, and never interpreted as a formula.
function clean(v) {
  const s = String(v == null ? "" : v).slice(0, 2000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
