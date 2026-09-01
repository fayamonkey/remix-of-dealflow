-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE public.program_category AS ENUM ('free_workshop','bootcamp','cohort','corporate_workshop','consulting');
CREATE TYPE public.run_status AS ENUM ('draft','published','registration_open','running','completed','cancelled');
CREATE TYPE public.session_type AS ENUM ('live','catch_up','onboarding','recorded','other');
CREATE TYPE public.attendance_status AS ENUM ('registered','attended','partial','no_show','excused');
CREATE TYPE public.grant_status AS ENUM ('active','expired','revoked');
CREATE TYPE public.subscription_status AS ENUM ('waitlist','invited','payment_pending','onboarding_required','onboarding_active','active','past_due','cancellation_scheduled','cancelled','alumni');
CREATE TYPE public.access_state AS ENUM ('not_required','pending','granted','sync_error','suspended','revoked');
CREATE TYPE public.seat_status AS ENUM ('assigned','invited','active','released');
CREATE TYPE public.issue_status AS ENUM ('open','acknowledged','resolved','ignored');
CREATE TYPE public.import_status AS ENUM ('pending','previewed','completed','failed');

-- =========================================================
-- HELPER: can this user see data about this contact?
-- =========================================================
CREATE OR REPLACE FUNCTION public.can_view_contact(_contact_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.contacts c
    WHERE c.id = _contact_id AND public.can_view_record(c.created_by)
  )
$$;

-- =========================================================
-- APP SETTINGS (offene Entscheidungen konfigurierbar halten)
-- =========================================================
CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings readable" ON public.app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage settings" ON public.app_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER app_settings_updated_at BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.app_settings(key, value, description) VALUES
  ('early_price_survives_rejoin', 'false'::jsonb, 'Bleibt der 590-EUR-Frühpreis nach Kündigung und Wiedereintritt erhalten? (offen mit Dirk/Golem)'),
  ('cohort_capacity', '400'::jsonb, 'Erste Kapazitätsgrenze der Kohorte'),
  ('early_member_slots', '50'::jsonb, 'Anzahl der Frühpreis-Plätze (590 EUR)');

-- =========================================================
-- PROGRAM TEMPLATES
-- =========================================================
CREATE TABLE public.program_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_key text NOT NULL UNIQUE,
  name text NOT NULL,
  category public.program_category NOT NULL,
  description text,
  default_duration_days integer,
  default_sessions integer NOT NULL DEFAULT 1,
  default_capacity integer,
  partner text,
  active boolean NOT NULL DEFAULT true,
  prerequisites text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.program_templates TO authenticated;
GRANT ALL ON public.program_templates TO service_role;
ALTER TABLE public.program_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates readable" ON public.program_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "templates insert" ON public.program_templates FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "templates update" ON public.program_templates FOR UPDATE TO authenticated USING (public.can_view_record(created_by));
CREATE POLICY "templates delete" ON public.program_templates FOR DELETE TO authenticated USING (public.can_view_record(created_by));
CREATE TRIGGER program_templates_updated_at BEFORE UPDATE ON public.program_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.program_templates (program_key, name, category, description, default_duration_days, default_sessions, default_capacity, partner) VALUES
  ('free_live_workshop','Dein erster KI-Mitarbeiter','free_workshop','Kostenloser Live-Workshop, ca. 2 Stunden, hands-on Follow-along.',1,1,NULL,'Golem Karrierewelt'),
  ('digital_twin_bootcamp','Das KI-Bootcamp — dein digitaler Zwilling','bootcamp','Vier Wochen, drei Live-Termine (Woche 0, 2, 4). 690 EUR pro Person.',28,3,NULL,'Golem Karrierewelt'),
  ('monthly_ai_team_cohort','Dein KI-Team','cohort','Fortlaufendes monatliches KI-Live-Training. Pro Monat ein Workshop und ein Catch-up.',30,2,400,'Golem Karrierewelt'),
  ('ai_company_day_workshop','KI-Firma-Workshop','corporate_workshop','Ein Tag, maximal 12 Teilnehmer, 2.300 EUR pro Platz.',1,1,12,NULL);

-- =========================================================
-- PROGRAM RUNS
-- =========================================================
CREATE TABLE public.program_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.program_templates(id) ON DELETE RESTRICT,
  name text NOT NULL,
  start_date date,
  end_date date,
  timezone text NOT NULL DEFAULT 'Europe/Berlin',
  status public.run_status NOT NULL DEFAULT 'draft',
  max_seats integer,
  partner text,
  campaign text,
  lead_trainer text,
  meeting_url text,
  recording_url text,
  community_area text,
  notes text,
  parent_run_id uuid REFERENCES public.program_runs(id) ON DELETE SET NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.program_runs TO authenticated;
GRANT ALL ON public.program_runs TO service_role;
ALTER TABLE public.program_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "runs readable" ON public.program_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "runs insert" ON public.program_runs FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "runs update" ON public.program_runs FOR UPDATE TO authenticated USING (public.can_view_record(created_by));
CREATE POLICY "runs delete" ON public.program_runs FOR DELETE TO authenticated USING (public.can_view_record(created_by));
CREATE TRIGGER program_runs_updated_at BEFORE UPDATE ON public.program_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_program_runs_template ON public.program_runs(template_id);

-- =========================================================
-- SESSIONS
-- =========================================================
CREATE TABLE public.program_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.program_runs(id) ON DELETE CASCADE,
  session_type public.session_type NOT NULL DEFAULT 'live',
  title text NOT NULL,
  position integer NOT NULL DEFAULT 1,
  starts_at timestamptz,
  ends_at timestamptz,
  meeting_url text,
  recording_url text,
  materials_url text,
  status public.run_status NOT NULL DEFAULT 'draft',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.program_sessions TO authenticated;
GRANT ALL ON public.program_sessions TO service_role;
ALTER TABLE public.program_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions readable" ON public.program_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "sessions write" ON public.program_sessions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.program_runs r WHERE r.id = run_id AND public.can_view_record(r.created_by)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.program_runs r WHERE r.id = run_id AND public.can_view_record(r.created_by)));
CREATE TRIGGER program_sessions_updated_at BEFORE UPDATE ON public.program_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_program_sessions_run ON public.program_sessions(run_id);

-- =========================================================
-- ENROLLMENTS -> RUN
-- =========================================================
ALTER TABLE public.enrollments
  ADD COLUMN program_run_id uuid REFERENCES public.program_runs(id) ON DELETE SET NULL,
  ADD COLUMN recorded_bootcamp_required boolean NOT NULL DEFAULT false,
  ADD COLUMN completed_at timestamptz,
  ADD COLUMN is_test_record boolean NOT NULL DEFAULT false;
CREATE INDEX idx_enrollments_run ON public.enrollments(program_run_id);

-- =========================================================
-- ATTENDANCE
-- =========================================================
CREATE TABLE public.session_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.program_sessions(id) ON DELETE CASCADE,
  enrollment_id uuid REFERENCES public.enrollments(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  status public.attendance_status NOT NULL DEFAULT 'registered',
  note text,
  recorded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, contact_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_attendance TO authenticated;
GRANT ALL ON public.session_attendance TO service_role;
ALTER TABLE public.session_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attendance select" ON public.session_attendance FOR SELECT TO authenticated USING (public.can_view_contact(contact_id));
CREATE POLICY "attendance insert" ON public.session_attendance FOR INSERT TO authenticated WITH CHECK (public.can_view_contact(contact_id));
CREATE POLICY "attendance update" ON public.session_attendance FOR UPDATE TO authenticated USING (public.can_view_contact(contact_id));
CREATE POLICY "attendance delete" ON public.session_attendance FOR DELETE TO authenticated USING (public.can_view_contact(contact_id));
CREATE TRIGGER session_attendance_updated_at BEFORE UPDATE ON public.session_attendance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- PRICE GRANTS
-- =========================================================
CREATE TABLE public.price_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  tier public.price_tier NOT NULL,
  monthly_amount numeric NOT NULL DEFAULT 0,
  reason text NOT NULL,
  status public.grant_status NOT NULL DEFAULT 'active',
  source_enrollment_id uuid REFERENCES public.enrollments(id) ON DELETE SET NULL,
  is_manual_override boolean NOT NULL DEFAULT false,
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_reason text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.price_grants TO authenticated;
GRANT ALL ON public.price_grants TO service_role;
ALTER TABLE public.price_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "grants select" ON public.price_grants FOR SELECT TO authenticated USING (public.can_view_contact(contact_id));
CREATE POLICY "grants insert" ON public.price_grants FOR INSERT TO authenticated WITH CHECK (public.can_view_contact(contact_id));
CREATE POLICY "grants update" ON public.price_grants FOR UPDATE TO authenticated USING (public.can_view_contact(contact_id));
CREATE TRIGGER price_grants_updated_at BEFORE UPDATE ON public.price_grants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_price_grants_contact ON public.price_grants(contact_id);

CREATE OR REPLACE FUNCTION public.price_grants_set_amount()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.monthly_amount IS NULL OR NEW.monthly_amount = 0 THEN
    NEW.monthly_amount := public.price_for_tier(NEW.tier);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER price_grants_amount BEFORE INSERT OR UPDATE ON public.price_grants
  FOR EACH ROW EXECUTE FUNCTION public.price_grants_set_amount();

-- =========================================================
-- COMPANY PACKAGES + SEATS
-- =========================================================
CREATE TABLE public.company_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  tier public.price_tier NOT NULL,
  seats integer NOT NULL DEFAULT 1,
  monthly_amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  tax_included boolean NOT NULL DEFAULT true,
  tax_rate numeric NOT NULL DEFAULT 19,
  billing_interval text NOT NULL DEFAULT 'monthly',
  status public.subscription_status NOT NULL DEFAULT 'active',
  start_date date,
  end_date date,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_packages TO authenticated;
GRANT ALL ON public.company_packages TO service_role;
ALTER TABLE public.company_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "packages select" ON public.company_packages FOR SELECT TO authenticated USING (public.can_view_record(created_by));
CREATE POLICY "packages insert" ON public.company_packages FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "packages update" ON public.company_packages FOR UPDATE TO authenticated USING (public.can_view_record(created_by));
CREATE POLICY "packages delete" ON public.company_packages FOR DELETE TO authenticated USING (public.can_view_record(created_by));
CREATE TRIGGER company_packages_updated_at BEFORE UPDATE ON public.company_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.package_seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.company_packages(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  status public.seat_status NOT NULL DEFAULT 'assigned',
  assigned_at timestamptz NOT NULL DEFAULT now(),
  released_at timestamptz,
  note text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.package_seats TO authenticated;
GRANT ALL ON public.package_seats TO service_role;
ALTER TABLE public.package_seats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seats select" ON public.package_seats FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.company_packages p WHERE p.id = package_id AND public.can_view_record(p.created_by)));
CREATE POLICY "seats write" ON public.package_seats FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.company_packages p WHERE p.id = package_id AND public.can_view_record(p.created_by)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.company_packages p WHERE p.id = package_id AND public.can_view_record(p.created_by)));
CREATE TRIGGER package_seats_updated_at BEFORE UPDATE ON public.package_seats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Überbelegung verhindern
CREATE OR REPLACE FUNCTION public.package_seats_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_seats integer; v_used integer;
BEGIN
  IF NEW.status = 'released' THEN RETURN NEW; END IF;
  SELECT seats INTO v_seats FROM public.company_packages WHERE id = NEW.package_id;
  SELECT count(*) INTO v_used FROM public.package_seats
   WHERE package_id = NEW.package_id AND status <> 'released' AND id <> COALESCE(NEW.id,'00000000-0000-0000-0000-000000000000'::uuid);
  IF v_used >= COALESCE(v_seats,0) THEN
    RAISE EXCEPTION 'Firmenpaket hat nur % Plätze — alle sind belegt. Paket erweitern oder Platz freigeben.', v_seats;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER package_seats_guard_trg BEFORE INSERT OR UPDATE ON public.package_seats
  FOR EACH ROW EXECUTE FUNCTION public.package_seats_guard();

-- =========================================================
-- SUBSCRIPTIONS
-- =========================================================
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  package_id uuid REFERENCES public.company_packages(id) ON DELETE SET NULL,
  enrollment_id uuid REFERENCES public.enrollments(id) ON DELETE SET NULL,
  status public.subscription_status NOT NULL DEFAULT 'payment_pending',
  price_tier public.price_tier NOT NULL DEFAULT 'none',
  monthly_amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  tax_included boolean NOT NULL DEFAULT true,
  tax_rate numeric NOT NULL DEFAULT 19,
  billing_interval text NOT NULL DEFAULT 'monthly',
  start_date date,
  cancel_requested_at timestamptz,
  end_date date,
  cancel_reason text,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subs select" ON public.subscriptions FOR SELECT TO authenticated USING (public.can_view_record(created_by));
CREATE POLICY "subs insert" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "subs update" ON public.subscriptions FOR UPDATE TO authenticated USING (public.can_view_record(created_by));
CREATE POLICY "subs delete" ON public.subscriptions FOR DELETE TO authenticated USING (public.can_view_record(created_by));
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_subscriptions_contact ON public.subscriptions(contact_id);

-- Foundation-Berechtigung verfällt bei Unterbrechung
CREATE OR REPLACE FUNCTION public.subscription_status_effects()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.monthly_amount IS NULL OR NEW.monthly_amount = 0 THEN
    NEW.monthly_amount := public.price_for_tier(NEW.price_tier);
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled' AND NEW.contact_id IS NOT NULL THEN
    UPDATE public.price_grants
       SET status = 'expired', revoked_at = now(),
           revoked_reason = 'Mitgliedschaft unterbrochen (Kündigung wirksam)'
     WHERE contact_id = NEW.contact_id AND tier = 'foundation_490' AND status = 'active';
    UPDATE public.contacts SET is_foundation_member = false WHERE id = NEW.contact_id;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER subscriptions_effects BEFORE INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.subscription_status_effects();

-- =========================================================
-- ACCESS GRANTS
-- =========================================================
CREATE TABLE public.access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  area text NOT NULL,
  status public.access_state NOT NULL DEFAULT 'pending',
  granted_at timestamptz,
  revoked_at timestamptz,
  last_error text,
  note text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contact_id, area)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_grants TO authenticated;
GRANT ALL ON public.access_grants TO service_role;
ALTER TABLE public.access_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "access select" ON public.access_grants FOR SELECT TO authenticated USING (public.can_view_contact(contact_id));
CREATE POLICY "access insert" ON public.access_grants FOR INSERT TO authenticated WITH CHECK (public.can_view_contact(contact_id));
CREATE POLICY "access update" ON public.access_grants FOR UPDATE TO authenticated USING (public.can_view_contact(contact_id));
CREATE POLICY "access delete" ON public.access_grants FOR DELETE TO authenticated USING (public.can_view_contact(contact_id));
CREATE TRIGGER access_grants_updated_at BEFORE UPDATE ON public.access_grants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- CONSENTS
-- =========================================================
CREATE TABLE public.consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  kind text NOT NULL,
  granted boolean NOT NULL DEFAULT false,
  version text,
  source text,
  granted_at timestamptz,
  withdrawn_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.consents TO authenticated;
GRANT ALL ON public.consents TO service_role;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "consents select" ON public.consents FOR SELECT TO authenticated USING (public.can_view_contact(contact_id));
CREATE POLICY "consents insert" ON public.consents FOR INSERT TO authenticated WITH CHECK (public.can_view_contact(contact_id));
CREATE POLICY "consents update" ON public.consents FOR UPDATE TO authenticated USING (public.can_view_contact(contact_id));
CREATE TRIGGER consents_updated_at BEFORE UPDATE ON public.consents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- OPS ISSUES
-- =========================================================
CREATE TABLE public.ops_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  title text NOT NULL,
  details text,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  entity_type text,
  entity_id uuid,
  dedupe_key text UNIQUE,
  status public.issue_status NOT NULL DEFAULT 'open',
  detected_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ops_issues TO authenticated;
GRANT ALL ON public.ops_issues TO service_role;
ALTER TABLE public.ops_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "issues select" ON public.ops_issues FOR SELECT TO authenticated
  USING (contact_id IS NULL OR public.can_view_contact(contact_id));
CREATE POLICY "issues insert" ON public.ops_issues FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "issues update" ON public.ops_issues FOR UPDATE TO authenticated
  USING (contact_id IS NULL OR public.can_view_contact(contact_id));
CREATE POLICY "issues delete" ON public.ops_issues FOR DELETE TO authenticated
  USING (contact_id IS NULL OR public.can_view_contact(contact_id));
CREATE TRIGGER ops_issues_updated_at BEFORE UPDATE ON public.ops_issues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- IMPORT BATCHES + ROWS
-- =========================================================
CREATE TABLE public.import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text,
  file_hash text,
  source text,
  campaign text,
  program_run_id uuid REFERENCES public.program_runs(id) ON DELETE SET NULL,
  mapping jsonb NOT NULL DEFAULT '{}'::jsonb,
  unknown_columns text[] NOT NULL DEFAULT '{}',
  status public.import_status NOT NULL DEFAULT 'pending',
  rows_total integer NOT NULL DEFAULT 0,
  rows_created integer NOT NULL DEFAULT 0,
  rows_updated integer NOT NULL DEFAULT 0,
  rows_skipped integer NOT NULL DEFAULT 0,
  rows_failed integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.import_batches TO authenticated;
GRANT ALL ON public.import_batches TO service_role;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "batches select" ON public.import_batches FOR SELECT TO authenticated USING (public.can_view_record(created_by));
CREATE POLICY "batches insert" ON public.import_batches FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "batches update" ON public.import_batches FOR UPDATE TO authenticated USING (public.can_view_record(created_by));
CREATE POLICY "batches delete" ON public.import_batches FOR DELETE TO authenticated USING (public.can_view_record(created_by));
CREATE TRIGGER import_batches_updated_at BEFORE UPDATE ON public.import_batches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.import_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  row_number integer NOT NULL,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  normalized_email text,
  idempotency_key text,
  result text NOT NULL DEFAULT 'pending',
  error text,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  enrollment_id uuid REFERENCES public.enrollments(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.import_rows TO authenticated;
GRANT ALL ON public.import_rows TO service_role;
ALTER TABLE public.import_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rows select" ON public.import_rows FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.import_batches b WHERE b.id = batch_id AND public.can_view_record(b.created_by)));
CREATE POLICY "rows write" ON public.import_rows FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.import_batches b WHERE b.id = batch_id AND public.can_view_record(b.created_by)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.import_batches b WHERE b.id = batch_id AND public.can_view_record(b.created_by)));
CREATE UNIQUE INDEX idx_import_rows_idem ON public.import_rows(batch_id, idempotency_key) WHERE idempotency_key IS NOT NULL;

-- =========================================================
-- AUDIT EVENTS
-- =========================================================
CREATE TABLE public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type text NOT NULL DEFAULT 'human',
  actor_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE,
  delta jsonb NOT NULL DEFAULT '{}'::jsonb,
  reason text,
  correlation_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_events TO authenticated;
GRANT ALL ON public.audit_events TO service_role;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit select" ON public.audit_events FOR SELECT TO authenticated
  USING (contact_id IS NULL OR public.can_view_contact(contact_id));
CREATE POLICY "audit insert" ON public.audit_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_audit_entity ON public.audit_events(entity_type, entity_id);

-- Audit für Preisberechtigungen
CREATE OR REPLACE FUNCTION public.audit_price_grant()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.audit_events(actor_type, actor_id, action, entity_type, entity_id, contact_id, delta, reason)
  VALUES ('human', auth.uid(),
          CASE TG_OP WHEN 'INSERT' THEN 'price_grant_created' ELSE 'price_grant_updated' END,
          'price_grant', NEW.id, NEW.contact_id,
          jsonb_build_object('tier', NEW.tier, 'status', NEW.status, 'amount', NEW.monthly_amount),
          COALESCE(NEW.revoked_reason, NEW.reason));
  RETURN NEW;
END;
$$;
CREATE TRIGGER price_grants_audit AFTER INSERT OR UPDATE ON public.price_grants
  FOR EACH ROW EXECUTE FUNCTION public.audit_price_grant();

-- =========================================================
-- BOOTCAMP-ABSCHLUSS -> FOUNDATION-BERECHTIGUNG
-- =========================================================
CREATE OR REPLACE FUNCTION public.enrollment_grant_foundation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.program_type = 'bootcamp' AND NEW.status = 'completed'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'completed')
     AND NOT NEW.recorded_bootcamp_required AND NOT NEW.is_test_record THEN
    IF NOT EXISTS (SELECT 1 FROM public.price_grants
                    WHERE contact_id = NEW.contact_id AND tier = 'foundation_490' AND status = 'active') THEN
      INSERT INTO public.price_grants(contact_id, tier, reason, source_enrollment_id, created_by)
      VALUES (NEW.contact_id, 'foundation_490',
              'Live-Bootcamp erfolgreich abgeschlossen', NEW.id, auth.uid());
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER enrollments_foundation AFTER INSERT OR UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.enrollment_grant_foundation();

-- =========================================================
-- WIDERSPRUCHSERKENNUNG -> OPS INBOX (idempotent)
-- =========================================================
CREATE OR REPLACE FUNCTION public.detect_ops_issues()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_count integer := 0;
BEGIN
  -- bezahlt, aber kein Zugang
  INSERT INTO public.ops_issues(kind, severity, title, details, contact_id, entity_type, entity_id, dedupe_key)
  SELECT 'paid_without_access', 'high',
         'Bezahlt, aber kein Zugang',
         'Teilnahme ist als bezahlt markiert, der Zugang steht aber nicht auf erteilt.',
         e.contact_id, 'enrollment', e.id, 'paid_without_access:' || e.id
  FROM public.enrollments e
  WHERE e.payment_status = 'paid' AND e.access_status <> 'granted'
  ON CONFLICT (dedupe_key) DO NOTHING;

  -- Zugang ohne Zahlung
  INSERT INTO public.ops_issues(kind, severity, title, details, contact_id, entity_type, entity_id, dedupe_key)
  SELECT 'access_without_payment', 'medium',
         'Zugang ohne Zahlung',
         'Zugang ist erteilt, obwohl die Zahlung nicht als bezahlt erfasst ist.',
         e.contact_id, 'enrollment', e.id, 'access_without_payment:' || e.id
  FROM public.enrollments e
  WHERE e.access_status = 'granted' AND e.payment_status IN ('pending','failed')
    AND e.monthly_amount > 0
  ON CONFLICT (dedupe_key) DO NOTHING;

  -- gekündigt, aber Zugang aktiv
  INSERT INTO public.ops_issues(kind, severity, title, details, contact_id, entity_type, entity_id, dedupe_key)
  SELECT 'cancelled_with_access', 'high',
         'Gekündigt, aber Zugang aktiv',
         'Die Mitgliedschaft ist beendet, der Zugang ist aber weiterhin erteilt.',
         s.contact_id, 'subscription', s.id, 'cancelled_with_access:' || s.id
  FROM public.subscriptions s
  JOIN public.access_grants a ON a.contact_id = s.contact_id AND a.status = 'granted'
  WHERE s.status = 'cancelled' AND (s.end_date IS NULL OR s.end_date < CURRENT_DATE)
  ON CONFLICT (dedupe_key) DO NOTHING;

  -- Foundation-Preis ohne gültige Berechtigung
  INSERT INTO public.ops_issues(kind, severity, title, details, contact_id, entity_type, entity_id, dedupe_key)
  SELECT 'foundation_without_grant', 'high',
         'Foundation-Preis ohne gültige Berechtigung',
         'Die Mitgliedschaft läuft zu 490 EUR, es existiert aber keine gültige Foundation-Berechtigung.',
         s.contact_id, 'subscription', s.id, 'foundation_without_grant:' || s.id
  FROM public.subscriptions s
  WHERE s.price_tier = 'foundation_490'
    AND s.contact_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM public.price_grants g
                     WHERE g.contact_id = s.contact_id AND g.tier = 'foundation_490' AND g.status = 'active')
  ON CONFLICT (dedupe_key) DO NOTHING;

  -- Firmenpaket überbelegt
  INSERT INTO public.ops_issues(kind, severity, title, details, company_id, entity_type, entity_id, dedupe_key)
  SELECT 'package_overbooked', 'high',
         'Firmenpaket überbelegt',
         'Es sind mehr Plätze zugewiesen als das Paket enthält.',
         p.company_id, 'company_package', p.id, 'package_overbooked:' || p.id
  FROM public.company_packages p
  WHERE (SELECT count(*) FROM public.package_seats s WHERE s.package_id = p.id AND s.status <> 'released') > p.seats
  ON CONFLICT (dedupe_key) DO NOTHING;

  -- fehlende Quelle
  INSERT INTO public.ops_issues(kind, severity, title, details, contact_id, entity_type, entity_id, dedupe_key)
  SELECT 'missing_source', 'low',
         'Kontakt ohne Quelle',
         'Für diesen Kontakt ist keine Herkunft hinterlegt.',
         c.id, 'contact', c.id, 'missing_source:' || c.id
  FROM public.contacts c
  WHERE c.source IS NULL OR c.source = ''
  ON CONFLICT (dedupe_key) DO NOTHING;

  -- gelöste Widersprüche automatisch schließen
  UPDATE public.ops_issues i SET status = 'resolved', resolved_at = now()
   WHERE i.status = 'open' AND i.kind = 'paid_without_access'
     AND EXISTS (SELECT 1 FROM public.enrollments e WHERE e.id = i.entity_id
                  AND (e.payment_status <> 'paid' OR e.access_status = 'granted'));

  UPDATE public.ops_issues i SET status = 'resolved', resolved_at = now()
   WHERE i.status = 'open' AND i.kind = 'missing_source'
     AND EXISTS (SELECT 1 FROM public.contacts c WHERE c.id = i.entity_id AND COALESCE(c.source,'') <> '');

  SELECT count(*) INTO v_count FROM public.ops_issues WHERE status = 'open';
  RETURN v_count;
END;
$$;
REVOKE ALL ON FUNCTION public.detect_ops_issues() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.detect_ops_issues() TO authenticated, service_role;