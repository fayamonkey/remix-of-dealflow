# CRM-Ausbau nach Handoff: Programme, Runs, Preise, Zugänge

Ziel: Das CRM bildet Gratis-Workshop, Bootcamp (4 Wochen / 3 Termine) und Kohorte vollständig ab — mit echten Programmdurchläufen, Terminen, Anwesenheit, nachvollziehbarer Preisberechtigung, Zugängen, Verträgen/Seats und einer Operations-Inbox für Widersprüche.

Das heutige System hat bereits: Kontakte, Firmen, Pipeline, Aktivitäten, Tasks, Teilnahmen (`enrollments`) mit Checklisten und Ereignis-Log, Golem-CSV-Import. Das bleibt erhalten und wird erweitert — nichts wird gelöscht.

## Kernproblem heute

Eine Teilnahme hängt heute direkt am Programmtyp, nicht an einem konkreten Durchlauf. Es gibt keine Termine, keine Anwesenheit, keine Berechtigungshistorie und keine Verträge. Genau das kommt jetzt dazu.

## Phase 1 — Programm-Struktur (Runs & Sessions)

- **Programmvorlagen**: `free_live_workshop`, `digital_twin_bootcamp`, `monthly_ai_team_cohort`, `ai_company_day_workshop` + freie Vorlagen für B2B. Mit Kategorie, Standarddauer, Sessionanzahl, Kapazität, Partner, Standard-Checkliste.
- **Durchläufe (Runs)**: konkreter Workshop-Termin, konkrete Bootcamp-Runde, Kohorten-Monatsmodul. Mit Status (Entwurf / Anmeldung offen / läuft / abgeschlossen / abgesagt), Kapazität, Partner, Kampagne, Meeting- und Aufzeichnungslinks.
- **Termine (Sessions)**: einzelne Live-Termine je Run (Bootcamp: 3 Termine, Woche 0 / 2 / 4; Kohorte: Workshop + Catch-up).
- **Teilnahmen** hängen künftig an einem Run statt nur an einem Programmtyp (bestehende Datensätze werden migriert, alte Anzeige bleibt funktionsfähig).
- **Anwesenheit** je Termin: angemeldet / teilgenommen / teilweise / No-show — inkl. Listen-Erfassung pro Termin.
- Checklisten-Instanzen werden mit relativen Fälligkeiten aus dem Run-Startdatum erzeugt; spätere Vorlagenänderungen ändern laufende Instanzen nicht.

## Phase 2 — Preise, Berechtigungen, Verträge, Zugänge

- **Preisberechtigungen** als eigene Einträge statt eines Feldes: Foundation 490 (Grund, erzeugendes Bootcamp, Datum, Status gültig/verfallen), Frühpreis 590 (erste 50 reguläre Mitgliedsnummern), Regulär 690, Firmenpakete 690 / 990 / 1.900.
- Regeln: Foundation nur bei live abgeschlossenem Bootcamp und ununterbrochener Mitgliedschaft; direkter Kohorteneinstieg erzeugt Onboarding per Aufzeichnung, aber keine Foundation-Berechtigung; Mitgliedsnummern werden nicht von Test- oder stornierten Datensätzen verbraucht; ob 590 nach Wiedereintritt bleibt, ist ein **konfigurierbarer Schalter** (Standard: nein).
- **Manuelle Preisüberschreibung** mit Grund, Autor, Zeitpunkt, optionalem Ablauf. Historische Preise bleiben unverändert.
- **Verträge/Mitgliedschaften**: Status (Warteliste, Zahlung offen, Onboarding, aktiv, überfällig, Kündigung geplant, gekündigt, Alumni), Beginn, Kündigungseingang, berechnetes Ende, Betrag, Währung, brutto/netto, Intervall.
- **Firmenpakete & Seats**: Paketgröße, belegte/freie Plätze, Zuweisung an Personen mit Historie; Überbelegung wird verhindert.
- **Zugänge**: nicht nötig / offen / erteilt / Fehler / gesperrt / entzogen — je Person und Bereich (Community, Aufzeichnung, Kohorte).

## Phase 3 — Betrieb: Inbox, Import, Dashboard, Reports

- **Operations-Inbox** mit automatisch erkannten Widersprüchen: bezahlt ohne Zugang, Zugang ohne Berechtigung, aktiv aber überfällig, gekündigt mit aktivem Zugang, Firmenpaket überbelegt, Foundation-Preis ohne gültige Berechtigung, Importfehler, mögliche Dubletten, fehlende Einwilligung, überfällige Aufgaben. Nichts wird still korrigiert.
- **Golem-Import v2**: Datei-Upload mit Vorschau, freier Spaltenzuordnung (DE/EN), Dedupe über normalisierte E-Mail, First-touch bleibt erhalten, leere Werte überschreiben nichts, wiederholter Import erzeugt keine Doubletten, Importbericht mit Zeilenfehlern, unbekannte Spalten werden angezeigt.
- **Dashboard** auf die Kennzahlen des Handoffs umgestellt: Anmeldungen nächster Workshop, Kapazität, Attendance/No-show, Conversion Workshop→Bootcamp→Kohorte, aktive Mitglieder, Mix Foundation/Früh/Regulär/Firma, MRR, Churn, Kapazität bis 400, bezahlt-ohne-Zugang, offene Aufgaben. Jede Kennzahl führt in die Liste dahinter.
- **Mitglieder-Detailansicht** erweitert: Programmgeschichte, Preis- und Berechtigungsverlauf, Vertrag, Zugänge, Einwilligungen (mit Version/Datum), Timeline, Warnungen.
- **Reports**: Funnel nach Quelle/Kampagne, Attendance, Bootcamp-Abschlüsse, MRR/Churn, Zugangs- und Datenqualitätslisten.

## Ausdrücklich nicht in diesem Auftrag

- KI-Mitarbeiter-Fabrik (Tracking der gebauten KI-Mitarbeiter) — Phase 4
- Mira / MCP-Server und Payment-Provider-Anbindung — Phase 5
- Alle unter „offene Entscheidungen“ genannten Punkte bleiben konfigurierbar und werden nicht erfunden

## Technische Umsetzung

- Neue Tabellen in der Cloud-Datenbank: `program_templates`, `program_runs`, `sessions`, `session_attendance`, `price_grants`, `subscriptions`, `company_packages`, `package_seats`, `access_grants`, `consents`, `ops_issues`, `import_batches`, `import_rows`, `audit_events`; `enrollments` erhält `program_run_id`.
- Alle Tabellen mit GRANTs + RLS über die bestehende `can_view_record`-Logik (team-weit sichtbar, nur `authenticated`).
- Preis- und Berechtigungslogik als Datenbankfunktionen/Trigger, damit sie nicht im Frontend hängt; jede sensible Änderung schreibt ein Audit-Event.
- Widerspruchserkennung als serverseitige Funktion, deren Ergebnisse in `ops_issues` landen (idempotent, wiederholbar).
- Frontend: bestehende Navigation bleibt; `Programs` bekommt Vorlagen/Runs/Sessions-Ansicht, neue Seite `Verträge`, `Operations-Inbox` als Dashboard-Bereich, Members-Detail erweitert.
- Umsetzung in der oben genannten Reihenfolge, jede Phase lauffähig und einzeln prüfbar.
