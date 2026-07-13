# sneat-club

**Sneat Club** — *the operating home for your sports club.* The club & team
management layer of the [Sneat](https://github.com/sneat-co) ecosystem's Sports
vertical: clubs, teams, seasons, rosters, memberships, registration,
communication, attendance and schedules — for community sports organisations
(youth clubs, GAA parishes, five-a-side leagues, squads).

Sneat Club is a **curate-not-own hub** over the Sneat graph: a club *is* a
`spaceus` Space (`SpaceTypeClub`), a team a sub-space, and players / guardians /
coaches / volunteers are `contactus` contacts wired by `linkage` edges. It owns
the durable club org-spine and **integrates** the specialist engines rather than
rebuilding them — live scoring via [GameBoard.live](https://gameboard.live),
competitions via [MatchUps.center](https://matchups.center), facility bookings
via Bookius, attendance via RSVP.express, money via Debtus/Budgetus, reminders
via Remindius, and player kit sizing via Sizeus.

Product vision and the SpecScore Idea + Features live in
[`backstage`](https://github.com/sneat-co/backstage): `spec/ideas/sneat-club.md`
and `spec/features/sports/sneat-team/**` (the management-layer Feature, branded
Sneat Club). The standalone Sports-vertical brand **Sportius** is parked; the
vertical lands on `sneat.co/sport/`.

## Branding

- **Name (prose, titles, docs):** **Sneat Club** — two words, per the Sneat
  suffix rule (sibling of Sneat Team @ sneat.team). Never "Sneat.Club".
- **Domain / address:** `sneat.club` — always lowercase; it is the address, not a
  TLD-as-name wordmark (that styling is reserved for the parked Sportius brand).
- **Wordmark:** "Sneat **Club**" with *Club* in the pitch-green accent.

## Live site & deployment

**sneat.club is live** — an Astro marketing landing plus a draft, in-browser
**app preview** at `/app`, served by one Cloudflare Worker (`sneat-club`) with
`sneat.club` attached as a Custom Domain.

```sh
cd landings
pnpm install
pnpm dev       # local dev server
pnpm build     # static build -> landings/dist
pnpm preview   # preview the static build
```

### Deploy

`landings/wrangler.jsonc` declares the worker (`sneat-club`) and attaches
`sneat.club` as a Cloudflare **Custom Domain**. From `landings/`:

```sh
CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=… pnpm exec wrangler deploy
```

Attaching the custom domain needs a token with `Zone:DNS:Edit` on the
`sneat.club` zone. `www` → apex is handled by a zone-level Redirect Rule (the
worker owns the apex only).

## `landings/` — the site (sneat.club)

A static **Astro** site following the Sneat **site-hosting-pattern**: a fast,
crawlable landing owns the root (`/`), `/privacy` holds the early privacy page,
and **`/app` is a draft in-browser prototype** of the Sneat Club app — create a
club, add teams, and build a season roster (Club → Teams → Roster). It is a
local-only preview (localStorage, no account, no server) that demonstrates the
core domain model; the real app signs users in and runs on the shared Sneat
graph.

## Status

Draft / early access. The landing and app preview are the first shipped
surfaces; the full app (registration, memberships, communication, attendance,
and the plugged-in engines) follows the roadmap in `backstage`.
