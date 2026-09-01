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
  workshop_standalone_2300: "KI-Firma Workshop standalone · 2.300 €",
};

export const PRICE_AMOUNTS: Record<PriceTier, number> = {
  none: 0,
  foundation_490: 490,
  early_590: 590,
  standard_690: 690,
  company_1_690: 690,
  company_2_990: 990,
  company_5_1900: 1900,
  workshop_standalone_2300: 2300,
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

// ---------- Programmstruktur (Vorlagen, Durchläufe, Termine) ----------
export type ProgramCategory = Database["public"]["Enums"]["program_category"];
export type RunStatus = Database["public"]["Enums"]["run_status"];
export type SessionType = Database["public"]["Enums"]["session_type"];
export type AttendanceStatus = Database["public"]["Enums"]["attendance_status"];
export type GrantStatus = Database["public"]["Enums"]["grant_status"];
export type SubscriptionStatus = Database["public"]["Enums"]["subscription_status"];
export type AccessState = Database["public"]["Enums"]["access_state"];
export type SeatStatus = Database["public"]["Enums"]["seat_status"];
export type IssueStatus = Database["public"]["Enums"]["issue_status"];

export const CATEGORY_LABELS: Record<ProgramCategory, string> = {
  free_workshop: "Gratis-Workshop",
  bootcamp: "Bootcamp",
  cohort: "Kohorte",
  corporate_workshop: "Firmen-Workshop",
  consulting: "Beratung",
};

export const RUN_STATUS_LABELS: Record<RunStatus, string> = {
  draft: "Entwurf",
  published: "Veröffentlicht",
  registration_open: "Anmeldung offen",
  running: "Läuft",
  completed: "Abgeschlossen",
  cancelled: "Abgesagt",
};

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  live: "Live-Termin",
  catch_up: "Catch-up",
  onboarding: "Onboarding",
  recorded: "Aufzeichnung",
  other: "Sonstiges",
};

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  registered: "Angemeldet",
  attended: "Teilgenommen",
  partial: "Teilweise",
  no_show: "Nicht erschienen",
  excused: "Entschuldigt",
};

export const GRANT_STATUS_LABELS: Record<GrantStatus, string> = {
  active: "Gültig",
  expired: "Verfallen",
  revoked: "Widerrufen",
};

export const SUBSCRIPTION_LABELS: Record<SubscriptionStatus, string> = {
  waitlist: "Warteliste",
  invited: "Eingeladen",
  payment_pending: "Zahlung offen",
  onboarding_required: "Onboarding nötig",
  onboarding_active: "Onboarding läuft",
  active: "Aktiv",
  past_due: "Überfällig",
  cancellation_scheduled: "Kündigung geplant",
  cancelled: "Gekündigt",
  alumni: "Alumni",
};

export const ACCESS_STATE_LABELS: Record<AccessState, string> = {
  not_required: "Nicht nötig",
  pending: "Offen",
  granted: "Erteilt",
  sync_error: "Fehler",
  suspended: "Gesperrt",
  revoked: "Entzogen",
};

export const SEAT_STATUS_LABELS: Record<SeatStatus, string> = {
  assigned: "Zugewiesen",
  invited: "Eingeladen",
  active: "Aktiv",
  released: "Freigegeben",
};

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  open: "Offen",
  acknowledged: "In Klärung",
  resolved: "Erledigt",
  ignored: "Ignoriert",
};

export const ACCESS_AREAS = ["community", "recording", "cohort", "bootcamp"] as const;
export const ACCESS_AREA_LABELS: Record<string, string> = {
  community: "Community",
  recording: "Aufzeichnungen",
  cohort: "Kohorte",
  bootcamp: "Bootcamp",
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProgramCategory[];
export const RUN_STATUSES = Object.keys(RUN_STATUS_LABELS) as RunStatus[];
export const SESSION_TYPES = Object.keys(SESSION_TYPE_LABELS) as SessionType[];
export const ATTENDANCE_STATUSES = Object.keys(ATTENDANCE_LABELS) as AttendanceStatus[];
export const SUBSCRIPTION_STATUSES = Object.keys(SUBSCRIPTION_LABELS) as SubscriptionStatus[];
export const ACCESS_STATES = Object.keys(ACCESS_STATE_LABELS) as AccessState[];

export function runStatusVariant(status: RunStatus): "default" | "secondary" | "outline" | "destructive" {
  if (status === "running" || status === "registration_open") return "default";
  if (status === "cancelled") return "destructive";
  if (status === "draft") return "outline";
  return "secondary";
}

export function subscriptionVariant(status: SubscriptionStatus): "default" | "secondary" | "outline" | "destructive" {
  if (status === "active") return "default";
  if (status === "past_due" || status === "cancelled") return "destructive";
  if (status === "cancellation_scheduled" || status === "waitlist") return "outline";
  return "secondary";
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
