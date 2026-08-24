import { Injectable } from '@angular/core';

/**
 * Client for the platform checkout (paymentus subscriptions, mounted by
 * sneat-go at /v0/checkout). Mirrors gametable/web's client: the catalogue is
 * server-side — this only asks what this storefront may sell and opens
 * sessions for it.
 */
export const CHECKOUT_SITE = 'sneatclub';

const CHECKOUT_BASE_URL = 'https://api.sneat.cloud/v0/checkout';

export interface CheckoutPlanFacts {
  id: string;
  label: string;
  /** US cents — display only; the Stripe price is authoritative. */
  amount: number;
  currency: string;
  interval: 'month' | 'year';
}

export interface CheckoutConfig {
  publishableKey: string;
  site: string;
  mode: 'test' | 'live';
  plans: CheckoutPlanFacts[];
}

export interface CheckoutSession {
  clientSecret: string;
  sessionId: string;
  mode: 'test' | 'live';
}

export interface CheckoutSessionStatus {
  status: string;
  customerEmail?: string | null;
  plan?: string | null;
  mode: 'test' | 'live';
}

async function describeFailure(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { code?: string; message?: string };
    return body.message || body.code || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  /** The storefront's publishable key and the plans it may sell. */
  public async fetchConfig(): Promise<CheckoutConfig> {
    const response = await fetch(`${CHECKOUT_BASE_URL}/config?site=${CHECKOUT_SITE}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(await describeFailure(response));
    }
    return (await response.json()) as CheckoutConfig;
  }

  /**
   * Open an embedded Stripe Checkout session. spaceID names the club being
   * paid for — an entitlement is keyed by the buyer's email, which does not
   * identify WHICH of their spaces was bought for; the provisioner reads it
   * back off the entitlement.
   */
  public async createSession(plan: string, spaceID: string): Promise<CheckoutSession> {
    const response = await fetch(`${CHECKOUT_BASE_URL}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ site: CHECKOUT_SITE, plan, spaceId: spaceID }),
    });
    if (!response.ok) {
      throw new Error(await describeFailure(response));
    }
    return (await response.json()) as CheckoutSession;
  }

  /** What became of a session, once Stripe has returned the payer to us. */
  public async sessionStatus(sessionId: string, mode?: string): Promise<CheckoutSessionStatus> {
    const query = new URLSearchParams({ site: CHECKOUT_SITE, session_id: sessionId });
    if (mode) {
      query.set('mode', mode);
    }
    const response = await fetch(`${CHECKOUT_BASE_URL}/session-status?${query.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(await describeFailure(response));
    }
    return (await response.json()) as CheckoutSessionStatus;
  }
}
