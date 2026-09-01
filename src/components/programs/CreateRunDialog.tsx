import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProgramTemplates, useCreateRun, useCreateSession } from "@/hooks/usePrograms";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CATEGORY_LABELS, RUN_STATUSES, RUN_STATUS_LABELS, type RunStatus } from "@/lib/programs";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRunDialog({ open, onOpenChange }: Props) {
  const { data: templates } = useProgramTemplates();
  const createRun = useCreateRun();
  const createSession = useCreateSession();
  const { user } = useAuth();
  const { toast } = useToast();

  const [templateId, setTemplateId] = useState("");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [status, setStatus] = useState<RunStatus>("draft");
  const [maxSeats, setMaxSeats] = useState("");
  const [campaign, setCampaign] = useState("");

  const template = templates?.find((t) => t.id === templateId);

  const reset = () => {
    setTemplateId(""); setName(""); setStartDate(""); setStatus("draft"); setMaxSeats(""); setCampaign("");
  };

  /** Legt die Standardtermine des Programms datiert an (Bootcamp: Woche 0/2/4). */
  const seedSessions = async (runId: string) => {
    if (!template || !startDate) return;
    const base = new Date(startDate);
    const plan: { title: string; offsetDays: number; type: "live" | "catch_up" }[] =
      template.category === "bootcamp"
        ? [
            { title: "Termin 1 — Start", offsetDays: 0, type: "live" },
            { title: "Termin 2 — Woche 2", offsetDays: 14, type: "live" },
            { title: "Termin 3 — Woche 4", offsetDays: 28, type: "live" },
          ]
        : template.category === "cohort"
        ? [
            { title: "Woche 1 — Follow-along Workshop", offsetDays: 0, type: "live" },
            { title: "Woche 3 — Catch-up", offsetDays: 14, type: "catch_up" },
          ]
        : [{ title: template.name, offsetDays: 0, type: "live" }];

    for (let i = 0; i < plan.length; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + plan[i].offsetDays);
      await createSession.mutateAsync({
        run_id: runId,
        title: plan[i].title,
        position: i + 1,
        session_type: plan[i].type,
        starts_at: d.toISOString(),
      });
    }
  };

  const submit = async () => {
    if (!templateId || !name.trim() || !user) return;
    try {
      const run = await createRun.mutateAsync({
        template_id: templateId,
        name: name.trim(),
        start_date: startDate || null,
        status,
        max_seats: maxSeats ? Number(maxSeats) : template?.default_capacity ?? null,
        campaign: campaign.trim() || null,
        partner: template?.partner ?? null,
        created_by: user.id,
      });
      await seedSessions(run.id);
      toast({ title: "Durchlauf angelegt", description: "Die Standardtermine wurden erzeugt." });
      reset();
      onOpenChange(false);
    } catch {
      toast({ title: "Anlegen fehlgeschlagen", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Neuer Durchlauf</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Programm</Label>
            <Select value={templateId} onValueChange={(v) => {
              setTemplateId(v);
              const t = templates?.find((x) => x.id === v);
              if (t && !name) setName(t.name);
            }}>
              <SelectTrigger><SelectValue placeholder="Programm wählen" /></SelectTrigger>
              <SelectContent>
                {templates?.filter((t) => t.active).map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} · {CATEGORY_LABELS[t.category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Bezeichnung</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="z.B. Kohorte Dezember 2026 — Modul 1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as RunStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RUN_STATUSES.map((s) => <SelectItem key={s} value={s}>{RUN_STATUS_LABELS[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Plätze</Label>
              <Input type="number" value={maxSeats} onChange={(e) => setMaxSeats(e.target.value)} placeholder={template?.default_capacity?.toString() ?? "unbegrenzt"} />
            </div>
            <div className="space-y-2">
              <Label>Kampagne</Label>
              <Input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="z.B. Golem LinkedIn 11/26" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={submit} disabled={!templateId || !name.trim() || createRun.isPending}>Anlegen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
