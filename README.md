# ADIS × Round Square Committee site

A static site with three pages:

- `index.html`: **Common Ground**. The newsletter reader (switch issues), the six IDEALS and the RS Bulletin (highlights you can filter by IDEAL, plus upcoming events you can filter by type, with details and live countdowns).
- `committee.html`: the committee as flip cards. Tap a card to see contacts and copy an email or phone number. Search by name, role or IDEAL.
- `register.html`: sign-up in three steps. Pick an event or project, add your details, then say in a few sentences why you are a good fit. You get a ticket with a meeting code and an "Add to calendar" file.

Colours and type follow the ADIS × Round Square design system: purple, blue, red and gold, Source Serif 4 with Barlow, and the Meeting Band.

## Run it

Open the folder with any static web server, for example `python3 -m http.server`, then visit http://localhost:8000. Any static host works too (GitHub Pages, Netlify, the school web server).

## Edit the content

Everything is in **`js/data.js`**. Events, highlights and the newsletter come from Round Square postcards, posters and Hub pages; nothing is invented.

- `config.idealOfFortnight` sets the IDEAL shown as "Now".
- `newsletters` holds the issues, newest first. Set `pdf` to a file path to show a download button.
- `events`: each has a `tag` (`lab`, `postcard`, `collab` or `conference`), which drives the filters on the Bulletin and Register page, plus `host`, `place`, `grades` and `body`. Optional: `deadline` (sign-ups close after that day), `dateLabel` (what the date means, such as "Open until"), `when` and `ends` for multi-day events, `prep`, `contact`, `spots` + `taken` to cap places, and `meetingCode` once a host shares a Zoom or Google Meet ID. Without it, tickets show an event code from the type and order, such as `COLAB001`. Events disappear automatically once they are over.
- `committee`: each member is in `students` (the student committee) or `teachers`.
- Each IDEAL has one fixed colour, set in `css/styles.css` under "One colour per IDEAL".
- The ASCII drawings (the globe on the home page, the circle in the square on Committee, the sun on Register) are canvas shaders in `js/ascii.js`.
- After changing CSS or JS, raise the `?v=` number on the `<link>` and `<script>` tags in the three HTML files so browsers fetch the new files.

## Collecting registrations

By default, registrations are saved only in the student's own browser (they appear under "My registrations"). To send every sign-up to the committee's Google Sheet as a new row:

1. **Make sure it's a Google Sheet, not an uploaded Excel file.** Open the sheet; if the title has an `.XLSX` badge, choose **File > Save as Google Sheets** and use the new copy's ID (the long part of its URL between `/d/` and `/edit`) for `SPREADSHEET_ID` in `apps-script/Code.gs`.
2. In the sheet, open **Extensions > Apps Script**, delete the sample code and paste in everything from `apps-script/Code.gs`. Save.
3. **Deploy > New deployment**, type **Web app**. Set *Execute as*: **Me**, and *Who has access*: **Anyone**. Click **Deploy** and allow the permissions it asks for (Google may warn the app is unverified; choose *Advanced > Go to project*).
4. Copy the **Web app URL** (it ends in `/exec`) and paste it into `config.registrationEndpoint` in `js/data.js`. Raise the `?v=` number on `data.js` in the three HTML files.
5. Test: open the `/exec` URL in a browser (it should say the endpoint is running), then register for an event on the site and check that a row appears.

Rows go to the tab in the sheet link (`gid=1264311299`); if that tab is missing, a **Registrations** tab is created. A header row is added if the tab is empty. Columns: Submitted at, Event code, Event ID, Event, Name, Grade, Section, Email, Phone, Why a good fit, Notes.

If you edit `Code.gs` later, use **Deploy > Manage deployments > Edit > Version: New version** so the same URL runs the new code. If a sign-up can't reach the sheet, the student's ticket says so and asks them to email the committee.

## Easter eggs (committee eyes only)

1. **Konami code** (↑ ↑ ↓ ↓ ← → ← → B A) turns on round mode: every square goes round. Enter it again to switch back.
2. **Type `ideals`** anywhere outside a text box and the letters rain down.
3. **Click the Round Square mark** in the header five times and it rolls across the screen.
4. **Hover the gold** at the end of the Meeting Band for a hidden note.
5. **Tap the rising sun** in the home-page picture three times for a sunrise and Kurt Hahn's motto.
6. **Search "Hahn"** on the committee page to meet an honorary member.

A footer counter tracks how many eggs a visitor has found, and there's a note in the browser console for anyone who opens the developer tools.
