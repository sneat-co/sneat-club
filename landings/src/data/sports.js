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
  {
    slug: "gaa",
    name: "GAA clubs",
    short: "GAA",
    emoji: "☘️",
    tagline: "One home for the whole GAA club.",
    intro:
      "Football, hurling and camogie across every age grade — Sneat Club keeps your members, panels, training and subs together, so the club runs as well off the pitch as it plays on it.",
    handles: [
      { icon: "👥", title: "Members & registration", text: "Every player, mentor and volunteer across all codes and age grades, with season registration." },
      { icon: "🥅", title: "Teams & panels", text: "Minor to senior, football and hurling — manage every panel and its mentors in one club." },
      { icon: "🗓️", title: "Training & fixtures", text: "Training sessions and county-board fixtures on one calendar, with who's available." },
      { icon: "🎽", title: "Gear & subs", text: "Jersey and gear sizes, membership and pitch-fund subs — sorted before the season throws in." },
    ],
    plugs: [
      { name: "RSVP.express", text: "training & match availability" },
      { name: "Sizeus", text: "jersey & gear sizes" },
      { name: "Debtus", text: "membership & pitch-fund subs" },
    ],
  },
  {
    slug: "rugby",
    name: "Rugby clubs",
    short: "Rugby",
    emoji: "🏉",
    tagline: "Your rugby club, minis to seniors.",
    intro:
      "Minis, youths, seniors and the social side — Sneat Club organises your players, squads, training and match days so the committee can focus on the club, not the admin.",
    handles: [
      { icon: "👥", title: "Members & registration", text: "Players, coaches and volunteers across all age grades, with season registration and consents." },
      { icon: "🏉", title: "Squads & age grades", text: "From minis to the first XV — manage every squad, its coaches and its panel." },
      { icon: "🗓️", title: "Training & fixtures", text: "Training and match fixtures on one calendar, with availability for every game." },
      { icon: "🩹", title: "Kit & safety", text: "Kit sizes, medical notes and emergency contacts, shared with consent and kept current." },
    ],
    plugs: [
      { name: "RSVP.express", text: "match availability & squads" },
      { name: "Sizeus", text: "the club kit sheet" },
      { name: "Debtus", text: "membership subs" },
    ],
  },
  {
    slug: "football",
    name: "Football clubs",
    short: "Football",
    emoji: "⚽",
    tagline: "Every team, every player, one club.",
    intro:
      "From the U8s to the adult league side — Sneat Club keeps your teams, players, parents and subs together, so match day is about football, not chasing forms.",
    handles: [
      { icon: "👥", title: "Members & registration", text: "Players, parents, coaches and volunteers, with season registration and consents." },
      { icon: "⚽", title: "Teams & squads", text: "Every team from juniors to adults, with its coaches and match-day squad." },
      { icon: "🗓️", title: "Training & fixtures", text: "Training and league fixtures on one calendar, with who's available to play." },
      { icon: "🎽", title: "Kit & subs", text: "Kit sizes and membership subs — order the kit and know who's paid in one go." },
    ],
    plugs: [
      { name: "RSVP.express", text: "match availability" },
      { name: "Sizeus", text: "kit sizes" },
      { name: "Debtus", text: "subs & fees" },
    ],
  },
  {
    slug: "basketball",
    name: "Basketball clubs",
    short: "Basketball",
    emoji: "🏀",
    tagline: "Courts, teams and the whole club.",
    intro:
      "From mini-ball to the national league — Sneat Club keeps your teams, rosters, court time and subs in one place, so coaches coach and the club runs itself.",
    handles: [
      { icon: "👥", title: "Members & registration", text: "Players, coaches and parents across every age group, with season registration." },
      { icon: "🏀", title: "Teams & rosters", text: "Every team and its reusable roster — the same squad ready for every game." },
      { icon: "🏟️", title: "Court time & training", text: "Book gym and court time and schedule training, with attendance and availability." },
      { icon: "🏆", title: "Games & leagues", text: "Run games with live scoring and follow your teams' league standings." },
    ],
    plugs: [
      { name: "Bookius", text: "court & gym booking" },
      { name: "GameBoard.live", text: "live scoring" },
      { name: "MatchUps.center", text: "leagues & standings" },
    ],
  },
  {
    slug: "tennis",
    name: "Tennis clubs",
    short: "Tennis",
    emoji: "🎾",
    tagline: "Members, courts and club leagues.",
    intro:
      "Coaching, club nights and the summer league — Sneat Club handles your members, court booking and internal leagues, so the committee spends less time on the clubhouse laptop.",
    handles: [
      { icon: "👥", title: "Members & subs", text: "Members, juniors and season subs — know who's paid and who's due to renew." },
      { icon: "🎾", title: "Court booking", text: "Members book courts and coaching slots against real availability." },
      { icon: "🪜", title: "Club leagues & ladders", text: "Run box leagues and ladders and keep the standings current." },
      { icon: "🗓️", title: "Coaching & club nights", text: "Coaching sessions and club nights on one calendar, with who's coming." },
    ],
    plugs: [
      { name: "Bookius", text: "court & coaching booking" },
      { name: "MatchUps.center", text: "box leagues & ladders" },
      { name: "Debtus", text: "membership subs" },
    ],
  },
  {
    slug: "hockey",
    name: "Hockey clubs",
    short: "Hockey",
    emoji: "🏑",
    tagline: "Every team, training and match day.",
    intro:
      "Juniors to the first XI, indoor and out — Sneat Club keeps your teams, training, umpires and subs together so match day runs like clockwork.",
    handles: [
      { icon: "👥", title: "Members & registration", text: "Players, coaches, umpires and volunteers, with season registration." },
      { icon: "🏑", title: "Teams & squads", text: "Every team and its match-day squad, across all age grades." },
      { icon: "🗓️", title: "Training & fixtures", text: "Training and league fixtures on one calendar, with availability." },
      { icon: "🎽", title: "Kit & subs", text: "Kit sizes and membership subs, sorted before the season starts." },
    ],
    plugs: [
      { name: "RSVP.express", text: "match availability" },
      { name: "Sizeus", text: "kit sizes" },
      { name: "Debtus", text: "membership subs" },
    ],
  },
  {
    slug: "swimming",
    name: "Swimming clubs",
    short: "Swimming",
    emoji: "🏊",
    tagline: "Squads, sessions and galas.",
    intro:
      "From learn-to-swim to competitive squads — Sneat Club keeps your swimmers, session groups, gala entries and subs in one place, so coaches focus on the pool.",
    handles: [
      { icon: "👥", title: "Members & registration", text: "Swimmers, parents and coaches across every squad, with season registration." },
      { icon: "🏊", title: "Squads & sessions", text: "Organise squad groups and the weekly pool timetable, with attendance." },
      { icon: "🏅", title: "Galas & entries", text: "Track galas, entries and who's swimming what across the season." },
      { icon: "💶", title: "Pool fees & subs", text: "Membership, squad fees and pool-hire costs — tracked and collected." },
    ],
    plugs: [
      { name: "RSVP.express", text: "session attendance & gala entries" },
      { name: "Calendarius", text: "the pool timetable" },
      { name: "Debtus", text: "squad fees & subs" },
    ],
  },
];
