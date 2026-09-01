import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { addMonths, format, startOfMonth } from "date-fns";
import { de } from "date-fns/locale";
import { Plus, RotateCcw, Trash2, Save, FolderOpen } from "lucide-react";
import { useScenarios, useSaveScenario, useDeleteScenario } from "@/hooks/useScenarios";
import { formatEuro, PRICE_LABELS, type PriceTier } from "@/lib/programs";
import { usePricing } from "@/hooks/usePricing";

type Interval = "monthly" | "once";

interface ScenarioRow {
  id: string;
  label: string;
  tier: PriceTier;
  count: number;
  price: number;
  interval: Interval;
  /** Anteil der Teilnehmer, die anschließend zahlende Kohorten-Mitglieder werden (nur bei Einmal-Angeboten sinnvoll). */
  conversion: number;
}

const CONVERSION_TIER: PriceTier = "standard_690";

function defaultRows(prices: Record<PriceTier, number>): ScenarioRow[] {
  return [
    { id: "cohort", label: "Kohorte — Standard", tier: "standard_690", count: 300, price: prices.standard_690, interval: "monthly", conversion: 0 },
    { id: "cohort-early", label: "Kohorte — Erste 50", tier: "early_590", count: 50, price: prices.early_590, interval: "monthly", conversion: 0 },
    { id: "foundation", label: "Foundation-Mitglieder", tier: "foundation_490", count: 40, price: prices.foundation_490, interval: "monthly", conversion: 0 },
    { id: "bootcamp", label: "Bootcamp-Teilnehmer", tier: "none", count: 500, price: 0, interval: "once", conversion: 20 },
    { id: "workshop-standalone", label: "KI-Firma Workshop (standalone)", tier: "workshop_standalone_2300", count: 40, price: prices.workshop_standalone_2300, interval: "once", conversion: 0 },
    { id: "company-5", label: "Firmenpakete 5 Seats", tier: "company_5_1900", count: 5, price: prices.company_5_1900, interval: "monthly", conversion: 0 },
  ];
}

export function ScenarioPlanner() {
  const { data: prices, isLoading } = usePricing();
  const [rows, setRows] = useState<ScenarioRow[] | null>(null);
  const [months, setMonths] = useState(12);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const { data: scenarios = [] } = useScenarios();
  const saveScenario = useSaveScenario();
  const deleteScenario = useDeleteScenario();

  const loadScenario = (id: string) => {
    const s = scenarios.find((x) => x.id === id);
    if (!s) return;
    setRows((s.rows as ScenarioRow[]) ?? []);
    setMonths(s.months ?? 12);
    setName(s.name);
    setCurrentId(s.id);
  };

  useEffect(() => {
    if (prices && !rows) setRows(defaultRows(prices));
  }, [prices, rows]);

  const cohortPrice = prices?.[CONVERSION_TIER] ?? 690;

  const totals = useMemo(() => {
    const list = rows ?? [];
    const mrrDirect = list
      .filter((r) => r.interval === "monthly")
      .reduce((s, r) => s + r.count * r.price, 0);
    const oneTime = list
      .filter((r) => r.interval === "once")
      .reduce((s, r) => s + r.count * r.price, 0);
    const convertedMembers = list.reduce((s, r) => s + Math.round((r.count * r.conversion) / 100), 0);
    const mrrConverted = convertedMembers * cohortPrice;
    const mrr = mrrDirect + mrrConverted;
    return { mrrDirect, mrrConverted, convertedMembers, oneTime, mrr, arr: mrr * 12 + oneTime };
  }, [rows, cohortPrice]);

  const chartData = useMemo(() => {
    const start = startOfMonth(new Date());
    return Array.from({ length: months }, (_, i) => ({
      month: format(addMonths(start, i), "MMM yy", { locale: de }),
      "Wiederkehrend": Math.round(totals.mrr),
      "Einmalig": i === 0 ? Math.round(totals.oneTime) : 0,
    }));
  }, [months, totals]);

  if (isLoading || !rows || !prices) return <Skeleton className="h-96 w-full" />;

  const update = (id: string, patch: Partial<ScenarioRow>) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const cards = [
    { label: "Monatlich wiederkehrend (MRR)", value: formatEuro(totals.mrr), hint: `davon ${formatEuro(totals.mrrConverted)} aus ${totals.convertedMembers} Konvertierungen` },
    { label: "Einmalumsatz", value: formatEuro(totals.oneTime), hint: "Workshops, Bootcamps & Co." },
    { label: "Umsatz 12 Monate", value: formatEuro(totals.arr), hint: "MRR × 12 plus Einmalumsatz" },
    { label: "Pro Jahr wiederkehrend", value: formatEuro(totals.mrr * 12), hint: "nur Mitgliedschaften" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{c.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{c.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Gespeicherte Szenarien</CardTitle>
          <CardDescription>Szenario benennen, speichern und später wieder aufrufen.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-1.5 flex-1 min-w-0">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. 300 Kohorten-Mitglieder" />
          </div>
          <Button
            className="rounded-full shrink-0"
            disabled={!name.trim() || saveScenario.isPending}
            onClick={() =>
              saveScenario.mutate(
                { id: currentId ?? undefined, name: name.trim(), rows, months },
                { onSuccess: (id) => setCurrentId(id) },
              )
            }
          >
            <Save className="h-4 w-4 mr-1.5" /> {currentId ? "Aktualisieren" : "Speichern"}
          </Button>
          {currentId && (
            <Button
              variant="secondary"
              className="rounded-full shrink-0"
              onClick={() => saveScenario.mutate({ name: `${name.trim()} (Kopie)`, rows, months }, { onSuccess: (id) => { setCurrentId(id); setName(`${name.trim()} (Kopie)`); } })}
            >
              Als neues speichern
            </Button>
          )}
          <div className="space-y-1.5 sm:w-64 shrink-0">
            <Label>Laden</Label>
            <Select value={currentId ?? ""} onValueChange={loadScenario}>
              <SelectTrigger>
                <SelectValue placeholder={scenarios.length ? "Szenario wählen" : "Noch keine gespeichert"} />
              </SelectTrigger>
              <SelectContent>
                {scenarios.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {currentId && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Szenario löschen"
              className="shrink-0"
              onClick={() => deleteScenario.mutate(currentId, { onSuccess: () => { setCurrentId(null); setName(""); } })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Szenario-Rechner</CardTitle>
            <CardDescription>
              Zahlen frei setzen: z. B. 300 Kohorten-Mitglieder, 500 Bootcamp-Teilnehmer, 40 Standalone-Workshops.
              Preise kommen aus der zentralen Preisliste (Einstellungen → Preise) und lassen sich hier fürs Szenario überschreiben.
            </CardDescription>
          </div>
          <Button variant="secondary" className="rounded-full shrink-0" onClick={() => { setRows(defaultRows(prices)); setCurrentId(null); setName(""); }}>
            <RotateCcw className="h-4 w-4 mr-1.5" /> Zurücksetzen
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {rows.map((r) => {
            const monthly = r.interval === "monthly" ? r.count * r.price : 0;
            const once = r.interval === "once" ? r.count * r.price : 0;
            const converted = Math.round((r.count * r.conversion) / 100);
            return (
              <div key={r.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <Input
                    value={r.label}
                    onChange={(e) => update(r.id, { label: e.target.value })}
                    className="max-w-xs font-medium"
                  />
                  <Button variant="ghost" size="icon" aria-label="Zeile entfernen" onClick={() => setRows(rows.filter((x) => x.id !== r.id))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label>Anzahl</Label>
                    <Input type="number" min={0} value={r.count} onChange={(e) => update(r.id, { count: Math.max(0, Number(e.target.value) || 0) })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Preis pro Person (€)</Label>
                    <Input type="number" min={0} step={10} value={r.price} onChange={(e) => update(r.id, { price: Math.max(0, Number(e.target.value) || 0) })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Abrechnung</Label>
                    <Select value={r.interval} onValueChange={(v) => update(r.id, { interval: v as Interval })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">monatlich</SelectItem>
                        <SelectItem value="once">einmalig</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>→ Kohorte (%)</Label>
                    <Input type="number" min={0} max={100} value={r.conversion} onChange={(e) => update(r.id, { conversion: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {monthly > 0 && <>{formatEuro(monthly)} / Monat</>}
                  {once > 0 && <>{formatEuro(once)} einmalig</>}
                  {converted > 0 && <> · {converted} werden Kohorten-Mitglieder → {formatEuro(converted * cohortPrice)} / Monat</>}
                </p>
              </div>
            );
          })}

          <Button
            variant="secondary"
            className="rounded-full"
            onClick={() =>
              setRows([
                ...rows,
                { id: crypto.randomUUID(), label: "Neues Angebot", tier: "none", count: 0, price: 0, interval: "monthly", conversion: 0 },
              ])
            }
          >
            <Plus className="h-4 w-4 mr-1.5" /> Zeile hinzufügen
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Umsatzverlauf im Szenario</CardTitle>
          <Select value={String(months)} onValueChange={(v) => setMonths(Number(v))}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6 Monate</SelectItem>
              <SelectItem value="12">12 Monate</SelectItem>
              <SelectItem value="24">24 Monate</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatEuro(v)} />
              <Legend />
              <Bar dataKey="Wiederkehrend" stackId="a" fill="hsl(var(--primary))" />
              <Bar dataKey="Einmalig" stackId="a" fill="hsl(170 40% 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-3">
            Aktuelle Preisliste: {PRICE_LABELS.foundation_490} · {PRICE_LABELS.early_590} · {PRICE_LABELS.standard_690} · {PRICE_LABELS.workshop_standalone_2300}.
            Beträge änderbar unter Einstellungen → Preise.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
