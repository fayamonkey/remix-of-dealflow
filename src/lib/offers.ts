/**
 * B2B-Angebotskatalog (Golem × Dirk).
 * Die Pipeline bildet ausschließlich den Firmen-Anfrageweg ab —
 * Einzelteilnehmer laufen über Programme, Teilnahmen und Verträge.
 */
export type OfferType =
  | "strategy_consulting"
  | "custom_workshop"
  | "ai_company_day"
  | "company_seats"
  | "other";

interface OfferMeta {
  label: string;
  /** Preis pro Platz bzw. pro Monat; 0 = individuell */
  unitAmount: number;
  /** true = monatlich wiederkehrend (Firmenplätze) */
  recurring: boolean;
  /** Standard-Platzanzahl */
  defaultSeats: number;
  hint: string;
}

export const OFFERS: Record<OfferType, OfferMeta> = {
  ai_company_day: {
    label: "KI-Firma-Workshop (1 Tag)",
    unitAmount: 2300,
    recurring: false,
    defaultSeats: 1,
    hint: "2.300 € pro Platz, maximal 12 Plätze",
  },
  company_seats: {
    label: "Firmenplätze „Dein KI-Team“",
    unitAmount: 690,
    recurring: true,
    defaultSeats: 1,
    hint: "1 Seat 690 € · 2 Seats 990 € · 5 Seats 1.900 € pro Monat",
  },
  custom_workshop: {
    label: "Maßgeschneiderter Workshop",
    unitAmount: 0,
    recurring: false,
    defaultSeats: 1,
    hint: "Individuelles Angebot",
  },
  strategy_consulting: {
    label: "KI-Strategieberatung",
    unitAmount: 0,
    recurring: false,
    defaultSeats: 1,
    hint: "Individuelles Angebot",
  },
  other: {
    label: "Sonstiges",
    unitAmount: 0,
    recurring: false,
    defaultSeats: 1,
    hint: "Frei kalkuliert",
  },
};

export const OFFER_TYPES = Object.keys(OFFERS) as OfferType[];

/** Staffelpreise für Firmenpakete laut DNA. */
const COMPANY_PACKAGE_PRICES: Record<number, number> = { 1: 690, 2: 990, 5: 1900 };

/** Vorschlagswert für einen Deal. 0 heißt: bitte manuell eintragen. */
export function suggestedAmount(type: OfferType, seats: number): number {
  const meta = OFFERS[type];
  if (!meta) return 0;
  if (type === "company_seats") {
    const exact = COMPANY_PACKAGE_PRICES[seats];
    if (exact) return exact;
    // Zwischengrößen: nächstkleineres Paket + 690 € je Zusatzplatz
    const base = seats >= 5 ? 1900 : seats >= 2 ? 990 : 690;
    const included = seats >= 5 ? 5 : seats >= 2 ? 2 : 1;
    return base + Math.max(0, seats - included) * 690;
  }
  return meta.unitAmount * Math.max(1, seats);
}

export function offerLabel(type: string | null | undefined): string | null {
  if (!type) return null;
  return OFFERS[type as OfferType]?.label ?? null;
}
