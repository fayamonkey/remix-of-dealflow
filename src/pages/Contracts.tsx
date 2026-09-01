import { useState } from "react";
import { PageBanner } from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, FileSignature, X } from "lucide-react";
import {
  useSubscriptions, useUpdateSubscription, useCreateSubscription,
  useCompanyPackages, useCreatePackage, useAssignSeat, useReleaseSeat,
} from "@/hooks/useContracts";
import { useContacts } from "@/hooks/useContacts";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  PRICE_LABELS, PRICE_TIERS, SUBSCRIPTION_LABELS, SUBSCRIPTION_STATUSES,
  SEAT_STATUS_LABELS, formatDate, formatEuro, subscriptionVariant,
  type PriceTier, type SubscriptionStatus,
} from "@/lib/programs";

function NewSubscriptionDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { data: contacts } = useContacts();
  const create = useCreateSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
  const [contactId, setContactId] = useState("");
  const [tier, setTier] = useState<PriceTier>("standard_690");
  const [status, setStatus] = useState<SubscriptionStatus>("payment_pending");
  const [startDate, setStartDate] = useState("");

  const submit = () => {
    if (!contactId || !user) return;
    create.mutate(
      { contact_id: contactId, price_tier: tier, status, start_date: startDate || null, created_by: user.id },
      {
        onSuccess: () => { toast({ title: "Vertrag angelegt" }); onOpenChange(false); setContactId(""); },
        onError: () => toast({ title: "Anlegen fehlgeschlagen", variant: "destructive" }),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Neue Mitgliedschaft</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Person</Label>
            <Select value={contactId} onValueChange={setContactId}>
              <SelectTrigger><SelectValue placeholder="Person wählen" /></SelectTrigger>
              <SelectContent>
                {contacts?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Kondition</Label>
            <Select value={tier} onValueChange={(v) => setTier(v as PriceTier)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRICE_TIERS.map((t) => <SelectItem key={t} value={t}>{PRICE_LABELS[t]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as SubscriptionStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SUBSCRIPTION_STATUSES.map((s) => <SelectItem key={s} value={s}>{SUBSCRIPTION_LABELS[s]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Beginn</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={submit} disabled={!contactId || create.isPending}>Anlegen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewPackageDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { data: companies } = useCompanies();
  const create = useCreatePackage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState("");
  const [tier, setTier] = useState<PriceTier>("company_5_1900");
  const seatsForTier: Record<string, number> = { company_1_690: 1, company_2_990: 2, company_5_1900: 5 };

  const submit = () => {
    if (!companyId || !user) return;
    create.mutate(
      { company_id: companyId, tier, seats: seatsForTier[tier] ?? 1, created_by: user.id },
      {
        onSuccess: () => { toast({ title: "Firmenpaket angelegt" }); onOpenChange(false); setCompanyId(""); },
        onError: () => toast({ title: "Anlegen fehlgeschlagen", variant: "destructive" }),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Neues Firmenpaket</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Firma</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger><SelectValue placeholder="Firma wählen" /></SelectTrigger>
              <SelectContent>
                {companies?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Paket</Label>
            <Select value={tier} onValueChange={(v) => setTier(v as PriceTier)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="company_1_690">{PRICE_LABELS.company_1_690}</SelectItem>
                <SelectItem value="company_2_990">{PRICE_LABELS.company_2_990}</SelectItem>
                <SelectItem value="company_5_1900">{PRICE_LABELS.company_5_1900}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={submit} disabled={!companyId || create.isPending}>Anlegen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Contracts() {
  const { data: subs, isLoading } = useSubscriptions();
  const { data: packages } = useCompanyPackages();
  const { data: contacts } = useContacts();
  const update = useUpdateSubscription();
  const assignSeat = useAssignSeat();
  const releaseSeat = useReleaseSeat();
  const { toast } = useToast();
  const [subOpen, setSubOpen] = useState(false);
  const [pkgOpen, setPkgOpen] = useState(false);
  const [seatFor, setSeatFor] = useState<string | null>(null);

  const mrr = (subs ?? [])
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + Number(s.monthly_amount || 0), 0);
  const activeCount = (subs ?? []).filter((s) => s.status === "active").length;
  const pastDue = (subs ?? []).filter((s) => s.status === "past_due").length;

  return (
    <div className="space-y-6">
      <PageBanner title="Verträge" description="Mitgliedschaften, Konditionen, Firmenpakete und Plätze.">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => setPkgOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Firmenpaket
          </Button>
          <Button className="w-full sm:w-auto" onClick={() => setSubOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Mitgliedschaft
          </Button>
        </div>
      </PageBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Aktive Mitgliedschaften</p><p className="text-2xl font-semibold tabular-nums">{activeCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">MRR</p><p className="text-2xl font-semibold tabular-nums">{formatEuro(mrr)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Überfällig</p><p className="text-2xl font-semibold tabular-nums">{pastDue}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Firmenpakete</p><p className="text-2xl font-semibold tabular-nums">{packages?.length ?? 0}</p></CardContent></Card>
      </div>

      <Tabs defaultValue="subs">
        <TabsList>
          <TabsTrigger value="subs">Mitgliedschaften</TabsTrigger>
          <TabsTrigger value="packages">Firmenpakete</TabsTrigger>
        </TabsList>

        <TabsContent value="subs" className="mt-4">
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !subs?.length ? (
            <Card>
              <CardContent className="flex flex-col items-center py-14">
                <FileSignature className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <h3 className="font-semibold">Noch keine Mitgliedschaften</h3>
                <p className="text-muted-foreground text-sm mb-4">Lege die erste Kohorten-Mitgliedschaft an.</p>
                <Button variant="secondary" onClick={() => setSubOpen(true)}><Plus className="h-4 w-4 mr-2" /> Mitgliedschaft anlegen</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Person</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Kondition</TableHead>
                    <TableHead className="hidden md:table-cell text-right">Betrag</TableHead>
                    <TableHead className="hidden lg:table-cell">Beginn</TableHead>
                    <TableHead className="hidden lg:table-cell">Ende</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subs.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        {s.contacts ? `${s.contacts.first_name} ${s.contacts.last_name}` : s.companies?.name ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={s.status}
                          onValueChange={(v) =>
                            update.mutate(
                              { id: s.id, status: v as SubscriptionStatus },
                              { onError: () => toast({ title: "Änderung fehlgeschlagen", variant: "destructive" }) },
                            )
                          }
                        >
                          <SelectTrigger className="h-8 w-44"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {SUBSCRIPTION_STATUSES.map((x) => <SelectItem key={x} value={x}>{SUBSCRIPTION_LABELS[x]}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={subscriptionVariant(s.status)}>{PRICE_LABELS[s.price_tier]}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right tabular-nums">{formatEuro(Number(s.monthly_amount))}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">{formatDate(s.start_date)}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">{formatDate(s.end_date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="packages" className="mt-4 space-y-3">
          {!packages?.length ? (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Noch keine Firmenpakete.</CardContent></Card>
          ) : (
            packages.map((p) => {
              const seats = (p.package_seats ?? []).filter((s) => s.status !== "released");
              const free = p.seats - seats.length;
              return (
                <Card key={p.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{p.companies?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {PRICE_LABELS[p.tier]} · {formatEuro(Number(p.monthly_amount))} / Monat
                        </p>
                      </div>
                      <Badge variant={free > 0 ? "outline" : "secondary"}>
                        {seats.length} / {p.seats} Plätze belegt{free > 0 ? ` · ${free} frei` : ""}
                      </Badge>
                    </div>
                    <div className="space-y-1.5">
                      {seats.map((s) => (
                        <div key={s.id} className="flex items-center justify-between text-sm">
                          <span>{s.contacts ? `${s.contacts.first_name} ${s.contacts.last_name}` : "Nicht zugewiesen"}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{SEAT_STATUS_LABELS[s.status]}</span>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => releaseSeat.mutate(s.id)}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {seatFor === p.id ? (
                      <div className="flex gap-2">
                        <Select
                          onValueChange={(v) =>
                            assignSeat.mutate(
                              { package_id: p.id, contact_id: v },
                              {
                                onSuccess: () => { setSeatFor(null); toast({ title: "Platz zugewiesen" }); },
                                onError: (e: unknown) =>
                                  toast({
                                    title: "Zuweisung nicht möglich",
                                    description: free <= 0 ? "Das Paket hat keine freien Plätze mehr." : undefined,
                                    variant: "destructive",
                                  }),
                              },
                            )
                          }
                        >
                          <SelectTrigger className="h-9"><SelectValue placeholder="Person wählen" /></SelectTrigger>
                          <SelectContent>
                            {contacts?.map((c) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" onClick={() => setSeatFor(null)}>Abbrechen</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="secondary" disabled={free <= 0} onClick={() => setSeatFor(p.id)}>
                        <Plus className="h-4 w-4 mr-2" /> Platz zuweisen
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      <NewSubscriptionDialog open={subOpen} onOpenChange={setSubOpen} />
      <NewPackageDialog open={pkgOpen} onOpenChange={setPkgOpen} />
    </div>
  );
}
