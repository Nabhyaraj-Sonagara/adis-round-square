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

Registrations are saved in the student's own browser (under "My registrations") and, when `config.registrationEndpoint` is set, sent to the committee's Google Sheet through `apps-script/registrations.gs`. That script reads the sheet's header row and fills each column by name (Timestamp, Event code, Event, Event date, Host, Name, Grade, Section, Email, UID, Phone, Why suitable, Notes, in any order and with similar wording), leaving unknown columns blank. Setup steps are at the top of the script. The web app is deployed for school accounts only, so with `config.registrationSignIn: true` each registration opens it in a new tab (where the student is signed in to their school Google account); the tab adds the row, shows "Registration received", ignores a refresh, and records the signed-in account. If it is ever deployed for "Anyone", set it to `false` and registrations send in the background. Each registration sends these fields: `code, eventId, eventTitle, eventWhen, host, name, grade, section, email, phone, suitability, notes, ts`.

## Easter eggs (committee eyes only)

1. **Konami code** (↑ ↑ ↓ ↓ ← → ← → B A) turns on round mode: every square goes round. Enter it again to switch back.
2. **Type `ideals`** anywhere outside a text box and the letters rain down.
3. **Click the Round Square mark** in the header five times and it rolls across the screen.
4. **Hover the gold** at the end of the Meeting Band for a hidden note.
5. **Tap the rising sun** in the home-page picture three times for a sunrise and Kurt Hahn's motto.
6. **Search "Hahn"** on the committee page to meet an honorary member.

A footer counter tracks how many eggs a visitor has found, and there's a note in the browser console for anyone who opens the developer tools.
