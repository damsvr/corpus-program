import { describe, expect, it } from "vitest";
import {
  appAccess,
  endOfBrusselsDay,
  firstChargeDuringFreePeriod,
  founderOfferOpen,
  freeAccessUntil,
  mapStripeStatus,
  normalizeSource,
  trialDays,
} from "@/lib/billing";

const until = endOfBrusselsDay("2027-01-03")!;
const athlete = { role: "ATHLETE" as const, accessLinkId: null, subscriptionStatus: "NONE" as const, stripeSubscriptionId: null };

describe("freeAccessUntil", () => {
  it("couvre le 3 janvier 2027 inclus, heure de Bruxelles", () => {
    expect(freeAccessUntil(undefined).toISOString()).toBe("2027-01-03T22:59:59.999Z");
    expect(freeAccessUntil("2027-02-01").toISOString()).toBe("2027-02-01T22:59:59.999Z");
    expect(freeAccessUntil("n'importe quoi").toISOString()).toBe("2027-01-03T22:59:59.999Z");
  });
});

describe("appAccess", () => {
  it("laisse tout le monde tester pendant l'accès libre", () => {
    expect(appAccess(athlete, new Date("2026-12-15T10:00:00Z"), until)).toBe("free-period");
    expect(appAccess(athlete, new Date("2027-01-03T22:00:00Z"), until)).toBe("free-period");
  });
  it("verrouille ensuite sans abonnement", () => {
    expect(appAccess(athlete, new Date("2027-01-04T07:00:00Z"), until)).toBe("locked");
    expect(appAccess({ ...athlete, subscriptionStatus: "CANCELED", stripeSubscriptionId: "sub_1" }, new Date("2027-02-01"), until)).toBe("locked");
  });
  it("ouvre aux abonnés, en essai et pendant les relances de paiement", () => {
    const after = new Date("2027-02-01");
    for (const s of ["ACTIVE", "TRIALING", "PAST_DUE"] as const) {
      expect(appAccess({ ...athlete, subscriptionStatus: s, stripeSubscriptionId: "sub_1" }, after, until)).toBe("subscribed");
    }
    // Statut par défaut TRIALING sans abonnement Stripe : pas d'accès.
    expect(appAccess({ ...athlete, subscriptionStatus: "TRIALING" }, after, until)).toBe("locked");
  });
  it("ne facture jamais le coach ni les inscrits d'un lien gratuit", () => {
    const after = new Date("2027-02-01");
    expect(appAccess({ ...athlete, role: "COACH" }, after, until)).toBe("exempt");
    expect(appAccess({ ...athlete, accessLinkId: "link" }, after, until)).toBe("exempt");
  });
});

describe("mapStripeStatus", () => {
  it("traduit les statuts Stripe", () => {
    expect(mapStripeStatus("active")).toBe("ACTIVE");
    expect(mapStripeStatus("trialing")).toBe("TRIALING");
    expect(mapStripeStatus("past_due")).toBe("PAST_DUE");
    expect(mapStripeStatus("canceled")).toBe("CANCELED");
    expect(mapStripeStatus("unpaid")).toBe("CANCELED");
    expect(mapStripeStatus("incomplete")).toBe("NONE");
  });
});

describe("founderOfferOpen", () => {
  const fUntil = endOfBrusselsDay("2027-01-31")!;
  it("ouvert jusqu'au 31 janvier et dans la limite des places", () => {
    expect(founderOfferOpen({ now: new Date("2027-01-10"), until: fUntil, seats: 30, taken: 29, priceId: "price_f" })).toBe(true);
    expect(founderOfferOpen({ now: new Date("2027-01-10"), until: fUntil, seats: 30, taken: 30, priceId: "price_f" })).toBe(false);
    expect(founderOfferOpen({ now: new Date("2027-02-01T00:00:00Z"), until: fUntil, seats: 30, taken: 0, priceId: "price_f" })).toBe(false);
    expect(founderOfferOpen({ now: new Date("2027-01-10"), until: fUntil, seats: 30, taken: 0, priceId: "" })).toBe(false);
  });
});

describe("trialDays", () => {
  it("pas d'essai pour qui a testé pendant l'accès libre ou déjà payé", () => {
    expect(trialDays({ createdAt: new Date("2026-12-01"), hadSubscription: false, until, days: 7 })).toBe(0);
    expect(trialDays({ createdAt: new Date("2027-01-10"), hadSubscription: true, until, days: 7 })).toBe(0);
    expect(trialDays({ createdAt: new Date("2027-01-10"), hadSubscription: false, until, days: 7 })).toBe(7);
    expect(trialDays({ createdAt: new Date("2027-01-10"), hadSubscription: false, until, days: 0 })).toBe(0);
  });
});

describe("normalizeSource", () => {
  it("regroupe les réseaux", () => {
    expect(normalizeSource("ig")).toBe("instagram");
    expect(normalizeSource("Instagram_bio")).toBe("instagram");
    expect(normalizeSource("tiktok")).toBe("tiktok");
    expect(normalizeSource("Box Liège!")).toBe("boxlige");
    expect(normalizeSource("")).toBeNull();
  });
});

describe("firstChargeDuringFreePeriod", () => {
  it("décale le premier prélèvement à la fin de l'accès libre", () => {
    expect(firstChargeDuringFreePeriod(new Date("2026-12-10"), until)).toBe(Math.ceil(until.getTime() / 1000));
    // à moins de 48 h de l'échéance (contrainte Stripe) ou après : prélèvement immédiat
    expect(firstChargeDuringFreePeriod(new Date("2027-01-02T12:00:00Z"), until)).toBeNull();
    expect(firstChargeDuringFreePeriod(new Date("2027-01-10"), until)).toBeNull();
  });
});
