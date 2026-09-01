import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AccessState, GrantStatus, PriceTier, SeatStatus, SubscriptionStatus } from "@/lib/programs";

export interface Subscription {
  id: string;
  contact_id: string | null;
  company_id: string | null;
  package_id: string | null;
  enrollment_id: string | null;
  status: SubscriptionStatus;
  price_tier: PriceTier;
  monthly_amount: number;
  currency: string;
  tax_included: boolean;
  tax_rate: number;
  billing_interval: string;
  start_date: string | null;
  cancel_requested_at: string | null;
  end_date: string | null;
  cancel_reason: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  contacts?: { id: string; first_name: string; last_name: string; email: string | null } | null;
  companies?: { id: string; name: string } | null;
}

export interface PriceGrant {
  id: string;
  contact_id: string;
  tier: PriceTier;
  monthly_amount: number;
  reason: string;
  status: GrantStatus;
  is_manual_override: boolean;
  granted_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  revoked_reason: string | null;
}

export interface CompanyPackage {
  id: string;
  company_id: string;
  tier: PriceTier;
  seats: number;
  monthly_amount: number;
  currency: string;
  status: SubscriptionStatus;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_by: string;
  companies?: { id: string; name: string } | null;
  package_seats?: PackageSeat[];
}

export interface PackageSeat {
  id: string;
  package_id: string;
  contact_id: string | null;
  status: SeatStatus;
  assigned_at: string;
  released_at: string | null;
  contacts?: { id: string; first_name: string; last_name: string } | null;
}

export interface AccessGrant {
  id: string;
  contact_id: string;
  area: string;
  status: AccessState;
  granted_at: string | null;
  revoked_at: string | null;
  last_error: string | null;
  note: string | null;
}

export interface Consent {
  id: string;
  contact_id: string;
  kind: string;
  granted: boolean;
  version: string | null;
  source: string | null;
  granted_at: string | null;
  withdrawn_at: string | null;
}

export function useSubscriptions(contactId?: string) {
  return useQuery({
    queryKey: ["subscriptions", contactId ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("subscriptions")
        .select("*, contacts(id, first_name, last_name, email), companies(id, name)")
        .order("created_at", { ascending: false });
      if (contactId) q = q.eq("contact_id", contactId);
      const { data, error } = await q;
      if (error) throw error;
      return (data as unknown as Subscription[]) ?? [];
    },
  });
}

export function useCreateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Subscription> & { created_by: string }) => {
      const { data, error } = await supabase.from("subscriptions").insert(payload as never).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscriptions"] }),
  });
}

export function useUpdateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Subscription>) => {
      const { error } = await supabase.from("subscriptions").update(updates as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscriptions"] });
      qc.invalidateQueries({ queryKey: ["price-grants"] });
    },
  });
}

export function usePriceGrants(contactId?: string) {
  return useQuery({
    queryKey: ["price-grants", contactId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("price_grants").select("*").order("granted_at", { ascending: false });
      if (contactId) q = q.eq("contact_id", contactId);
      const { data, error } = await q;
      if (error) throw error;
      return (data as unknown as PriceGrant[]) ?? [];
    },
  });
}

export function useCreatePriceGrant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { contact_id: string; tier: PriceTier; reason: string; is_manual_override?: boolean; expires_at?: string | null; created_by: string }) => {
      const { error } = await supabase.from("price_grants").insert(payload as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["price-grants"] }),
  });
}

export function useRevokePriceGrant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase
        .from("price_grants")
        .update({ status: "revoked", revoked_at: new Date().toISOString(), revoked_reason: reason })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["price-grants"] }),
  });
}

export function useCompanyPackages() {
  return useQuery({
    queryKey: ["company-packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_packages")
        .select("*, companies(id, name), package_seats(*, contacts(id, first_name, last_name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as CompanyPackage[]) ?? [];
    },
  });
}

export function useCreatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<CompanyPackage> & { company_id: string; tier: PriceTier; seats: number; created_by: string }) => {
      const { error } = await supabase.from("company_packages").insert(payload as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["company-packages"] }),
  });
}

export function useAssignSeat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ package_id, contact_id }: { package_id: string; contact_id: string }) => {
      const { error } = await supabase.from("package_seats").insert({ package_id, contact_id } as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["company-packages"] }),
  });
}

export function useReleaseSeat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("package_seats")
        .update({ status: "released", released_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["company-packages"] }),
  });
}

export function useAccessGrants(contactId?: string) {
  return useQuery({
    queryKey: ["access-grants", contactId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("access_grants").select("*").order("area");
      if (contactId) q = q.eq("contact_id", contactId);
      const { data, error } = await q;
      if (error) throw error;
      return (data as unknown as AccessGrant[]) ?? [];
    },
  });
}

export function useSetAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ contact_id, area, status }: { contact_id: string; area: string; status: AccessState }) => {
      const { error } = await supabase.from("access_grants").upsert(
        {
          contact_id,
          area,
          status,
          granted_at: status === "granted" ? new Date().toISOString() : null,
          revoked_at: status === "revoked" ? new Date().toISOString() : null,
        } as never,
        { onConflict: "contact_id,area" },
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["access-grants"] }),
  });
}

export function useConsents(contactId?: string) {
  return useQuery({
    queryKey: ["consents", contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consents")
        .select("*")
        .eq("contact_id", contactId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as Consent[]) ?? [];
    },
    enabled: !!contactId,
  });
}

export function useRecordConsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { contact_id: string; kind: string; granted: boolean; version?: string; source?: string }) => {
      const { error } = await supabase.from("consents").insert({
        ...payload,
        granted_at: payload.granted ? new Date().toISOString() : null,
        withdrawn_at: payload.granted ? null : new Date().toISOString(),
      } as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["consents"] }),
  });
}
