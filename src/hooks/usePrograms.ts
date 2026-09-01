import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  AttendanceStatus, ProgramCategory, RunStatus, SessionType,
} from "@/lib/programs";

export interface ProgramTemplate {
  id: string;
  program_key: string;
  name: string;
  category: ProgramCategory;
  description: string | null;
  default_duration_days: number | null;
  default_sessions: number;
  default_capacity: number | null;
  partner: string | null;
  active: boolean;
  prerequisites: string | null;
}

export interface ProgramRun {
  id: string;
  template_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  timezone: string;
  status: RunStatus;
  max_seats: number | null;
  partner: string | null;
  campaign: string | null;
  lead_trainer: string | null;
  meeting_url: string | null;
  recording_url: string | null;
  community_area: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  program_templates?: { id: string; name: string; category: ProgramCategory } | null;
}

export interface ProgramSession {
  id: string;
  run_id: string;
  session_type: SessionType;
  title: string;
  position: number;
  starts_at: string | null;
  ends_at: string | null;
  meeting_url: string | null;
  recording_url: string | null;
  materials_url: string | null;
  status: RunStatus;
}

export interface Attendance {
  id: string;
  session_id: string;
  enrollment_id: string | null;
  contact_id: string;
  status: AttendanceStatus;
  note: string | null;
  contacts?: { first_name: string; last_name: string; email: string | null } | null;
}

export function useProgramTemplates() {
  return useQuery({
    queryKey: ["program-templates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("program_templates").select("*").order("name");
      if (error) throw error;
      return (data as unknown as ProgramTemplate[]) ?? [];
    },
  });
}

export function useUpsertTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<ProgramTemplate> & { program_key: string; name: string; category: ProgramCategory }) => {
      const { data, error } = await supabase
        .from("program_templates")
        .upsert(payload as never, { onConflict: "program_key" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["program-templates"] }),
  });
}

export function useProgramRuns(templateId?: string) {
  return useQuery({
    queryKey: ["program-runs", templateId ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("program_runs")
        .select("*, program_templates(id, name, category)")
        .order("start_date", { ascending: false, nullsFirst: false });
      if (templateId) q = q.eq("template_id", templateId);
      const { data, error } = await q;
      if (error) throw error;
      return (data as unknown as ProgramRun[]) ?? [];
    },
  });
}

export function useCreateRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<ProgramRun> & { template_id: string; name: string; created_by: string }) => {
      const { data, error } = await supabase.from("program_runs").insert(payload as never).select().single();
      if (error) throw error;
      return data as unknown as ProgramRun;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["program-runs"] }),
  });
}

export function useUpdateRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ProgramRun>) => {
      const { error } = await supabase.from("program_runs").update(updates as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["program-runs"] }),
  });
}

export function useDeleteRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("program_runs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["program-runs"] }),
  });
}

export function useSessions(runId?: string) {
  return useQuery({
    queryKey: ["program-sessions", runId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("program_sessions")
        .select("*")
        .eq("run_id", runId!)
        .order("position");
      if (error) throw error;
      return (data as unknown as ProgramSession[]) ?? [];
    },
    enabled: !!runId,
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<ProgramSession> & { run_id: string; title: string }) => {
      const { error } = await supabase.from("program_sessions").insert(payload as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["program-sessions"] }),
  });
}

export function useUpdateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ProgramSession>) => {
      const { error } = await supabase.from("program_sessions").update(updates as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["program-sessions"] }),
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("program_sessions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["program-sessions"] }),
  });
}

export function useAttendance(sessionId?: string) {
  return useQuery({
    queryKey: ["attendance", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_attendance")
        .select("*, contacts(first_name, last_name, email)")
        .eq("session_id", sessionId!);
      if (error) throw error;
      return (data as unknown as Attendance[]) ?? [];
    },
    enabled: !!sessionId,
  });
}

/** Meldet alle Teilnahmen eines Durchlaufs für einen Termin an (idempotent). */
export function useSyncAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, runId }: { sessionId: string; runId: string }) => {
      const { data: enrollments, error } = await supabase
        .from("enrollments")
        .select("id, contact_id")
        .eq("program_run_id", runId);
      if (error) throw error;
      if (!enrollments?.length) return 0;
      const rows = enrollments.map((e) => ({
        session_id: sessionId,
        enrollment_id: e.id,
        contact_id: e.contact_id,
      }));
      const { error: upErr } = await supabase
        .from("session_attendance")
        .upsert(rows as never, { onConflict: "session_id,contact_id", ignoreDuplicates: true });
      if (upErr) throw upErr;
      return rows.length;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useSetAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AttendanceStatus }) => {
      const { error } = await supabase.from("session_attendance").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useRunEnrollmentCounts() {
  return useQuery({
    queryKey: ["run-enrollment-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("enrollments").select("program_run_id");
      if (error) throw error;
      const map: Record<string, number> = {};
      (data ?? []).forEach((r: { program_run_id: string | null }) => {
        if (r.program_run_id) map[r.program_run_id] = (map[r.program_run_id] ?? 0) + 1;
      });
      return map;
    },
  });
}
