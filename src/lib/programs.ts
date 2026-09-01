import type { Database } from "@/integrations/supabase/types";

export type ProgramType = Database["public"]["Enums"]["program_type"];
export type EnrollmentStatus = Database["public"]["Enums"]["enrollment_status"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
export type AccessStatus = Database["public"]["Enums"]["access_status"];
export type PriceTier = Database["public"]["Enums"]["price_tier"];

export const PROGRAM_LABELS: Record<ProgramType, string> = {
  free_workshop: "Gratis-Workshop",
  bootcamp: "Bootcamp",
  cohort: "Kohorte",
  company: "Firmenticket",
};

export const STATUS_LABELS: Record<EnrollmentStatus, string> = {
  interested: "Interessent",
  registered: "Angemeldet",
  attended: "Teilgenommen",
  no_show: "No-show",
  completed: "Abgeschlossen",
  active: "Aktiv",
  paused: "Pausiert",
  cancelled: "Gekündigt",
};

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  none: "Keine",
  pending: "Offen",
  paid: "Bezahlt",
  refunded: "Erstattet",
  failed: "Fehlgeschlagen",
};

export const ACCESS_LABELS: Record<AccessStatus, string> = {
  none: "Kein Zugang",
  pending: "Vorgemerkt",
  granted: "Erteilt",
  revoked: "Entzogen",
};

export const PRICE_LABELS: Record<PriceTier, string> = {
  none: "Keine Kondition",
  foundation_490: "Foundation · 490 €",
  early_590: "Erste 50 · 590 €",
  standard_690: "Standard · 690 €",
  company_1_690: "Firma 1 Seat · 690 €",
  company_2_990: "Firma 2 Seats · 990 €",
  company_5_1900: "Firma 5 Seats · 1.900 €",
};

export const PRICE_AMOUNTS: Record<PriceTier, number> = {
  none: 0,
  foundation_490: 490,
  early_590: 590,
  standard_690: 690,
  company_1_690: 690,
  company_2_990: 990,
  company_5_1900: 1900,
};

export const PROGRAM_TYPES = Object.keys(PROGRAM_LABELS) as ProgramType[];
export const ENROLLMENT_STATUSES = Object.keys(STATUS_LABELS) as EnrollmentStatus[];
export const PAYMENT_STATUSES = Object.keys(PAYMENT_LABELS) as PaymentStatus[];
export const ACCESS_STATUSES = Object.keys(ACCESS_LABELS) as AccessStatus[];
export const PRICE_TIERS = Object.keys(PRICE_LABELS) as PriceTier[];

export function statusVariant(status: EnrollmentStatus): "default" | "secondary" | "outline" | "destructive" {
  if (status === "active" || status === "completed" || status === "attended") return "default";
  if (status === "cancelled" || status === "no_show") return "destructive";
  if (status === "paused" || status === "interested") return "outline";
  return "secondary";
}

export function formatEuro(amount: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}
