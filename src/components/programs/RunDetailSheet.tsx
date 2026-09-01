import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Users } from "lucide-react";
import {
  useSessions, useUpdateRun, useDeleteRun, useCreateSession, useDeleteSession,
  useAttendance, useSyncAttendance, useSetAttendance, type ProgramRun, type ProgramSession,
} from "@/hooks/usePrograms";
import { useToast } from "@/hooks/use-toast";
import {
  ATTENDANCE_LABELS, ATTENDANCE_STATUSES, RUN_STATUSES, RUN_STATUS_LABELS,
  SESSION_TYPE_LABELS, formatDateTime, runStatusVariant,
  type AttendanceStatus, type RunStatus,
} from "@/lib/programs";

interface Props {
  run: ProgramRun | null;
  onOpenChange: (open: boolean) => void;
}

function AttendanceList({ session, runId }: { session: ProgramSession; runId: string }) {
  const { data: rows } = useAttendance(session.id);
  const sync = useSyncAttendance();
  const setStatus = useSetAttendance();
  const { toast } = useToast();

  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Anwesenheit</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            sync.mutate(
              { sessionId: session.id, runId },
              {
                onSuccess: (n) => toast({ title: `${n} Teilnahmen übernommen` }),
                onError: () => toast({ title: "Übernahme fehlgeschlagen", variant: "destructive" }),
              },
            )
          }
        >
          <Users className="h-3.5 w-3.5 mr-1.5" /> Teilnehmer übernehmen
        </Button>
      </div>
      {!rows?.length ? (
        <p className="text-xs text-muted-foreground">Noch niemand für diesen Termin erfasst.</p>
      ) : (
        rows.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-2">
            <span className="text-sm truncate">
              {a.contacts?.first_name} {a.contacts?.last_name}
            </span>
            <Select value={a.status} onValueChange={(v) => setStatus.mutate({ id: a.id, status: v as AttendanceStatus })}>
              <SelectTrigger className="h-8 w-44 shrink-0"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ATTENDANCE_STATUSES.map((s) => <SelectItem key={s} value={s}>{ATTENDANCE_LABELS[s]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        ))
      )}
    </div>
  );
}

export function RunDetailSheet({ run, onOpenChange }: Props) {
  const { data: sessions } = useSessions(run?.id);
  const update = useUpdateRun();
  const remove = useDeleteRun();
  const createSession = useCreateSession();
  const deleteSession = useDeleteSession();
  const { toast } = useToast();
  const [openSession, setOpenSession] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  if (!run) return null;

  const patch = (updates: Partial<ProgramRun>) =>
    update.mutate({ id: run.id, ...updates }, { onError: () => toast({ title: "Änderung fehlgeschlagen", variant: "destructive" }) });

  return (
    <Sheet open={!!run} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-2">
          <SheetTitle className="text-left">{run.name}</SheetTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{run.program_templates?.name}</Badge>
            <Badge variant={runStatusVariant(run.status)}>{RUN_STATUS_LABELS[run.status]}</Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={run.status} onValueChange={(v) => patch({ status: v as RunStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RUN_STATUSES.map((s) => <SelectItem key={s} value={s}>{RUN_STATUS_LABELS[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Plätze</Label>
              <Input type="number" defaultValue={run.max_seats ?? ""} onBlur={(e) => patch({ max_seats: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div className="space-y-2">
              <Label>Start</Label>
              <Input type="date" defaultValue={run.start_date ?? ""} onBlur={(e) => patch({ start_date: e.target.value || null })} />
            </div>
            <div className="space-y-2">
              <Label>Ende</Label>
              <Input type="date" defaultValue={run.end_date ?? ""} onBlur={(e) => patch({ end_date: e.target.value || null })} />
            </div>
            <div className="space-y-2">
              <Label>Kampagne</Label>
              <Input defaultValue={run.campaign ?? ""} onBlur={(e) => patch({ campaign: e.target.value || null })} />
            </div>
            <div className="space-y-2">
              <Label>Trainer</Label>
              <Input defaultValue={run.lead_trainer ?? ""} onBlur={(e) => patch({ lead_trainer: e.target.value || null })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Meeting-Link</Label>
              <Input defaultValue={run.meeting_url ?? ""} onBlur={(e) => patch({ meeting_url: e.target.value || null })} placeholder="https://..." />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Aufzeichnung</Label>
              <Input defaultValue={run.recording_url ?? ""} onBlur={(e) => patch({ recording_url: e.target.value || null })} placeholder="https://..." />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Termine</h4>
            {sessions?.length ? sessions.map((s) => (
              <div key={s.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-2">
                  <button className="text-left min-w-0" onClick={() => setOpenSession(openSession === s.id ? null : s.id)}>
                    <p className="text-sm font-medium truncate">{s.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {SESSION_TYPE_LABELS[s.session_type]} · {formatDateTime(s.starts_at)}
                    </p>
                  </button>
                  <Button size="icon" variant="ghost" className="shrink-0" onClick={() => deleteSession.mutate(s.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
                {openSession === s.id && <AttendanceList session={s} runId={run.id} />}
              </div>
            )) : <p className="text-sm text-muted-foreground">Noch keine Termine.</p>}

            <div className="flex gap-2">
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Weiterer Termin..." />
              <Button
                variant="secondary"
                disabled={!newTitle.trim()}
                onClick={() =>
                  createSession.mutate(
                    { run_id: run.id, title: newTitle.trim(), position: (sessions?.length ?? 0) + 1 },
                    { onSuccess: () => setNewTitle("") },
                  )
                }
              >
                <Plus className="h-4 w-4 mr-2" /> Hinzufügen
              </Button>
            </div>
          </div>

          <Separator />

          <Button
            variant="outline"
            className="text-destructive"
            onClick={() =>
              remove.mutate(run.id, {
                onSuccess: () => { toast({ title: "Durchlauf gelöscht" }); onOpenChange(false); },
                onError: () => toast({ title: "Löschen fehlgeschlagen", variant: "destructive" }),
              })
            }
          >
            <Trash2 className="h-4 w-4 mr-2" /> Durchlauf löschen
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
