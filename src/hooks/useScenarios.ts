import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SavedScenario {
  id: string;
  name: string;
  description: string | null;
  rows: unknown;
  months: number;
  created_at: string;
  updated_at: string;
}

export function useScenarios() {
  return useQuery({
    queryKey: ["forecast-scenarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forecast_scenarios")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SavedScenario[];
    },
  });
}

export function useSaveScenario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id?: string; name: string; description?: string | null; rows: unknown; months: number }) => {
      if (input.id) {
        const { error } = await supabase
          .from("forecast_scenarios")
          .update({ name: input.name, description: input.description ?? null, rows: input.rows as never, months: input.months })
          .eq("id", input.id);
        if (error) throw error;
        return input.id;
      }
      const { data, error } = await supabase
        .from("forecast_scenarios")
        .insert({ name: input.name, description: input.description ?? null, rows: input.rows as never, months: input.months })
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["forecast-scenarios"] });
      toast.success("Szenario gespeichert");
    },
    onError: () => toast.error("Szenario konnte nicht gespeichert werden"),
  });
}

export function useDeleteScenario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("forecast_scenarios").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["forecast-scenarios"] });
      toast.success("Szenario gelöscht");
    },
    onError: () => toast.error("Szenario konnte nicht gelöscht werden"),
  });
}
