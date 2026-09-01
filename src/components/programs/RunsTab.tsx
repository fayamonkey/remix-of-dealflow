import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CalendarRange } from "lucide-react";
import { useProgramRuns, useRunEnrollmentCounts, type ProgramRun } from "@/hooks/usePrograms";
import { CreateRunDialog } from "./CreateRunDialog";
import { RunDetailSheet } from "./RunDetailSheet";
import { CATEGORY_LABELS, RUN_STATUS_LABELS, formatDate, runStatusVariant } from "@/lib/programs";

export function RunsTab() {
  const { data: runs, isLoading } = useProgramRuns();
  const { data: counts } = useRunEnrollmentCounts();
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<ProgramRun | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Konkrete Workshop-Termine, Bootcamp-Runden und Kohorten-Monatsmodule.
        </p>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Durchlauf
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : !runs?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center py-14">
            <CalendarRange className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="font-semibold">Noch keine Durchläufe</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Lege den nächsten Gratis-Workshop, die Bootcamp-Runde oder das Kohorten-Modul an.
            </p>
            <Button variant="secondary" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Durchlauf anlegen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Durchlauf</TableHead>
                <TableHead className="hidden md:table-cell">Programm</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Start</TableHead>
                <TableHead className="hidden lg:table-cell">Kampagne</TableHead>
                <TableHead className="text-right">Plätze</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((r) => {
                const used = counts?.[r.id] ?? 0;
                return (
                  <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelected(r)}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {r.program_templates ? CATEGORY_LABELS[r.program_templates.category] : "—"}
                    </TableCell>
                    <TableCell><Badge variant={runStatusVariant(r.status)}>{RUN_STATUS_LABELS[r.status]}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{formatDate(r.start_date)}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">{r.campaign || "—"}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {used}{r.max_seats ? ` / ${r.max_seats}` : ""}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateRunDialog open={createOpen} onOpenChange={setCreateOpen} />
      <RunDetailSheet run={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  );
}
