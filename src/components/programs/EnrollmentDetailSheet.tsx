import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Enrollment,
  useEnrollmentSteps,
  useToggleStep,
  useUpdateEnrollment,
  useMemberEvents,
  useDeleteEnrollment,
} from "@/hooks/useEnrollments";
import {
  ACCESS_LABELS, ACCESS_STATUSES, ENROLLMENT_STATUSES, PAYMENT_LABELS, PAYMENT_STATUSES,
  PRICE_LABELS, PRICE_TIERS, PROGRAM_LABELS, STATUS_LABELS, formatEuro, statusVariant,
  type AccessStatus, type EnrollmentStatus, type PaymentStatus, type PriceTier,
} from "@/lib/programs";
import { useToast } from "@/hooks/use-toast";
import { Trash2, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";

interface Props {
  enrollment: Enrollment | null;
  onOpenChange: (open: boolean) => void;
}

export function EnrollmentDetailSheet({ enrollment, onOpenChange }: Props) {
  const { data: steps } = useEnrollmentSteps(enrollment?.id);
  const { data: events } = useMemberEvents(enrollment?.contact_id);
  const toggleStep = useToggleStep();
  const update = useUpdateEnrollment();
  const remove = useDeleteEnrollment();
  const { toast } = useToast();
  const [nextStep, setNextStep] = useState("");

  if (!enrollment) return null;

  const patch = (updates: Partial<Enrollment>) =>
    update.mutate({ id: enrollment.id, ...updates }, { onError: () => toast({ title: "Änderung fehlgeschlagen", variant: "destructive" }) });

  const relatedEvents = events?.filter((e) => !e.enrollment_id || e.enrollment_id === enrollment.id) ?? [];
  const doneCount = steps?.filter((s) => s.done).length ?? 0;

  return (
    <Sheet open={!!enrollment} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-2">
          <SheetTitle className="text-left">
            {enrollment.contacts?.first_name} {enrollment.contacts?.last_name}
          </SheetTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{PROGRAM_LABELS[enrollment.program_type]}</Badge>
            <Badge variant={statusVariant(enrollment.status)}>{STATUS_LABELS[enrollment.status]}</Badge>
            {enrollment.monthly_amount > 0 && (
              <Badge variant="outline">{formatEuro(enrollment.monthly_amount)} / Monat</Badge>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={enrollment.status} onValueChange={(v) => patch({ status: v as EnrollmentStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ENROLLMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Zahlung</Label>
              <Select value={enrollment.payment_status} onValueChange={(v) => patch({ payment_status: v as PaymentStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{PAYMENT_LABELS[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Zugang</Label>
              <Select value={enrollment.access_status} onValueChange={(v) => patch({ access_status: v as AccessStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACCESS_STATUSES.map((s) => <SelectItem key={s} value={s}>{ACCESS_LABELS[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kondition</Label>
              <Select value={enrollment.price_tier} onValueChange={(v) => patch({ price_tier: v as PriceTier })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRICE_TIERS.map((t) => <SelectItem key={t} value={t}>{PRICE_LABELS[t]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Eintritt</Label>
              <Input type="date" defaultValue={enrollment.start_date ?? ""} onBlur={(e) => patch({ start_date: e.target.value || null })} />
            </div>
            <div className="space-y-2">
              <Label>Kündigung</Label>
              <Input type="date" defaultValue={enrollment.cancel_date ?? ""} onBlur={(e) => patch({ cancel_date: e.target.value || null })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nächster sinnvoller Schritt</Label>
            <div className="flex gap-2">
              <Input
                defaultValue={enrollment.next_step ?? ""}
                onChange={(e) => setNextStep(e.target.value)}
                placeholder="z.B. Bootcamp-Angebot nachfassen"
              />
              <Button variant="secondary" onClick={() => patch({ next_step: nextStep || enrollment.next_step })}>
                Speichern
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Automationskette</h4>
              <span className="text-xs text-muted-foreground">{doneCount} / {steps?.length ?? 0} erledigt</span>
            </div>
            <div className="space-y-2">
              {steps?.length ? steps.map((s) => (
                <div key={s.id} className="flex items-start gap-3 rounded-md border p-2.5">
                  <Checkbox
                    checked={s.done}
                    onCheckedChange={(checked) => toggleStep.mutate({ id: s.id, done: !!checked })}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${s.done ? "line-through text-muted-foreground" : ""}`}>{s.name}</p>
                    {s.due_date && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" /> fällig {new Date(s.due_date).toLocaleDateString("de-DE")}
                      </p>
                    )}
                  </div>
                </div>
              )) : <p className="text-sm text-muted-foreground">Keine Schritte hinterlegt.</p>}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Ereignisse</h4>
            {relatedEvents.length ? relatedEvents.map((e) => (
              <div key={e.id} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-3.5 w-3.5 mt-1 text-muted-foreground shrink-0" />
                <div>
                  <p>{e.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(e.occurred_at).toLocaleString("de-DE")}</p>
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground">Noch keine Ereignisse.</p>}
          </div>

          <Separator />

          <Button
            variant="outline"
            className="text-destructive"
            onClick={() => {
              remove.mutate(enrollment.id, {
                onSuccess: () => { toast({ title: "Teilnahme gelöscht" }); onOpenChange(false); },
              });
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Teilnahme löschen
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
