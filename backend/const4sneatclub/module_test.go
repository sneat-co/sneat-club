package const4sneatclub

import (
	"testing"

	"github.com/sneat-co/sneat-go-core/coretypes"
	"github.com/sneat-co/sneat-go-core/extension"
)

func TestExtensionID(t *testing.T) {
	if ExtensionID != "sneatclub" {
		t.Errorf("ExtensionID = %q, want %q", ExtensionID, "sneatclub")
	}
}

// TestSpaceRegistrationProfile_ClubNotCompany guards the distinction that makes
// the space-type rule worth having.
//
// A club's participants — players, coaches and volunteers — are members;
// membership IS the relationship for them, so a club is `club`. A venue, a
// school and a community centre are `company`, because their staff are members
// and their public are customers. If this ever silently becomes `company`, the
// rule has collapsed into "everything is a company" and the type stops carrying
// information.
//
// Guardians are deliberately NOT in that list: per the founder ruling of
// 2026-09-02 they are linked contacts holding a Window, not members. That
// narrows the rationale without weakening it — see module.go.
func TestSpaceRegistrationProfile_ClubNotCompany(t *testing.T) {
	if got := SpaceRegistrationProfile.SpaceType; got != coretypes.SpaceTypeClub {
		t.Errorf("SpaceType = %q, want %q", got, coretypes.SpaceTypeClub)
	}
	if SpaceRegistrationProfile.SpaceType == coretypes.SpaceTypeCompany {
		t.Error("a club is not a company: its members are not customers")
	}
	if err := SpaceRegistrationProfile.Validate(); err != nil {
		t.Errorf("SpaceRegistrationProfile.Validate() = %v, want nil", err)
	}
}

func TestExtension_DeclaresSpaceProfile(t *testing.T) {
	extension.ResetSpaceProfilesForTest()
	t.Cleanup(extension.ResetSpaceProfilesForTest)

	ext := Extension()

	if got := string(ext.ID()); got != ExtensionID {
		t.Errorf("ext.ID() = %q, want %q", got, ExtensionID)
	}

	declared := ext.SpaceProfile()
	if declared == nil {
		t.Fatal("Extension() declares no space registration profile")
	}
	if declared.SpaceType != coretypes.SpaceTypeClub {
		t.Errorf("declared SpaceType = %q, want %q", declared.SpaceType, coretypes.SpaceTypeClub)
	}

	fromRegistry, ok := extension.LookupSpaceProfile(ext.ID())
	if !ok {
		t.Fatal("the platform registry has no profile for sneatclub")
	}
	if fromRegistry.SlugNamespace != SlugNamespace {
		t.Errorf("registry SlugNamespace = %q, want %q", fromRegistry.SlugNamespace, SlugNamespace)
	}
}

func TestExtension_KnownHosts(t *testing.T) {
	hosts := Extension().KnownHosts()
	want := map[string]bool{"sneat.club": true, "www.sneat.club": true}
	if len(hosts) != len(want) {
		t.Fatalf("KnownHosts() = %v, want %d hosts", hosts, len(want))
	}
	for _, h := range hosts {
		if !want[h] {
			t.Errorf("unexpected known host %q", h)
		}
	}
}
