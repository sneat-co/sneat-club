import { appEnvironmentConfig } from '@sneat/app';
import { IEnvironmentConfig } from '@sneat/core';

// Single environment for template — fail-safe by construction. appEnvironmentConfig
// returns this production config on every deployed domain and the Firebase
// emulator config only on localhost (decided at runtime from the hostname). No
// environment.prod.ts / fileReplacements: a mis-built or mis-deployed bundle can
// never point real users at the emulator.
//
// Reuses the shared sneat production Firebase project (sneat-eur3-1) — template
// shares auth, spaces and Firestore with the rest of the sneat ecosystem.
export const sneatclubAppEnvironmentConfig: IEnvironmentConfig =
  appEnvironmentConfig({
    production: true,
    agents: {},
    firebaseConfig: {
      projectId: 'sneat-eur3-1',
      appId: '1:588648831063:web:303af7e0c5f8a7b10d6b12',
      apiKey: 'AIzaSyCeQu1WC182yD0VHrRm4nHUxVf27fY-MLQ',
      // Pinned to the product's own domain (the zone reverse-proxies the
      // /__/* subtree to sneat-eur3-1.firebaseapp.com), mirroring
      // noticeboard.cc. Same-origin auth avoids the third-party-storage
      // breakage a cross-origin authDomain (e.g. auth.sneat.co) triggers on
      // Safari/iOS — and pinning matters: the published @sneat/app defaults a
      // missing authDomain to location.hostname, while sneat-libs main now
      // defaults it to auth.sneat.co, so leaving it blank means a routine lib
      // bump silently changes the OAuth redirect_uri.
      //
      // Google sign-in REQUIRES https://sneat.club/__/auth/handler to be listed
      // in the OAuth client's authorized redirect URIs (Google Cloud console —
      // there is no API for this) and sneat.club in Firebase Auth's authorized
      // domains; missing entries surface as Error 400: redirect_uri_mismatch.
      authDomain: 'sneat.club',
      messagingSenderId: '588648831063',
      measurementId: 'G-TYBDTV738R',
    },
    // Full-page redirect sign-in is the robust default for a freshly-deployed
    // domain. BaseAppComponent completes it via getRedirectResult().
    signInMethod: 'redirect',
  });
