import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AccessStatus, EnrollmentStatus, PaymentStatus, PriceTier, ProgramType } from "@/lib/programs";

export interface Enrollment {
  id: string;
  contact_id: string;
  company_id: string | null;
  program_type: ProgramType;
  status: EnrollmentStatus;
  funnel_source: string | null;
  golem_campaign: string | null;
  workshop_date: string | null;
  payment_status: PaymentStatus;
  access_status: AccessStatus;
  price_tier: PriceTier;
  monthly_amount: number;
  seats: number;
  start_date: string | null;
  cancel_date: string | null;
  next_step: string | null;
  notes: string | null;
  external_ref: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  contacts?: { id: string; first_name: string; last_name: string; email: string | null } | null;
  companies?: { id: string; name: string } | null;
}

export interface EnrollmentStep {
  id: string;
  enrollment_id: string;
  name: string;
  position: number;
  due_date: string | null;
  done: boolean;
  done_at: string | null;
}

export interface MemberEvent {
  id: string;
  contact_id: string;
  enrollment_id: string | null;
  event_type: string;
  title: string;
  description: string | null;
  occurred_at: string;
}

export interface EnrollmentFilters {
  programType?: ProgramType | "all";
  status?: EnrollmentStatus | "all";
  contactId?: string;
  search?: string;
}

export function useEnrollments(filters: EnrollmentFilters = {}) {
  return useQuery({
    queryKey: ["enrollments", filters],
    queryFn: async () => {
      let query = supabase
        .from("enrollments")
        .select("*, contacts(id, first_name, last_name, email), companies(id, name)")
        .order("created_at", { ascending: false });

      if (filters.programType && filters.programType !== "all") query = query.eq("program_type", filters.programType);
      if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
      if (filters.contactId) query = query.eq("contact_id", filters.contactId);

      const { data, error } = await query;
      if (error) throw error;
      let rows = (data as unknown as Enrollment[]) ?? [];
      if (filters.search) {
        const q = filters.search.toLowerCase();
        rows = rows.filter((e) =>
          `${e.contacts?.first_name ?? ""} ${e.contacts?.last_name ?? ""} ${e.contacts?.email ?? ""} ${e.golem_campaign ?? ""} ${e.funnel_source ?? ""}`
            .toLowerCase()
            .includes(q)
        );
      }
      return rows;
    },
  });
}

export function useCreateEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Enrollment> & { contact_id: string; program_type: ProgramType; created_by: string }) => {
      const { data, error } = await supabase.from("enrollments").insert(payload as never).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enrollments"] });
      qc.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useUpdateEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Enrollment>) => {
      const { data, error } = await supabase.from("enrollments").update(updates as never).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enrollments"] });
      qc.invalidateQueries({ queryKey: ["member-events"] });
      qc.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useDeleteEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("enrollments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["enrollments"] }),
  });
}

export function useEnrollmentSteps(enrollmentId?: string) {
  return useQuery({
    queryKey: ["enrollment-steps", enrollmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollment_steps")
        .select("*")
        .eq("enrollment_id", enrollmentId!)
        .order("position");
      if (error) throw error;
      return (data as unknown as EnrollmentStep[]) ?? [];
    },
    enabled: !!enrollmentId,
  });
}

export function useToggleStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const { error } = await supabase
        .from("enrollment_steps")
        .update({ done, done_at: done ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["enrollment-steps"] }),
  });
}

export function useMemberEvents(contactId?: string) {
  return useQuery({
    queryKey: ["member-events", contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("member_events")
        .select("*")
        .eq("contact_id", contactId!)
        .order("occurred_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data as unknown as MemberEvent[]) ?? [];
    },
    enabled: !!contactId,
  });
}

export function useOpenSteps() {
  return useQuery({
    queryKey: ["open-steps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollment_steps")
        .select("*, enrollments(id, program_type, contact_id, contacts(first_name, last_name))")
        .eq("done", false)
        .not("due_date", "is", null)
        .lte("due_date", new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10))
        .order("due_date")
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
}
