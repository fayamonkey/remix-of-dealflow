import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PRICE_AMOUNTS, type PriceTier } from "@/lib/programs";

export type PriceMap = Record<PriceTier, number>;

/** Zentrale Preisliste aus app_settings.pricing — Fallback sind die Standardwerte. */
export function usePricing() {
  return useQuery({
    queryKey: ["pricing"],
    queryFn: async (): Promise<PriceMap> => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "pricing")
        .maybeSingle();
      if (error) throw error;
      const stored = (data?.value ?? {}) as Record<string, number>;
      const merged = { ...PRICE_AMOUNTS };
      (Object.keys(merged) as PriceTier[]).forEach((tier) => {
        const v = Number(stored[tier]);
        if (Number.isFinite(v) && v >= 0) merged[tier] = v;
      });
      return merged;
    },
  });
}

export function useUpdatePricing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (prices: PriceMap) => {
      const { error } = await supabase
        .from("app_settings")
        .upsert(
          { key: "pricing", value: prices as never, description: "Preise je Kondition — zentral änderbar" } as never,
          { onConflict: "key" },
        );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pricing"] });
      qc.invalidateQueries({ queryKey: ["membership-forecast"] });
    },
  });
}
