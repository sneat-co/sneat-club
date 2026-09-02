// Package const4sneatclub holds the canonical identifiers for the Sneat Club
// extension (sports clubs): its extension id, its space registration profile,
// and the public hosts whose origins the API server must trust for CORS.
package const4sneatclub

import (
	"github.com/sneat-co/sneat-go-core/coretypes"
	"github.com/sneat-co/sneat-go-core/extension"
)

// ExtensionID is this extension's canonical id — the value recorded in
// SpaceDbo.Modules, used as the space-module key under /spaces/{id}/ext/.
const ExtensionID = "sneatclub"

// SlugNamespace is the slugs namespace Sneat Club claims public club URLs in,
// e.g. sneat.club/c/limerick-celtics.
const SlugNamespace = "sneatclub:space"

// SpaceRegistrationProfile declares what registering a sports club means.
//
// A club registers as a `club` Space, NOT a `company` — and it is the case that
// shows the space-type rule discriminating rather than collapsing. A club's
// *participants* — players, coaches and volunteers — are *members*: membership
// is the relationship. A venue, a school and a community centre are `company`
// Spaces because their staff are members and their public are customers.
//
// GUARDIANS ARE NOT MEMBERS (founder ruling, 2026-09-02). A guardian is a
// club-side linked contact carrying the `guardian` role and holding a Window
// over their child — never a Space member, because `member` puts their uid in
// space.userIDs and the deployed Firestore rules then grant read of the WHOLE
// club subtree. A guardian's relationship is not to the club; it is to their
// child, who belongs to the club. See backstage /WINDOW-MODEL.md (ADR 0022).
//
// A DUAL-ROLE PERSON IS NOT CONSTRAINED BY THEIR WINDOW, and it would be wrong
// to imply otherwise. A parent who also coaches IS a member, so their uid is in
// space.userIDs and gate G1 gives them direct client read of the whole club
// subtree — every other child included. Their guardian Window adds nothing for
// them and constrains nothing: the member half swallows it. This is the same
// case WINDOW-MODEL section 5 explicitly concedes it cannot handle for a
// teacher who is also a parent, and a window does not narrow a member anywhere.
//
// The club accepts that consequence today: someone trusted enough to coach is
// trusted with the roster. What must not happen is anyone reading the guardian
// role as a limit on a person who is also staff or a participant.
//
// RATIFIABLE, not settled: the founder ruled on where guardians sit, not on
// dual-role people. If clubs later need a coach's view narrowed to their own
// squad, that needs the same missing mechanism the platform doc prices for
// teacher scoping — not a Window.
//
// A club that starts collecting subscriptions does not become a company. It
// gains a payments capability alongside this extension's marker in
// SpaceDbo.Modules — which is why the marker, not the type, is what says what a
// Space is for. See sneat-specs decision 0006.
var SpaceRegistrationProfile = extension.SpaceRegistrationProfile{
	SpaceType:     coretypes.SpaceTypeClub,
	SlugNamespace: SlugNamespace,
}

// KnownHosts are the public hosts Sneat Club serves from; their origins must be
// trusted for CORS by the API server.
var KnownHosts = []string{
	"sneat.club",
	"www.sneat.club",
}

// Extension returns the Sneat Club extension configuration for the host
// (sneat-go) to register: the extension id, what registering a club creates,
// and the hosts whose origins the API must trust.
func Extension() extension.Config {
	return extension.NewExtension(
		ExtensionID,
		extension.RegisterKnownHosts(KnownHosts...),
		extension.RegisterSpaceProfile(SpaceRegistrationProfile),
	)
}
