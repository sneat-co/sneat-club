// Self-contained Vitest setup for the Sneat Club extension library.
// Ionic and Stencil query browser APIs during component initialization while
// these unit tests run in jsdom.
/* eslint-disable @typescript-eslint/no-explicit-any */
// The Nx/Vite Angular pipeline may initialize TestBed before this file runs;
// keep initialization idempotent so forked Vitest workers do not fail with
// "Cannot set base providers because it has already been called".
import '@angular/compiler';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';

try {
  getTestBed().initTestEnvironment(
    BrowserTestingModule,
    platformBrowserTesting(),
    { errorOnUnknownElements: true, errorOnUnknownProperties: true },
  );
} catch {
  // Already initialized by the runner — fine.
}

if (typeof window !== 'undefined') {
  const OriginalURL = (window as any).URL;
  (window as any).URL = class extends OriginalURL {
    constructor(url: string, base?: string | URL) {
      try {
        super(url, base);
      } catch {
        try {
          super(url, 'http://localhost/');
        } catch {
          super(
            url.startsWith('/') ? `http://localhost${url}` : 'http://localhost/',
          );
        }
      }
    }
  };

  if ((window as any).document) {
    Object.defineProperty((window as any).document, 'baseURI', {
      get: () => 'http://localhost/',
      configurable: true,
    });
    if ((window as any).document.dir === undefined) {
      (window as any).document.dir = '';
    }
  }

  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }),
    });
  }

  if (!(window as any).CSSStyleSheet) {
    (window as any).CSSStyleSheet = class {
      replaceSync() {
        /* ignore */
      }
      replace() {
        return Promise.resolve();
      }
    };
  } else {
    (window as any).CSSStyleSheet.prototype.replaceSync = function () {
      /* ignore */
    };
    (window as any).CSSStyleSheet.prototype.replace = function () {
      return Promise.resolve();
    };
  }

  if (!(window as any).CSS) {
    (window as any).CSS = { supports: () => false };
  }
}
