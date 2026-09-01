import { useState } from "react";
import { PageBanner } from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Upload, GraduationCap } from "lucide-react";
import { useEnrollments, type Enrollment } from "@/hooks/useEnrollments";
import { CreateEnrollmentDialog } from "@/components/programs/CreateEnrollmentDialog";
import { EnrollmentDetailSheet } from "@/components/programs/EnrollmentDetailSheet";
import { GolemImportDialog } from "@/components/programs/GolemImportDialog";
import { RunsTab } from "@/components/programs/RunsTab";
import { TemplatesTab } from "@/components/programs/TemplatesTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ACCESS_LABELS, ENROLLMENT_STATUSES, PAYMENT_LABELS, PRICE_LABELS, PROGRAM_LABELS,
  PROGRAM_TYPES, STATUS_LABELS, formatEuro, statusVariant,
  type EnrollmentStatus, type ProgramType,
} from "@/lib/programs";

export default function Programs() {
  const [search, setSearch] = useState("");
  const [programType, setProgramType] = useState<ProgramType | "all">("all");
  const [status, setStatus] = useState<EnrollmentStatus | "all">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selected, setSelected] = useState<Enrollment | null>(null);

  const { data: enrollments, isLoading } = useEnrollments({ programType, status, search });

  const mrr = (enrollments ?? [])
    .filter((e) => ["active", "completed"].includes(e.status) && e.payment_status === "paid")
    .reduce((sum, e) => sum + Number(e.monthly_amount || 0), 0);

  const counts = PROGRAM_TYPES.map((p) => ({
    type: p,
    count: (enrollments ?? []).filter((e) => e.program_type === p).length,
  }));

  return (
    <div className="space-y-6">
      <PageBanner title="Programme" description="Gratis-Workshops, Bootcamp, Kohorte und Firmentickets an einem Ort.">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4 mr-2" /> CSV-Import
          </Button>
          <Button className="w-full sm:w-auto" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Teilnahme
          </Button>
        </div>
      </PageBanner>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {counts.map((c) => (
          <Card key={c.type}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{PROGRAM_LABELS[c.type]}</p>
              <p className="text-2xl font-semibold tabular-nums">{c.count}</p>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Bezahlte MRR</p>
            <p className="text-2xl font-semibold tabular-nums">{formatEuro(mrr)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="enrollments">
        <TabsList>
          <TabsTrigger value="enrollments">Teilnahmen</TabsTrigger>
          <TabsTrigger value="runs">Durchläufe</TabsTrigger>
          <TabsTrigger value="templates">Angebote</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments" className="mt-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Person, Quelle oder Kampagne..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={programType} onValueChange={(v) => setProgramType(v as ProgramType | "all")}>
          <SelectTrigger className="w-full sm:w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Programme</SelectItem>
            {PROGRAM_TYPES.map((p) => <SelectItem key={p} value={p}>{PROGRAM_LABELS[p]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as EnrollmentStatus | "all")}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {ENROLLMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : !enrollments?.length ? (
        <div className="flex flex-col items-center py-16">
          <GraduationCap className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-lg">Noch keine Teilnahmen</h3>
          <p className="text-muted-foreground text-sm mb-4">Lege die erste Teilnahme an oder importiere eine Liste.</p>
          <Button variant="secondary" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Teilnahme anlegen
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead>Programm</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Zahlung</TableHead>
                <TableHead className="hidden md:table-cell">Zugang</TableHead>
                <TableHead className="hidden lg:table-cell">Kondition</TableHead>
                <TableHead className="hidden lg:table-cell">Nächster Schritt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((e) => (
                <TableRow key={e.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelected(e)}>
                  <TableCell className="font-medium">
                    {e.contacts?.first_name} {e.contacts?.last_name}
                    <span className="block text-xs text-muted-foreground">{e.contacts?.email || "—"}</span>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{PROGRAM_LABELS[e.program_type]}</Badge></TableCell>
                  <TableCell><Badge variant={statusVariant(e.status)}>{STATUS_LABELS[e.status]}</Badge></TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{PAYMENT_LABELS[e.payment_status]}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{ACCESS_LABELS[e.access_status]}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{PRICE_LABELS[e.price_tier]}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{e.next_step || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
        </TabsContent>

        <TabsContent value="runs" className="mt-4">
          <RunsTab />
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <TemplatesTab />
        </TabsContent>
      </Tabs>

      <CreateEnrollmentDialog open={createOpen} onOpenChange={setCreateOpen} />
      <GolemImportDialog open={importOpen} onOpenChange={setImportOpen} />
      <EnrollmentDetailSheet enrollment={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  );
}

