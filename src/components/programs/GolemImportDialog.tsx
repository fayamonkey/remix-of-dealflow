import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import { PROGRAM_LABELS, PROGRAM_TYPES, type ProgramType } from "@/lib/programs";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Row {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  language?: string;
  source?: string;
  campaign?: string;
  status?: string;
}

function parseCsv(text: string): Row[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const delimiter = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ""));
  const pick = (cells: string[], names: string[]) => {
    for (const n of names) {
      const i = headers.indexOf(n);
      if (i >= 0 && cells[i]) return cells[i].trim().replace(/^"|"$/g, "");
    }
    return "";
  };
  return lines.slice(1).map((line) => {
    const cells = line.split(delimiter);
    const full = pick(cells, ["name", "vollständiger name", "full name"]);
    let first = pick(cells, ["first_name", "vorname", "firstname"]);
    let last = pick(cells, ["last_name", "nachname", "lastname"]);
    if (!first && full) {
      const parts = full.split(" ");
      first = parts.shift() ?? "";
      last = parts.join(" ");
    }
    return {
      first_name: first,
      last_name: last || "—",
      email: pick(cells, ["email", "e-mail", "mail"]),
      phone: pick(cells, ["phone", "telefon"]),
      company: pick(cells, ["company", "firma", "unternehmen"]),
      language: pick(cells, ["language", "sprache"]),
      source: pick(cells, ["source", "quelle"]),
      campaign: pick(cells, ["campaign", "kampagne"]),
      status: pick(cells, ["status", "teilnahme"]),
    };
  }).filter((r) => r.email || r.first_name);
}

export function GolemImportDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [programType, setProgramType] = useState<ProgramType>("free_workshop");
  const [campaign, setCampaign] = useState("");
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    const text = await file.text();
    const parsed = parseCsv(text);
    setRows(parsed);
    if (!parsed.length) toast({ title: "Keine verwertbaren Zeilen gefunden", variant: "destructive" });
  };

  const runImport = async () => {
    if (!user || !rows.length) return;
    setBusy(true);
    let created = 0;
    let matched = 0;
    try {
      for (const row of rows) {
        let contactId: string | null = null;
        if (row.email) {
          const { data: existing } = await supabase.from("contacts").select("id").eq("email", row.email).maybeSingle();
          if (existing) { contactId = existing.id; matched++; }
        }
        if (!contactId) {
          const { data: inserted, error } = await supabase
            .from("contacts")
            .insert({
              first_name: row.first_name || "Unbekannt",
              last_name: row.last_name || "—",
              email: row.email || null,
              phone: row.phone || null,
              language: row.language || "de",
              source: row.source || "Golem",
              campaign: row.campaign || campaign || null,
              created_by: user.id,
            })
            .select("id")
            .single();
          if (error) continue;
          contactId = inserted.id;
          created++;
        }
        const statusRaw = (row.status || "").toLowerCase();
        const status =
          statusRaw.includes("no") ? "no_show" :
          statusRaw.includes("teil") || statusRaw.includes("attend") ? "attended" :
          statusRaw.includes("bezahl") || statusRaw.includes("paid") ? "active" : "registered";

        await supabase.from("enrollments").insert({
          contact_id: contactId,
          program_type: programType,
          status: status as never,
          funnel_source: row.source || "Golem",
          golem_campaign: row.campaign || campaign || null,
          created_by: user.id,
        });
      }
      qc.invalidateQueries({ queryKey: ["contacts"] });
      qc.invalidateQueries({ queryKey: ["enrollments"] });
      toast({ title: "Import abgeschlossen", description: `${created} neu, ${matched} zugeordnet, ${rows.length} Teilnahmen angelegt.` });
      onOpenChange(false);
      setRows([]);
    } catch {
      toast({ title: "Import fehlgeschlagen", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Teilnehmerliste importieren</DialogTitle>
          <DialogDescription>
            CSV aus Golem oder einem Anmeldeformular. Erkannte Spalten: Vorname, Nachname, Name, E-Mail, Telefon, Firma, Sprache, Quelle, Kampagne, Status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Programm für alle Zeilen</Label>
            <Select value={programType} onValueChange={(v) => setProgramType(v as ProgramType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROGRAM_TYPES.map((p) => <SelectItem key={p} value={p}>{PROGRAM_LABELS[p]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Kampagne (falls nicht in der CSV)</Label>
            <Input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="z.B. Golem Herbst 2026" />
          </div>
          <div className="space-y-2">
            <Label>CSV-Datei</Label>
            <Input type="file" accept=".csv,text/csv" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>

          {rows.length > 0 && (
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium mb-1">{rows.length} Zeilen erkannt</p>
              <p className="text-muted-foreground text-xs">
                Vorschau: {rows.slice(0, 3).map((r) => `${r.first_name} ${r.last_name}`).join(", ")}
                {rows.length > 3 ? " …" : ""}
              </p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button onClick={runImport} disabled={busy || !rows.length}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4 mr-2" /> {rows.length} importieren</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
