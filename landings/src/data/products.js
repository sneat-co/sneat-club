// Canonical public URLs for the sister products Sneat Club links out to.
// Only products with a LIVE domain are listed — names not here render as plain
// text (no dead links). Verified live 2026-07-13.
// Not yet live (kept as plain text): MatchUps.center, Budgetus.
export const PRODUCTS = {
  "GameBoard.live": "https://gameboard.live",
  "Bookius": "https://book-online.app",
  "RSVP.express": "https://rsvp.express",
  "Sizeus": "https://sizechart.app",
  "Debtus": "https://debtus.app",
  "Remindius": "https://remindius.app",
  "Contactius": "https://contactius.app",
  "Calendarius": "https://calendarius.app",
  "Sneat.app": "https://sneat.app",
};

// Turn any known product names inside a trusted string into links (for set:html).
// Longest names first so e.g. no shorter name pre-empts a longer one.
export function linkifyProducts(text) {
  const names = Object.keys(PRODUCTS).sort((a, b) => b.length - a.length);
  let out = text;
  for (const name of names) {
    const link = `<a href="${PRODUCTS[name]}" target="_blank" rel="noopener">${name}</a>`;
    out = out.split(name).join(link);
  }
  return out;
}
