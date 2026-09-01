import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProgramTemplates } from "@/hooks/usePrograms";
import { CATEGORY_LABELS } from "@/lib/programs";

export function TemplatesTab() {
  const { data: templates, isLoading } = useProgramTemplates();

  if (isLoading) {
    return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Angebotstypen mit Standarddauer, Terminanzahl und Kapazität. Durchläufe erben diese Vorgaben.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {templates?.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.program_key}</p>
                </div>
                <Badge variant="secondary">{CATEGORY_LABELS[t.category]}</Badge>
              </div>
              {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
              <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
                <span>{t.default_sessions} Termin(e)</span>
                {t.default_duration_days ? <span>· {t.default_duration_days} Tage</span> : null}
                {t.default_capacity ? <span>· max. {t.default_capacity} Plätze</span> : null}
                {t.partner ? <span>· {t.partner}</span> : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
