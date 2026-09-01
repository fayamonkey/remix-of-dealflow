import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateDeal } from "@/hooks/useDeals";
import { useCompanies, useCreateCompany } from "@/hooks/useCompanies";
import { useContacts } from "@/hooks/useContacts";
import { PipelineStage } from "@/hooks/usePipelineStages";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { OFFERS, OFFER_TYPES, suggestedAmount, type OfferType } from "@/lib/offers";


interface CreateDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineId: string;
  stages: PipelineStage[];
  defaultStageId?: string;
}

export function CreateDealDialog({ open, onOpenChange, pipelineId, stages, defaultStageId }: CreateDealDialogProps) {
  const { user } = useAuth();
  const createDeal = useCreateDeal();
  const { data: companies } = useCompanies();
  const { data: contacts } = useContacts();
  const createCompany = useCreateCompany();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [offerType, setOfferType] = useState<OfferType>("ai_company_day");
  const [seats, setSeats] = useState("1");
  const [companyId, setCompanyId] = useState<string>("");
  const [contactId, setContactId] = useState<string>("");
  const [stageId, setStageId] = useState(defaultStageId || stages[0]?.id || "");
  const [value, setValue] = useState(String(suggestedAmount("ai_company_day", 1)));
  const [valueTouched, setValueTouched] = useState(false);
  const [probability, setProbability] = useState("50");
  const [closeDate, setCloseDate] = useState("");
  const [notes, setNotes] = useState("");

  const applyOffer = (type: OfferType, seatCount: number) => {
    if (valueTouched) return;
    const amount = suggestedAmount(type, seatCount);
    setValue(amount ? String(amount) : "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !stageId) return;
    const finalTitle = title.trim() || OFFERS[offerType].label;

    createDeal.mutate(
      {
        title: finalTitle,
        pipeline_id: pipelineId,
        stage_id: stageId,
        owner_id: user.id,
        created_by: user.id,
        offer_type: offerType,
        seats: parseInt(seats) || 1,
        company_id: companyId || null,
        contact_id: contactId || null,
        value: parseFloat(value) || 0,
        probability: parseInt(probability) || 50,
        close_date: closeDate || null,
        notes: notes || null,
      },
      {
        onSuccess: () => {
          toast({ title: "Deal angelegt", description: `„${finalTitle}“ ist in der Pipeline` });
          onOpenChange(false);
          setTitle(""); setCompanyId(""); setContactId(""); setSeats("1"); setValueTouched(false);
          setValue(String(suggestedAmount("ai_company_day", 1))); setOfferType("ai_company_day");
          setProbability("50"); setCloseDate(""); setNotes("");
        },
        onError: () => {
          toast({ title: "Fehler", description: "Deal konnte nicht angelegt werden.", variant: "destructive" });
        },
      }
    );
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Neue Firmenanfrage</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Angebotstyp *</Label>
            <Select
              value={offerType}
              onValueChange={(v) => { const t = v as OfferType; setOfferType(t); setSeats(String(OFFERS[t].defaultSeats)); applyOffer(t, OFFERS[t].defaultSeats); }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {OFFER_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{OFFERS[t].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{OFFERS[offerType].hint}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deal-title">Titel</Label>
            <Input id="deal-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={OFFERS[offerType].label} maxLength={200} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Stufe</Label>
              <Select value={stageId} onValueChange={setStageId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {stages.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deal-seats">Plätze</Label>
              <Input id="deal-seats" type="number" min="1" value={seats}
                onChange={(e) => { setSeats(e.target.value); applyOffer(offerType, parseInt(e.target.value) || 1); }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deal-value">{OFFERS[offerType].recurring ? "Betrag (€/Monat)" : "Betrag (€)"}</Label>
              <Input id="deal-value" type="number" value={value} onChange={(e) => { setValueTouched(true); setValue(e.target.value); }} placeholder="0" />
            </div>
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Firma</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger><SelectValue placeholder="Auswählen..." /></SelectTrigger>
                <SelectContent>
                  {companies?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ansprechpartner</Label>
              <Select value={contactId} onValueChange={setContactId}>
                <SelectTrigger><SelectValue placeholder="Auswählen..." /></SelectTrigger>
                <SelectContent>
                  {contacts?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deal-probability">Wahrscheinlichkeit (%)</Label>
              <Input id="deal-probability" type="number" min="0" max="100" value={probability} onChange={(e) => setProbability(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deal-close-date">Geplanter Abschluss</Label>
              <Input id="deal-close-date" type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deal-notes">Notizen</Label>
            <Textarea id="deal-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Kontext, Bedarf, offene Punkte..." rows={3} maxLength={2000} />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={createDeal.isPending}>
              {createDeal.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Anfrage anlegen"}
            </Button>

          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
