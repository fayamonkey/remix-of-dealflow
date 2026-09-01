import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatEuro, PRICE_LABELS, type PriceTier } from "@/lib/programs";

interface Row {
  monthly_amount: number;
  price_tier: PriceTier;
  contact_id: string | null;
  status: string;
}

export function MembershipReports() {
  const { data, isLoading } = useQuery({
    queryKey: ["report-membership"],
    queryFn: async () => {
      const [{ data: subs, error: e1 }, { data: contacts, error: e2 }] = await Promise.all([
        supabase.from("subscriptions").select("monthly_amount, price_tier, contact_id, status"),
        supabase.from("contacts").select("id, source"),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      const sourceById = new Map((contacts ?? []).map((c) => [c.id, c.source || "Ohne Quelle"]));
      const active = ((subs ?? []) as Row[]).filter((s) => s.status === "active");

      const byTier = new Map<PriceTier, { count: number; mrr: number }>();
      const bySource = new Map<string, { count: number; mrr: number }>();
      active.forEach((s) => {
        const amount = Number(s.monthly_amount) || 0;
        const t = byTier.get(s.price_tier) ?? { count: 0, mrr: 0 };
        byTier.set(s.price_tier, { count: t.count + 1, mrr: t.mrr + amount });
        const key = (s.contact_id && sourceById.get(s.contact_id)) || "Ohne Quelle";
        const b = bySource.get(key) ?? { count: 0, mrr: 0 };
        bySource.set(key, { count: b.count + 1, mrr: b.mrr + amount });
      });

      return {
        tiers: [...byTier.entries()].map(([tier, v]) => ({ name: PRICE_LABELS[tier], ...v })).sort((a, b) => b.mrr - a.mrr),
        sources: [...bySource.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.mrr - a.mrr),
        totalMrr: active.reduce((s, r) => s + (Number(r.monthly_amount) || 0), 0),
        members: active.length,
      };
    },
  });

  if (isLoading) return <Skeleton className="h-80 w-full" />;
  if (!data) return null;

  const empty = data.members === 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Umsatz nach Kondition</CardTitle>
          <CardDescription>
            {data.members} aktive Mitgliedschaften · {formatEuro(data.totalMrr)} MRR
          </CardDescription>
        </CardHeader>
        <CardContent>
          {empty ? (
            <p className="text-sm text-muted-foreground">Noch keine aktiven Mitgliedschaften erfasst.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.tiers} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatEuro(v)} />
                <Bar dataKey="mrr" name="MRR" radius={[0, 4, 4, 0]}>
                  {data.tiers.map((_, i) => (
                    <Cell key={i} fill="hsl(var(--primary))" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Umsatz nach Herkunft</CardTitle>
          <CardDescription>Woher zahlende Mitglieder kommen (Golem, Website, …)</CardDescription>
        </CardHeader>
        <CardContent>
          {empty ? (
            <p className="text-sm text-muted-foreground">Noch keine Daten.</p>
          ) : (
            <ul className="space-y-3">
              {data.sources.map((s) => (
                <li key={s.name} className="flex items-center justify-between text-sm">
                  <span>{s.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {s.count} · {formatEuro(s.mrr)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
