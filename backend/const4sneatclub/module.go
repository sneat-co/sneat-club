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
// players, guardians, coaches and volunteers are *members*: membership is the
// relationship. A venue, a school and a community centre are `company` Spaces
// because their staff are members and their public are customers.
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
