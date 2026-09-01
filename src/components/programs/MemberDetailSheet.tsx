import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMemberEvents } from "@/hooks/useEnrollments";
import { CreateEnrollmentDialog } from "@/components/programs/CreateEnrollmentDialog";
import { PRICE_LABELS, PROGRAM_LABELS, STATUS_LABELS, statusVariant } from "@/lib/programs";
import type { MemberRow } from "@/pages/Members";
import { Plus, ShieldCheck } from "lucide-react";

interface Props {
  member: MemberRow | null;
  onOpenChange: (open: boolean) => void;
}

export function MemberDetailSheet({ member, onOpenChange }: Props) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: events } = useMemberEvents(member?.id);
  const [enrollOpen, setEnrollOpen] = useState(false);

  if (!member) return null;

  const patch = async (updates: Record<string, unknown>) => {
    const { error } = await supabase.from("contacts").update(updates).eq("id", member.id);
    if (error) {
      toast({ title: "Änderung fehlgeschlagen", variant: "destructive" });
      return;
    }
    qc.invalidateQueries({ queryKey: ["members"] });
    qc.invalidateQueries({ queryKey: ["contacts"] });
  };

  return (
    <>
      <Sheet open={!!member} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="space-y-2">
            <SheetTitle className="text-left flex items-center gap-2">
              {member.first_name} {member.last_name}
              {member.is_foundation_member && <ShieldCheck className="h-4 w-4 text-primary" />}
            </SheetTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{PRICE_LABELS[member.current_price_tier]}</Badge>
              {member.member_number && <Badge variant="secondary">Mitglied #{member.member_number}</Badge>}
              {member.companies?.name && <Badge variant="secondary">{member.companies.name}</Badge>}
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>E-Mail</Label>
                <Input defaultValue={member.email ?? ""} onBlur={(e) => patch({ email: e.target.value || null })} />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input defaultValue={member.phone ?? ""} onBlur={(e) => patch({ phone: e.target.value || null })} />
              </div>
              <div className="space-y-2">
                <Label>Sprache</Label>
                <Input defaultValue={member.language} onBlur={(e) => patch({ language: e.target.value || "de" })} />
              </div>
              <div className="space-y-2">
                <Label>Quelle</Label>
                <Input defaultValue={member.source ?? ""} onBlur={(e) => patch({ source: e.target.value || null })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Kampagne</Label>
                <Input defaultValue={member.campaign ?? ""} onBlur={(e) => patch({ campaign: e.target.value || null })} />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Einwilligungen</h4>
              <div className="flex items-center justify-between">
                <Label className="font-normal">Marketing-Kommunikation</Label>
                <Switch
                  checked={member.consent_marketing}
                  onCheckedChange={(v) => patch({ consent_marketing: v, consent_at: new Date().toISOString() })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-normal">Aufzeichnung von Live-Terminen</Label>
                <Switch
                  checked={member.consent_recording}
                  onCheckedChange={(v) => patch({ consent_recording: v, consent_at: new Date().toISOString() })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-normal">Foundation-Mitglied (490 € dauerhaft)</Label>
                <Switch
                  checked={member.is_foundation_member}
                  onCheckedChange={(v) => patch({ is_foundation_member: v, current_price_tier: v ? "foundation_490" : "none" })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Teilnahmen</h4>
                <Button size="sm" variant="secondary" onClick={() => setEnrollOpen(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Hinzufügen
                </Button>
              </div>
              {(member.enrollments ?? []).length ? (
                <div className="space-y-2">
                  {(member.enrollments ?? []).map((e) => (
                    <div key={e.id} className="flex items-center justify-between rounded-md border p-2.5 text-sm">
                      <span>{PROGRAM_LABELS[e.program_type]}</span>
                      <Badge variant={statusVariant(e.status)}>{STATUS_LABELS[e.status]}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Noch keine Teilnahmen.</p>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Verlauf</h4>
              {events?.length ? events.map((e) => (
                <div key={e.id} className="text-sm">
                  <p>{e.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(e.occurred_at).toLocaleString("de-DE")}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">Noch keine Ereignisse.</p>}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <CreateEnrollmentDialog open={enrollOpen} onOpenChange={setEnrollOpen} defaultContactId={member.id} />
    </>
  );
}
