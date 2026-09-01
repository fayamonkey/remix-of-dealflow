import { useState } from "react";
import { PageBanner } from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, CheckCircle2, EyeOff, Inbox } from "lucide-react";
import { useOpsIssues, useDetectIssues, useUpdateIssue } from "@/hooks/useOpsIssues";
import { useToast } from "@/hooks/use-toast";
import { ISSUE_STATUS_LABELS, formatDateTime, type IssueStatus } from "@/lib/programs";

const SEVERITY_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
};

export default function OpsInbox() {
  const [status, setStatus] = useState<IssueStatus | "all">("open");
  const { data: issues, isLoading } = useOpsIssues(status);
  const detect = useDetectIssues();
  const update = useUpdateIssue();
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <PageBanner title="Inbox" description="Auffälligkeiten im Betrieb: fehlende Zahlungen, offene Zugänge, unklare Konditionen.">
        <Button
          className="w-full sm:w-auto"
          disabled={detect.isPending}
          onClick={() =>
            detect.mutate(undefined, {
              onSuccess: (n) => toast({ title: `${n ?? 0} Punkte geprüft` }),
              onError: () => toast({ title: "Prüfung fehlgeschlagen", variant: "destructive" }),
            })
          }
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${detect.isPending ? "animate-spin" : ""}`} /> Jetzt prüfen
        </Button>
      </PageBanner>

      <Select value={status} onValueChange={(v) => setStatus(v as IssueStatus | "all")}>
        <SelectTrigger className="w-full sm:w-52"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle</SelectItem>
          {(Object.keys(ISSUE_STATUS_LABELS) as IssueStatus[]).map((s) => (
            <SelectItem key={s} value={s}>{ISSUE_STATUS_LABELS[s]}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : !issues?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <Inbox className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="font-semibold">Alles sauber</h3>
            <p className="text-muted-foreground text-sm">Keine offenen Punkte. Prüfung neu starten, wenn sich Daten geändert haben.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {issues.map((i) => (
            <Card key={i.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={SEVERITY_VARIANT[i.severity] ?? "secondary"}>{i.kind}</Badge>
                    {i.status !== "open" && <Badge variant="outline">{ISSUE_STATUS_LABELS[i.status]}</Badge>}
                  </div>
                  <p className="text-sm font-medium">{i.title}</p>
                  {i.details && <p className="text-sm text-muted-foreground">{i.details}</p>}
                  <p className="text-xs text-muted-foreground">
                    {i.contacts ? `${i.contacts.first_name} ${i.contacts.last_name} · ` : i.companies ? `${i.companies.name} · ` : ""}
                    {formatDateTime(i.detected_at)}
                  </p>
                </div>
                {i.status === "open" && (
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="secondary" onClick={() => update.mutate({ id: i.id, status: "resolved" })}>
                      <CheckCircle2 className="h-4 w-4 mr-1.5" /> Erledigt
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: i.id, status: "ignored" })}>
                      <EyeOff className="h-4 w-4 mr-1.5" /> Ignorieren
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
