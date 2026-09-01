import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageBanner } from "@/components/PageBanner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, ShieldCheck, Upload } from "lucide-react";
import { GolemImportDialog } from "@/components/programs/GolemImportDialog";
import { MemberDetailSheet } from "@/components/programs/MemberDetailSheet";
import {
  PRICE_LABELS, PROGRAM_LABELS, STATUS_LABELS, formatEuro, statusVariant,
  type PriceTier, type ProgramType, type EnrollmentStatus, type PaymentStatus,
} from "@/lib/programs";

export interface MemberRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  language: string;
  source: string | null;
  campaign: string | null;
  consent_marketing: boolean;
  consent_recording: boolean;
  is_foundation_member: boolean;
  member_number: number | null;
  current_price_tier: PriceTier;
  companies?: { id: string; name: string } | null;
  enrollments?: { id: string; program_type: ProgramType; status: EnrollmentStatus; monthly_amount: number; payment_status: PaymentStatus }[];
}

type Membership =
  | { kind: "paid"; label: string; variant: "default" }
  | { kind: "pending"; label: string; variant: "secondary" }
  | { kind: "free"; label: string; variant: "outline" };

function membershipOf(m: MemberRow): Membership {
  const paying = (m.enrollments ?? []).filter((e) => e.program_type !== "free_workshop");
  const paid = paying.find((e) => e.payment_status === "paid");
  if (paid) return { kind: "paid", label: `Zahlend · ${PROGRAM_LABELS[paid.program_type]} · ${formatEuro(Number(paid.monthly_amount))}`, variant: "default" };
  const pending = paying.find((e) => e.payment_status === "pending");
  if (pending) return { kind: "pending", label: `Zahlung offen · ${PROGRAM_LABELS[pending.program_type]}`, variant: "secondary" };
  if (paying.length) return { kind: "free", label: "Noch nicht bezahlt", variant: "outline" };
  return { kind: "free", label: "Gratis-Teilnehmer", variant: "outline" };
}


type Filter = "all" | "cohort" | "bootcamp" | "workshop" | "foundation" | "no_consent";

export default function Members() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [importOpen, setImportOpen] = useState(false);
  const [selected, setSelected] = useState<MemberRow | null>(null);

  const { data: members, isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("id, first_name, last_name, email, phone, language, source, campaign, consent_marketing, consent_recording, is_foundation_member, member_number, current_price_tier, companies(id, name), enrollments(id, program_type, status, monthly_amount, payment_status)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as MemberRow[]) ?? [];
    },
  });

  const filtered = useMemo(() => {
    let rows = members ?? [];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((m) => `${m.first_name} ${m.last_name} ${m.email ?? ""} ${m.campaign ?? ""} ${m.source ?? ""}`.toLowerCase().includes(q));
    }
    const has = (m: MemberRow, type: ProgramType, statuses?: EnrollmentStatus[]) =>
      (m.enrollments ?? []).some((e) => e.program_type === type && (!statuses || statuses.includes(e.status)));

    switch (filter) {
      case "cohort": return rows.filter((m) => has(m, "cohort", ["active", "paused"]));
      case "bootcamp": return rows.filter((m) => has(m, "bootcamp"));
      case "workshop": return rows.filter((m) => has(m, "free_workshop") && !has(m, "bootcamp"));
      case "foundation": return rows.filter((m) => m.is_foundation_member);
      case "no_consent": return rows.filter((m) => !m.consent_marketing);
      default: return rows;
    }
  }, [members, search, filter]);

  const activeCohort = (members ?? []).filter((m) => (m.enrollments ?? []).some((e) => e.program_type === "cohort" && e.status === "active"));
  const mrr = activeCohort.reduce((sum, m) => {
    const e = (m.enrollments ?? []).find((x) => x.program_type === "cohort" && x.status === "active");
    return sum + Number(e?.monthly_amount ?? 0);
  }, 0);
  const foundationCount = (members ?? []).filter((m) => m.is_foundation_member).length;
  const consentCount = (members ?? []).filter((m) => m.consent_marketing).length;

  return (
    <div className="space-y-6">
      <PageBanner title="Teilnehmer-Register" description="Eine Wahrheit über jeden Kontakt: Herkunft, Status, Kondition, Einwilligungen.">
        <Button variant="outline" className="w-full sm:w-auto" onClick={() => setImportOpen(true)}>
          <Upload className="h-4 w-4 mr-2" /> CSV-Import
        </Button>
      </PageBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Personen</p><p className="text-2xl font-semibold tabular-nums">{members?.length ?? 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Aktive Kohorte</p><p className="text-2xl font-semibold tabular-nums">{activeCohort.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">MRR Kohorte</p><p className="text-2xl font-semibold tabular-nums">{formatEuro(mrr)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Foundation / Einwilligung</p><p className="text-2xl font-semibold tabular-nums">{foundationCount} / {consentCount}</p></CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Name, E-Mail, Kampagne..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <SelectTrigger className="w-full sm:w-64"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Personen</SelectItem>
            <SelectItem value="cohort">Kohortenmitglieder</SelectItem>
            <SelectItem value="bootcamp">Bootcamp</SelectItem>
            <SelectItem value="workshop">Workshop, noch kein Bootcamp</SelectItem>
            <SelectItem value="foundation">Foundation (490 €)</SelectItem>
            <SelectItem value="no_consent">Ohne Marketing-Einwilligung</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : !filtered.length ? (
        <div className="flex flex-col items-center py-16">
          <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-lg">Keine Treffer</h3>
          <p className="text-muted-foreground text-sm">Andere Filter wählen oder eine Teilnehmerliste importieren.</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead className="hidden md:table-cell">Quelle / Kampagne</TableHead>
                <TableHead>Programme</TableHead>
                <TableHead>Mitgliedschaft</TableHead>
                <TableHead className="hidden lg:table-cell">Kondition</TableHead>
                <TableHead className="hidden lg:table-cell">Einwilligung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelected(m)}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {m.first_name} {m.last_name}
                      {m.is_foundation_member && <ShieldCheck className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <span className="block text-xs text-muted-foreground">
                      {m.email || "—"}{m.member_number ? ` · Mitglied #${m.member_number}` : ""}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {m.source || "—"}{m.campaign ? ` · ${m.campaign}` : ""}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(m.enrollments ?? []).length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                      {(m.enrollments ?? []).map((e) => (
                        <Badge key={e.id} variant={statusVariant(e.status)} className="text-xs">
                          {PROGRAM_LABELS[e.program_type]} · {STATUS_LABELS[e.status]}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">{PRICE_LABELS[m.current_price_tier]}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex gap-1">
                      <Badge variant={m.consent_marketing ? "default" : "outline"} className="text-xs">Marketing</Badge>
                      <Badge variant={m.consent_recording ? "default" : "outline"} className="text-xs">Aufzeichnung</Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <GolemImportDialog open={importOpen} onOpenChange={setImportOpen} />
      <MemberDetailSheet member={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  );
}
