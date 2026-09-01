import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { IssueStatus } from "@/lib/programs";

export interface OpsIssue {
  id: string;
  kind: string;
  severity: string;
  title: string;
  details: string | null;
  contact_id: string | null;
  company_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  status: IssueStatus;
  detected_at: string;
  resolved_at: string | null;
  contacts?: { id: string; first_name: string; last_name: string; email: string | null } | null;
  companies?: { id: string; name: string } | null;
}

export function useOpsIssues(status: IssueStatus | "all" = "open") {
  return useQuery({
    queryKey: ["ops-issues", status],
    queryFn: async () => {
      let q = supabase
        .from("ops_issues")
        .select("*, contacts(id, first_name, last_name, email), companies(id, name)")
        .order("detected_at", { ascending: false })
        .limit(200);
      if (status !== "all") q = q.eq("status", status);
      const { data, error } = await q;
      if (error) throw error;
      return (data as unknown as OpsIssue[]) ?? [];
    },
  });
}

export function useDetectIssues() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("detect_ops_issues");
      if (error) throw error;
      return data as number;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ops-issues"] }),
  });
}

export function useUpdateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: IssueStatus }) => {
      const { error } = await supabase
        .from("ops_issues")
        .update({
          status,
          resolved_at: status === "resolved" || status === "ignored" ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ops-issues"] }),
  });
}
