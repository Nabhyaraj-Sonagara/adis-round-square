# ADIS × Round Square Committee site

A static site with three pages:

- `index.html`: **Common Ground**. The newsletter reader (switch issues), the six IDEALS and the RS Bulletin (highlights you can filter by IDEAL, plus upcoming events with live countdowns).
- `committee.html`: the committee as flip cards. Tap a card to see contacts and copy an email or phone number. Search by name, role or IDEAL.
- `register.html`: sign-up in three steps. Pick an event or project, add your details, pick your IDEALS. You get a ticket with a code and an "Add to calendar" file.

Colours and type follow the ADIS × Round Square design system: purple, blue, red and gold, Source Serif 4 with Barlow, and the Meeting Band.

## Run it

Open the folder with any static web server, for example `python3 -m http.server`, then visit http://localhost:8000. Any static host works too (GitHub Pages, Netlify, the school web server).

## Edit the content

Everything is in **`js/data.js`**. All of it is sample content right now: replace the names, emails, phone numbers, stories and events before you publish.

- `config.idealOfFortnight` sets the IDEAL shown as "Now".
- `newsletters` holds the issues, newest first. Set `pdf` to a file path to show a download button.
- `events`: each has a `tag` (`lab`, `postcard`, `collab` or `conference`), which drives the filter on the Register page. Events with a past date disappear automatically.
- `committee`: each member is in `students` (the student committee) or `teachers`.
- Each IDEAL has one fixed colour, set in `css/styles.css` under "One colour per IDEAL".
- The ASCII drawings (the globe on the home page, the circle in the square on Committee, the sun on Register) are canvas shaders in `js/ascii.js`.
- After changing CSS or JS, raise the `?v=` number on the `<link>` and `<script>` tags in the three HTML files so browsers fetch the new files.

## Collecting registrations

By default, registrations are saved only in the student's own browser (they appear under "My registrations"). To collect them centrally, set `config.registrationEndpoint` to a URL that accepts a JSON POST, such as a Formspree form or a Google Apps Script web app that writes to a Sheet. Each registration has these fields: `code, eventId, eventTitle, name, grade, section, email, phone, ideals, notes, ts`.

## Easter eggs (committee eyes only)

1. **Konami code** (↑ ↑ ↓ ↓ ← → ← → B A) turns on round mode: every square goes round. Enter it again to switch back.
2. **Type `ideals`** anywhere outside a text box and the letters rain down.
3. **Click the Round Square mark** in the header five times and it rolls across the screen.
4. **Hover the gold** at the end of the Meeting Band for a hidden note.
5. **Tap the rising sun** in the home-page picture three times for a sunrise and Kurt Hahn's motto.
6. **Search "Hahn"** on the committee page to meet an honorary member.

A footer counter tracks how many eggs a visitor has found, and there's a note in the browser console for anyone who opens the developer tools.
