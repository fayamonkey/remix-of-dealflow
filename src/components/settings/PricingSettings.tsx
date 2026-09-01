import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { usePricing, useUpdatePricing, type PriceMap } from "@/hooks/usePricing";
import { PRICE_LABELS, PRICE_TIERS, type PriceTier } from "@/lib/programs";

export function PricingSettings() {
  const { data, isLoading } = usePricing();
  const update = useUpdatePricing();
  const [draft, setDraft] = useState<PriceMap | null>(null);

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  if (isLoading || !draft) return <Skeleton className="h-72 w-full" />;

  const tiers = PRICE_TIERS.filter((t) => t !== "none");

  const save = async () => {
    try {
      await update.mutateAsync(draft);
      toast({ title: "Preise gespeichert", description: "Neue Konditionen gelten ab sofort für Berechnungen und Forecasts." });
    } catch {
      toast({ title: "Speichern fehlgeschlagen", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preise</CardTitle>
        <CardDescription>
          Zentrale Preisliste. Änderungen wirken auf neue Teilnahmen, Mitgliedschaften, Forecast und Szenario-Rechner.
          Bereits erfasste Beträge bleiben unverändert.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {tiers.map((tier) => (
            <div key={tier} className="space-y-1.5">
              <Label htmlFor={`price-${tier}`}>{PRICE_LABELS[tier as PriceTier]}</Label>
              <Input
                id={`price-${tier}`}
                type="number"
                min={0}
                step={10}
                value={draft[tier]}
                onChange={(e) => setDraft({ ...draft, [tier]: Math.max(0, Number(e.target.value) || 0) })}
              />
            </div>
          ))}
        </div>
        <Button onClick={save} disabled={update.isPending} className="rounded-full">
          {update.isPending ? "Speichert …" : "Preise speichern"}
        </Button>
      </CardContent>
    </Card>
  );
}
