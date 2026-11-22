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
    { title: "New student committee takes office", ideal: "L", date: "2026-11-03", body: "Anushka Bhandari is President and Shanaya Shelat Vice President of a 26-member committee." },
  ],

  // `tag` decides the filter on the Register page (keys in `tags` below). `date` in ISO, local time.
  tags: {
    lab: { one: "Study lab", many: "Study labs" },
    postcard: { one: "Zoom Postcard", many: "Zoom Postcards" },
    collab: { one: "Collaboration", many: "Collaborations" },
    conference: { one: "Conference", many: "Conferences" },
  },
  // Optional fields: `ends` (last day), `when` (date in words), `dateLabel` (what `date` marks),
  // `deadline` (last day to sign up), `prep`, `contact`, and `spots` + `taken` for a capped event.
  events: [
    { id: "facts-feed", tag: "postcard", title: "Facts behind the feed: looking beyond headlines", ideal: "L", date: "2026-11-25T14:00", host: "Sarala Birla Academy", place: "Zoom", grades: "Grades 11–12", deadline: "2026-11-17",
      body: "Algorithms flash headlines that shape what we think. This call is about pausing, questioning the context and tracing the facts before we share.",
      prep: "Read the article the hosts share and bring your perspective.", contact: "Samar Agshikar (8C) and Advit Sah (7B)" },
    { id: "breaking-barriers", tag: "postcard", title: "Breaking barriers and shaping tomorrow", ideal: "D", date: "2026-11-25T19:30", host: "Ashbury College, Ottawa", place: "Zoom", grades: "Grades 8–10", deadline: "2026-11-17",
      body: "Why are young people speaking out and protesting, and what changes do they want in their communities? Baraza discussions with students around the world.",
      contact: "Samar Agshikar (8C) and Advit Sah (7B)" },
    { id: "english-lab-travel", tag: "lab", title: "English Lab: travel and tourism", ideal: "I", date: "2026-11-26T18:30", host: "Round Square student hosts", place: "Online", grades: "All grades, groups by ability",
      body: "A one-hour conversation session with students your own age, supported by native-speaking peers from Round Square schools. Beginner, intermediate and advanced groups.",
      contact: "Prisha Gupta (7B), Samaira Parikh (7B), Vihana Patel (7A), Dhrasika Sekhani (7C) or Ms. Hina Gandhi" },
    { id: "school-lunches", tag: "collab", title: "Exploring school lunches around the world", ideal: "I", date: "2026-11-26", dateLabel: "Open until", host: "Bloom KKCA Academy", place: "Online", grades: "Primary and middle years",
      body: "Share a photo and a short description of a typical ADIS lunch, then compare what students eat at school around the world: culture, nutrition and sustainability." },
    { id: "daily-routine", tag: "collab", title: "My daily routine: an English writing exchange", ideal: "I", date: "2026-11-27", dateLabel: "Open until", host: "BJAB", place: "Padlet", grades: "Secondary years",
      body: "Write about your day in simple present English, share it with students learning English elsewhere and compare lifestyles. Photos welcome." },
    { id: "planet-cloud", tag: "postcard", title: "The planet behind the cloud: the impact of our online storage", ideal: "E", date: "2026-12-02T18:30", host: "Michael Ham Memorial College", place: "Zoom", grades: "Grades 4–6",
      body: "What does all that stored data cost the planet? A look at the footprint of the files we never delete.",
      prep: "Screenshot your storage in Google Drive, OneDrive or iCloud. What takes up the most space, what surprised you, and what would be hardest to delete?", contact: "Samar Agshikar (8C) and Advit Sah (7B)" },
    { id: "passport-identity", tag: "postcard", title: "Other than a passport, what shapes our identity?", ideal: "I", date: "2026-12-02T13:30", host: "Malvern College Hong Kong", place: "Zoom", grades: "Grades 8–10", deadline: "2026-11-25",
      body: "Look past nationality to the culture, relationships, interests and stories that make you who you are, and find what you share with people unlike you.",
      prep: "Think about what identity means to you and make a few notes.", contact: "Samar Agshikar (8C) and Advit Sah (7B)" },
    { id: "world-2046", tag: "postcard", title: "What kind of world are we leaving behind?", ideal: "E", date: "2026-12-09T12:00", host: "The Cathedral and John Connon School", place: "Zoom", grades: "Grades 6–8", deadline: "2026-12-01",
      body: "Imagine life in 2046 and the environmental challenges the next generation may face, then share how small actions today could change that future.",
      prep: "Make an A4 artwork called “A Message from 2046” about food, water, waste, biodiversity, pollution or green spaces.", contact: "Samar Agshikar (8C) and Advit Sah (7B)" },
    { id: "ai-hero", tag: "postcard", title: "AI: hero or heartbreaker? Pros, cons and regulation", ideal: "D", date: "2026-12-09T18:30", host: "Scarsdale High School", place: "Zoom", grades: "Ages 15–18",
      body: "How is AI used in our schools, what are the benefits, dangers and costs, and how should it be regulated?",
      prep: "Bring examples of how you use AI at school and how it is regulated where you live." },
    { id: "moving-palette", tag: "collab", title: "Moving Palette: art through animation", ideal: "E", date: "2026-12-15", dateLabel: "Films due", host: "The British School New Delhi", place: "Online festival, 1 February 2027", grades: "Ages 10–18",
      body: "Make a 20-second to 1.5-minute drawn or stop-motion film inspired by artists who work with nature and sustainability. Recycled materials encouraged; solo or in pairs." },
    { id: "collaborative-art", tag: "collab", title: "Collaborative art brainstorm", ideal: "S", date: "2027-01-01", dateLabel: "Register by", host: "St George’s School, Windsor Castle", place: "Padlet", grades: "All ages",
      body: "Share photos of whole-school art displays that celebrate a Round Square IDEAL or Discovery, and build a collection of ideas from schools around the world." },
    { id: "virtue-chronicles", tag: "collab", title: "Virtue Chronicles 2026, season 2", ideal: "L", date: "2027-01-23", dateLabel: "Global premiere", host: "SAI International Residential School", place: "Online", grades: "Up to 10 students per school",
      body: "Explore one assigned virtue through your own culture and experience, practise it, and turn it into a 3–5 minute short film for a global showcase." },
    { id: "orka-conference", tag: "conference", title: "ORKA: Energy, Strength, Power", ideal: "A", date: "2027-02-10", ends: "2027-02-14", when: "10–14 February 2027", host: "Daly College", place: "Indore, India", grades: "Grades 6–7",
      body: "A Round Square conference where adventure comes alive: challenges, discovery, teamwork and new friendships with young explorers from across the globe. Boarding at the school.",
      contact: "Mr. Kumar Abhishek, Middle Block, 2nd floor staff room" },
    { id: "varanasi-conference", tag: "conference", title: "Across and Beyond: One World, One Heart", ideal: "I", date: "2027-03-26", ends: "2027-03-30", when: "26–30 March 2027", host: "Sunbeam Suncity", place: "Varanasi, India", grades: "Grades 7–9",
      body: "Join young learners in the historic city of Varanasi to explore new perspectives, build connections and celebrate internationalism. Boarding at the school.",
      contact: "Mr. Kumar Abhishek, Middle Block, 2nd floor staff room" },
    { id: "le-systeme-scolaire", tag: "collab", title: "Le système scolaire", ideal: "D", date: "2027-06-01", dateLabel: "Open until", host: "BJAB", place: "Online", grades: "Secondary years, French learners",
      body: "Present the Indian school system in French, then compare structures, subjects, timetables and exams with partner schools." },
    { id: "ai-ideals", tag: "collab", title: "AI and the Round Square IDEALS", ideal: "L", date: "2027-06-01", dateLabel: "Open until", host: "The Athenian School", place: "Online", grades: "Secondary years",
      body: "Use the IDEALS as a framework for using AI responsibly: try The Athenian School’s AI principles, improve them or build your own." },
    { id: "sustainable-world", tag: "collab", title: "How to make our world more sustainable", ideal: "E", date: "2027-07-23", dateLabel: "Open until", host: "BJAB", place: "Online", grades: "Middle and secondary years",
      body: "Research clean water, renewable energy, waste and resources, and share practical solutions for everyday life with schools around the world." },
    { id: "holiday-cards", tag: "collab", title: "Global holiday card exchange", ideal: "I", date: "2027-08-01", dateLabel: "Open until", host: "Malvern College Hong Kong", place: "Padlet", grades: "Middle and secondary years",
      body: "Design a card for a holiday celebrated at home, by hand or digitally, with a description in your mother tongue and English. Every card joins a shared Padlet." },
  ],

  // `group`: "students" (the student committee) or "teachers". `grade`, `phone`, `ideal` and `note` are optional.
  committee: [
    { name: "Anushka Bhandari", role: "President", group: "students", email: "anushka.adani1639@adaniinternational.edu.in" },
    { name: "Shanaya Shelat", role: "Vice President", group: "students", email: "shanaya.adani1187@adaniinternational.edu.in" },
    { name: "Rajveer Jiten Patel", role: "Member", group: "students", email: "rajveer.adani1163@adaniinternational.edu.in" },
    { name: "Aniv Saxena", role: "Member", group: "students", email: "aniv.adani1727@adaniinternational.edu.in" },
    { name: "Kriaansh Tharwani", role: "Member", group: "students", email: "kriaansh.adani1354@adaniinternational.edu.in" },
    { name: "Gyani Barad", role: "Member", group: "students", email: "gyani.adani1294@adaniinternational.edu.in" },
    { name: "Vihana Patel", role: "Member", group: "students", email: "vihana.adani1224@adaniinternational.edu.in" },
    { name: "Prisha Gupta", role: "Member", group: "students", email: "prisha.adani1436@adaniinternational.edu.in" },
    { name: "Samaira Shirin Parikh", role: "Member", group: "students", email: "samaira.adani1449@adaniinternational.edu.in" },
    { name: "Advit Sah", role: "Member", group: "students", email: "advit.adani1803@adaniinternational.edu.in" },
    { name: "Dhrasika Sekhani", role: "Member", group: "students", email: "dhrasika.adani1358@adaniinternational.edu.in" },
    { name: "Priyal Vineet Sankhla", role: "Member", group: "students", email: "priyal.adani2147@adaniinternational.edu.in" },
    { name: "Nabhyaraj Sonagara", role: "Member", note: "Very cool dude", group: "students", email: "nabhyaraj.adani2396@adaniinternational.edu.in" },
    { name: "Prish Mehta", role: "Member", group: "students", email: "prish.adani1883@adaniinternational.edu.in" },
    { name: "Samar Agshikar", role: "Member", group: "students", email: "samar.adani2163@adaniinternational.edu.in" },
    { name: "Aradhya Kothari", role: "Member", group: "students", email: "aradhya.adani1183@adaniinternational.edu.in" },
    { name: "Navika Laddha", role: "Member", group: "students", email: "navika.adani1219@adaniinternational.edu.in" },
    { name: "Dhyana Choksi", role: "Member", group: "students", email: "dhyana.adani1387@adaniinternational.edu.in" },
    { name: "Peher Bharvad", role: "Member", group: "students", email: "peher.adani2397@adaniinternational.edu.in" },
    { name: "Kanisha Shah", role: "Member", group: "students", email: "kanisha.adani1737@adaniinternational.edu.in" },
    { name: "Aria Ukani", role: "Member", group: "students", email: "aria.adani2140@adaniinternational.edu.in" },
    { name: "Aisha Rajvanshi", role: "Member", group: "students", email: "aisha.adani2167@adaniinternational.edu.in" },
    { name: "Sonakshi Agrawal", role: "Member", group: "students", email: "sonakshi.adani1756@adaniinternational.edu.in" },
    { name: "Bhairavi Bharath", role: "Member", group: "students", email: "bhairavi.adani2379@adaniinternational.edu.in" },
    { name: "Aishani Swain", role: "Member", group: "students", email: "aishani.adani1820@adaniinternational.edu.in" },
    { name: "Vihan Shah", role: "Member", group: "students", email: "vihan.adani1610@adaniinternational.edu.in" },
    { name: "Mr. Kumar Abhishek", role: "Teacher", note: "Ask about conferences", group: "teachers", email: "kumar.abhishek@adaniinternational.edu.in" },
    { name: "Ms. Hina Gandhi", role: "Teacher", note: "Ask about study labs", group: "teachers", email: "hina.gandhi@adaniinternational.edu.in" },
  ],
};
