import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useContacts } from "@/hooks/useContacts";
import { useCompanies } from "@/hooks/useCompanies";
import { useCreateEnrollment } from "@/hooks/useEnrollments";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  PROGRAM_TYPES,
  PROGRAM_LABELS,
  ENROLLMENT_STATUSES,
  STATUS_LABELS,
  PRICE_TIERS,
  PRICE_LABELS,
  type ProgramType,
  type EnrollmentStatus,
  type PriceTier,
} from "@/lib/programs";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultContactId?: string;
}

export function CreateEnrollmentDialog({ open, onOpenChange, defaultContactId }: Props) {
  const { user } = useAuth();
  const { data: contacts } = useContacts();
  const { data: companies } = useCompanies();
  const create = useCreateEnrollment();
  const { toast } = useToast();

  const [contactId, setContactId] = useState(defaultContactId ?? "");
  const [companyId, setCompanyId] = useState("none");
  const [programType, setProgramType] = useState<ProgramType>("free_workshop");
  const [status, setStatus] = useState<EnrollmentStatus>("registered");
  const [priceTier, setPriceTier] = useState<PriceTier | "auto">("auto");
  const [seats, setSeats] = useState("1");
  const [funnelSource, setFunnelSource] = useState("");
  const [golemCampaign, setGolemCampaign] = useState("");
  const [workshopDate, setWorkshopDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [notes, setNotes] = useState("");

  const reset = () => {
    setContactId(defaultContactId ?? "");
    setCompanyId("none");
    setProgramType("free_workshop");
    setStatus("registered");
    setPriceTier("auto");
    setSeats("1");
    setFunnelSource("");
    setGolemCampaign("");
    setWorkshopDate("");
    setStartDate("");
    setNextStep("");
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !contactId) return;
    create.mutate(
      {
        contact_id: contactId,
        company_id: companyId === "none" ? null : companyId,
        program_type: programType,
        status,
        price_tier: priceTier === "auto" ? "none" : priceTier,
        seats: Number(seats) || 1,
        funnel_source: funnelSource || null,
        golem_campaign: golemCampaign || null,
        workshop_date: workshopDate ? new Date(workshopDate).toISOString() : null,
        start_date: startDate || null,
        next_step: nextStep || null,
        notes: notes || null,
        created_by: user.id,
      },
      {
        onSuccess: () => {
          toast({ title: "Teilnahme angelegt", description: "Die Checkliste wurde automatisch erzeugt." });
          onOpenChange(false);
          reset();
        },
        onError: () => toast({ title: "Fehler beim Anlegen", variant: "destructive" }),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Teilnahme anlegen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Person *</Label>
              <Select value={contactId} onValueChange={setContactId}>
                <SelectTrigger><SelectValue placeholder="Person wählen..." /></SelectTrigger>
                <SelectContent>
                  {contacts?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}{c.email ? ` · ${c.email}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Firma</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keine</SelectItem>
                  {companies?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Programm *</Label>
              <Select value={programType} onValueChange={(v) => setProgramType(v as ProgramType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROGRAM_TYPES.map((p) => <SelectItem key={p} value={p}>{PROGRAM_LABELS[p]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as EnrollmentStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ENROLLMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(programType === "cohort" || programType === "company") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kondition</Label>
                <Select value={priceTier} onValueChange={(v) => setPriceTier(v as PriceTier | "auto")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automatisch bestimmen</SelectItem>
                    {PRICE_TIERS.filter((t) => t !== "none").map((t) => (
                      <SelectItem key={t} value={t}>{PRICE_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Automatisch: Foundation 490 € nach Bootcamp, sonst 590 € für die ersten 50, danach 690 €.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Seats</Label>
                <Input type="number" min={1} value={seats} onChange={(e) => setSeats(e.target.value)} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Funnel-Quelle</Label>
              <Input value={funnelSource} onChange={(e) => setFunnelSource(e.target.value)} placeholder="z.B. Landingpage, Golem" maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label>Golem-Kampagne</Label>
              <Input value={golemCampaign} onChange={(e) => setGolemCampaign(e.target.value)} maxLength={120} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Workshop-Termin</Label>
              <Input type="datetime-local" value={workshopDate} onChange={(e) => setWorkshopDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Eintrittsdatum</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nächster sinnvoller Schritt</Label>
            <Input value={nextStep} onChange={(e) => setNextStep(e.target.value)} maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label>Notizen</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={2000} />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={create.isPending || !contactId}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Teilnahme anlegen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
