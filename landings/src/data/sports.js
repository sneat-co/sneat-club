// Sport-specific landing content for Sneat Club.
// The club spine is the same for every sport; these pages just speak each
// sport's language and foreground the integrations that matter most to it.
// Add a sport by adding an entry here — the /sports/<slug> page and the home
// "Built for your sport" section pick it up automatically.

export const SPORTS = [
  {
    slug: "running",
    name: "Running clubs",
    short: "Running",
    emoji: "🏃",
    tagline: "Your running club, organised.",
    intro:
      "From a 20-runner social group to a full athletics club — Sneat Club keeps your members, sessions, races and subs in one place, so committee nights are about running, not admin.",
    handles: [
      { icon: "👥", title: "Members & renewals", text: "Every runner, their age category and season membership — renewals without the spreadsheet." },
      { icon: "🏁", title: "Races & championships", text: "Track club-championship races and who's entered what across the season." },
      { icon: "🗓️", title: "Training sessions", text: "Weekly track, tempo and long-run sessions on one calendar, with who's coming." },
      { icon: "🏆", title: "Results & PBs", text: "Keep results and personal bests against each member's profile." },
    ],
    plugs: [
      { name: "RSVP.express", text: "session & race sign-ups" },
      { name: "Calendarius", text: "the fixture list" },
      { name: "Debtus", text: "membership fees & race levies" },
    ],
  },
  {
    slug: "cycling",
    name: "Cycling clubs",
    short: "Cycling",
    emoji: "🚴",
    tagline: "Every club run, ride and rider.",
    intro:
      "Club runs, sportives and a shed full of kit — Sneat Club organises your riders, ride calendar and groups so ride leaders can lead, not chase WhatsApp replies.",
    handles: [
      { icon: "👥", title: "Members & affiliation", text: "Riders, categories and season membership, with the affiliation details your federation needs." },
      { icon: "🚲", title: "Ride calendar & groups", text: "A / B / C group rides on one calendar — riders pick a group and a pace." },
      { icon: "🦺", title: "Ride-leader rota", text: "Assign and confirm ride leaders and back-markers for every club run." },
      { icon: "👕", title: "Club kit", text: "Collect jersey, bib and glove sizes once and order the whole club's kit in one go." },
    ],
    plugs: [
      { name: "RSVP.express", text: "ride sign-ups & availability" },
      { name: "Sizeus", text: "the club kit sheet" },
      { name: "Debtus", text: "subs & kit payments" },
    ],
  },
  {
    slug: "badminton",
    name: "Badminton clubs",
    short: "Badminton",
    emoji: "🏸",
    tagline: "Club nights, courts and leagues.",
    intro:
      "Book the courts, run the club night, sort the leagues — Sneat Club handles the membership, attendance and box-league admin so your hall time is spent playing.",
    handles: [
      { icon: "👥", title: "Members & subs", text: "Members, guests and season subs — know who's paid before the season starts." },
      { icon: "🗓️", title: "Club-night attendance", text: "Who's coming on Tuesday? Attendance and availability for every club night." },
      { icon: "🏟️", title: "Court booking", text: "Book and manage your hall and court time — reservations, not a group chat." },
      { icon: "🪜", title: "Box & ladder leagues", text: "Run internal box or ladder leagues and keep the standings up to date." },
    ],
    plugs: [
      { name: "Bookius", text: "court & hall booking" },
      { name: "MatchUps.center", text: "box & ladder leagues" },
      { name: "Debtus", text: "membership subs" },
    ],
  },
];
