/*
 * ADIS × Round Square — site content.
 * Edit this file to update the newsletter, bulletin, events and committee.
 * Everything below is SAMPLE content: replace names, contacts and stories before going live.
 */
window.RS = {
  config: {
    // Where registrations are sent. Leave empty to keep them on this device only
    // (shown under "My registrations"). Paste a Formspree / Google Apps Script URL
    // that accepts a JSON POST to collect them centrally.
    registrationEndpoint: "",
    committeeEmail: "roundsquare@adis.example",
    // The IDEAL in focus this fortnight (one of the keys in `ideals`).
    idealOfFortnight: "D",
  },

  ideals: {
    I: { name: "Internationalism", blurb: "Seeing the world through other people's eyes, and making friends across borders." },
    D: { name: "Democracy", blurb: "Every voice counts. We debate, listen, vote and own the outcome together." },
    E: { name: "Environmentalism", blurb: "Caring for the planet we share, from our campus garden to the Sabarmati riverfront." },
    A: { name: "Adventure", blurb: "Stepping outside comfort zones, on treks, expeditions and new challenges." },
    L: { name: "Leadership", blurb: "Leading by example, and helping others find the leader in themselves." },
    S: { name: "Service", blurb: "Doing real work for real people, and learning from those we serve." },
  },

  newsletters: [
    {
      id: "02",
      dates: "16–29 November 2026",
      ideal: "D",
      pdf: "", // e.g. "newsletters/common-ground-02.pdf"
      intro: "This fortnight the student council ran its first open budget vote, and Grade 9 joined a Round Square Baraza with schools from four continents.",
      lead: {
        title: "Students vote on how to spend the service fund",
        body: "Over 300 students voted in the first open budget ballot. The winning proposal, a reading corner for the neighbourhood anganwadi, gets 60% of the term's service fund. Grade 11 counted every ballot by hand in the library on Friday afternoon.",
        caption: "Photo: Grade 11 counting ballots in the ADIS library, 20 November",
      },
      network: [
        { title: "Baraza: what does fairness look like?", body: "Twelve ADIS students met peers from Kenya, Peru and Canada on Zoom to compare how their schools make rules.", school: "Round Square Baraza" },
        { title: "A student parliament in Cape Town", body: "A partner school shared how its student parliament writes its own constitution, one clause at a time.", school: "From the network" },
      ],
      adis: { title: "Model UN club opens to Grade 8", body: "After a petition signed by 84 students, Model UN will welcome Grade 8 from January. Sign-ups open on the Register page." },
      quote: { text: "I didn't think my one vote mattered until we counted them all.", by: "Grade 10 student, after the budget vote" },
    },
    {
      id: "01",
      dates: "2–15 November 2026",
      ideal: "E",
      pdf: "",
      intro: "Our first issue! The Round Square committee launched with a riverfront clean-up and a pledge to cut single-use plastic on campus.",
      lead: {
        title: "180 kilos of waste lifted from the riverfront",
        body: "Sixty students from Grades 7–12 spent a Saturday morning at the Sabarmati riverfront, sorting what they collected into recyclable and non-recyclable piles. The recyclables went to a local collective.",
        caption: "Photo: Grade 8 at the Sabarmati riverfront, 8 November",
      },
      network: [
        { title: "A forest planted by six countries", body: "Students from six Round Square schools each planted saplings on the same day and logged them on a shared map.", school: "From the network" },
        { title: "Postcard: rethinking waste", body: "A Round Square Postcard brought 40 schools together online to share one change each had made.", school: "Round Square Postcard" },
      ],
      adis: { title: "The canteen goes steel", body: "From December, the canteen serves in steel plates and cups. The committee's plastic audit counted 1,200 disposable items a week." },
      quote: { text: "We came for an hour. We stayed until lunch.", by: "Grade 8 volunteer at the riverfront" },
    },
  ],

  highlights: [
    { title: "Budget vote: the anganwadi reading corner wins", ideal: "D", date: "2026-11-20", body: "60% of the service fund goes to a reading corner chosen by the whole school." },
    { title: "Riverfront clean-up lifts 180 kg of waste", ideal: "E", date: "2026-11-08", body: "Sixty students, one Saturday, a lot of gloves." },
    { title: "Baraza with Kenya, Peru and Canada", ideal: "I", date: "2026-11-18", body: "Twelve students compared how their schools make rules." },
    { title: "Grade 10 summits Kalsubai", ideal: "A", date: "2026-10-25", body: "The highest peak in Maharashtra, before sunrise." },
    { title: "Peer tutors log 400 hours", ideal: "S", date: "2026-11-14", body: "Senior students now tutor every weekday after school." },
    { title: "New student committee takes office", ideal: "L", date: "2026-11-03", body: "Five students sworn in to run Round Square at ADIS this year." },
  ],

  // `tag` decides the filter on the Register page (keys in `tags` below). `date` in ISO, local time.
  tags: {
    lab: { one: "Study lab", many: "Study labs" },
    postcard: { one: "Zoom Postcard", many: "Zoom Postcards" },
    collab: { one: "Collaboration", many: "Collaborations" },
    conference: { one: "Conference", many: "Conferences" },
  },
  events: [
    { id: "postcard-democracy", tag: "postcard", title: "Round Square Postcard: Democracy in action", ideal: "D", date: "2026-12-03T16:00", place: "Zoom, Room 204 for the call", grades: "9–12", spots: 20, taken: 13, body: "A small-group discussion with students from four Round Square schools. Bring one rule from your school you'd change." },
    { id: "anganwadi", tag: "collab", title: "Anganwadi reading corner", ideal: "S", date: "2026-12-07T14:00", place: "Shantigram anganwadi, weekly, Mondays", grades: "8–12", spots: 16, taken: 9, body: "Build and run the reading corner the school voted for, with the anganwadi staff. Storytelling, shelves and a lot of paint." },
    { id: "beach-cleanup", tag: "collab", title: "Dumas beach clean-up", ideal: "E", date: "2026-12-12T07:00", place: "Dumas beach, Surat, bus from school 05:30", grades: "7–12", spots: 45, taken: 31, body: "A morning clean-up with a partner NGO. Parent consent needed; breakfast provided." },
    { id: "postcard-plastic", tag: "postcard", title: "Round Square Postcard: Plastic-free campuses", ideal: "E", date: "2026-12-17T16:30", place: "Zoom, Library seminar room", grades: "7–10", spots: 25, taken: 8, body: "Schools from three continents share one change that cut plastic on their campus. We present our steel-plate canteen." },
    { id: "mun-lab", tag: "lab", title: "Model UN study lab for Grade 8", ideal: "I", date: "2027-01-08T15:30", place: "ADIS auditorium, Fridays", grades: "8", spots: 30, taken: 4, body: "Learn to research a country, write a position paper and speak in committee, coached by senior delegates." },
    { id: "regional-conference", tag: "conference", title: "Round Square regional conference: delegation trials", ideal: "A", date: "2027-01-23T09:00", place: "Seminar hall, trials for the 3-day conference", grades: "9–11", spots: 24, taken: 22, body: "Try out for the ADIS delegation. Bring a two-minute talk on an IDEAL that matters to you." },
    { id: "lead-lab", tag: "lab", title: "Leadership study lab: running a meeting", ideal: "L", date: "2027-02-06T13:00", place: "Seminar hall", grades: "7–12", spots: 40, taken: 12, body: "A hands-on workshop by the committee: agendas, minutes and getting everyone heard." },
  ],

  // `group`: "students" (the student committee) or "teachers".
  committee: [
    { name: "Aarav Mehta", role: "President", group: "students", grade: "12 A", email: "president.rs@adis.example", phone: "+91 98000 00001", ideal: "L", fact: "Has never missed a Baraza." },
    { name: "Ishita Rao", role: "Vice President", group: "students", grade: "12 C", email: "vp.rs@adis.example", phone: "+91 98000 00002", ideal: "D", fact: "Wrote the committee's constitution." },
    { name: "Kabir Shah", role: "Secretary", group: "students", grade: "11 B", email: "secretary.rs@adis.example", phone: "+91 98000 00003", ideal: "D", fact: "Takes minutes faster than anyone talks." },
    { name: "Meher Joshi", role: "Treasurer", group: "students", grade: "11 A", email: "treasurer.rs@adis.example", phone: "+91 98000 00004", ideal: "S", fact: "Ran the service fund vote." },
    { name: "Ananya Patel", role: "Editor, Common Ground", group: "students", grade: "11 D", email: "editor.rs@adis.example", phone: "", ideal: "I", fact: "Edits every issue of the newsletter." },
    { name: "Ms. Priya Sharma", role: "Round Square Representative", group: "teachers", grade: "Teacher", email: "rs.rep@adis.example", phone: "+91 79000 00010", ideal: "I", fact: "Your first stop for exchanges and conferences." },
    { name: "Mr. Rohan Verma", role: "Service Coordinator", group: "teachers", grade: "Teacher", email: "service.coord@adis.example", phone: "+91 79000 00011", ideal: "S", fact: "Signs off every off-campus trip." },
  ],
};
