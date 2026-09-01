import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { addMonths, format, startOfMonth } from "date-fns";
import { de } from "date-fns/locale";
import { Repeat, TrendingUp, Users, AlertTriangle } from "lucide-react";
import { formatEuro, PROGRAM_LABELS, type ProgramType, type EnrollmentStatus, type PaymentStatus } from "@/lib/programs";

/** Wahrscheinlichkeit, dass aus einer Teilnahme wiederkehrender Umsatz wird. */
function likelihood(status: EnrollmentStatus, payment: PaymentStatus): number {
  if (status === "cancelled" || status === "no_show") return 0;
  if (payment === "refunded" || payment === "failed") return 0.1;
  if (status === "active" || status === "completed") return payment === "paid" ? 1 : 0.85;
  if (payment === "paid") return 0.95;
  if (payment === "pending") return 0.7;
  if (status === "registered") return 0.5;
  if (status === "attended") return 0.35;
  return 0.2; // interested
}

interface Row {
  id: string;
  program_type: ProgramType;
  status: EnrollmentStatus;
  payment_status: PaymentStatus;
  monthly_amount: number;
  start_date: string | null;
  workshop_date: string | null;
}

export function MembershipForecast() {
  const { data, isLoading } = useQuery({
    queryKey: ["membership-forecast"],
    queryFn: async () => {
      const [{ data: enrollments, error: e1 }, { data: subs, error: e2 }] = await Promise.all([
        supabase.from("enrollments").select("id, program_type, status, payment_status, monthly_amount, start_date, workshop_date"),
        supabase.from("subscriptions").select("id, status, monthly_amount, start_date"),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      return { enrollments: (enrollments ?? []) as Row[], subs: subs ?? [] };
    },
  });

  const rows = data?.enrollments ?? [];
  const subs = data?.subs ?? [];

  const recurring = rows.filter((r) => r.program_type === "cohort" || r.program_type === "company");
  const committed = recurring
    .filter((r) => r.status === "active" && r.payment_status === "paid")
    .reduce((s, r) => s + Number(r.monthly_amount), 0);

  const pipeline = recurring.filter((r) => !(r.status === "active" && r.payment_status === "paid"));
  const weightedPipeline = pipeline.reduce((s, r) => s + Number(r.monthly_amount) * likelihood(r.status, r.payment_status), 0);
  const openPayments = rows
    .filter((r) => r.payment_status === "pending")
    .reduce((s, r) => s + Number(r.monthly_amount), 0);

  // 6-Monats-Projektion: bestehende MRR läuft weiter, gewichtete Pipeline kommt im Startmonat dazu
  const monthKeys = Array.from({ length: 6 }, (_, i) => addMonths(startOfMonth(new Date()), i));
  let carried = committed;
  const chartData = monthKeys.map((m) => {
    const key = format(m, "yyyy-MM");
    const arriving = pipeline
      .filter((r) => {
        const d = r.start_date ?? r.workshop_date?.substring(0, 10) ?? null;
        if (!d) return format(m, "yyyy-MM") === format(monthKeys[0], "yyyy-MM");
        return d.substring(0, 7) <= key;
      })
      .reduce((s, r) => s + Number(r.monthly_amount) * likelihood(r.status, r.payment_status), 0);
    return {
      month: format(m, "MMM yy", { locale: de }),
      Bestand: Math.round(carried),
      Erwartet: Math.round(arriving),
    };
  });

  // Funnel
  const uniq = (t: ProgramType) => new Set(rows.filter((r) => r.program_type === t && r.status !== "cancelled").map((r) => r.id)).size;
  const workshop = uniq("free_workshop");
  const bootcamp = uniq("bootcamp");
  const cohort = rows.filter((r) => r.program_type === "cohort" && r.status === "active").length;
  const funnel = [
    { label: "Gratis-Workshop", value: workshop, base: workshop },
    { label: "Bootcamp", value: bootcamp, base: workshop },
    { label: "Kohorte aktiv", value: cohort, base: bootcamp || workshop },
  ];

  const activeSubs = subs.filter((s) => s.status === "active").length;
  const pendingSubs = subs.filter((s) => s.status === "payment_pending").length;

  const cards = [
    { label: "Gesicherte MRR", value: formatEuro(committed), hint: `${activeSubs} aktive Mitgliedschaften`, icon: Repeat },
    { label: "Gewichtete Pipeline", value: formatEuro(weightedPipeline), hint: `${pipeline.length} offene Teilnahmen`, icon: TrendingUp },
    { label: "Offene Zahlungen", value: formatEuro(openPayments), hint: `${pendingSubs} Mitgliedschaften warten auf Zahlung`, icon: AlertTriangle },
    { label: "Prognose in 6 Monaten", value: formatEuro((chartData.at(-1)?.Bestand ?? 0) + (chartData.at(-1)?.Erwartet ?? 0)), hint: "Bestand plus gewichtete Pipeline", icon: Users },
  ];

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-72 w-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{c.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{c.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Wiederkehrender Umsatz — 6 Monate</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
              <Tooltip formatter={(v: number) => formatEuro(v)} />
              <Legend />
              <Bar dataKey="Bestand" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Erwartet" stackId="a" fill="hsl(170 40% 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Funnel: Workshop → Bootcamp → Kohorte</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {funnel.map((f) => (
            <div key={f.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{f.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {f.value}{f.base ? ` · ${Math.round((f.value / f.base) * 100)}%` : ""}
                </span>
              </div>
              <Progress value={f.base ? Math.min(100, (f.value / f.base) * 100) : 0} />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Grundlage: alle Teilnahmen im Register — {PROGRAM_LABELS.free_workshop}, {PROGRAM_LABELS.bootcamp}, {PROGRAM_LABELS.cohort}.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
