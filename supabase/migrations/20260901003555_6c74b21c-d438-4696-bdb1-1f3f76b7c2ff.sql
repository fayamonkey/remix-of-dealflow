-- ============ ENUMS ============
CREATE TYPE public.program_type AS ENUM ('free_workshop','bootcamp','cohort','company');
CREATE TYPE public.enrollment_status AS ENUM ('interested','registered','attended','no_show','completed','active','paused','cancelled');
CREATE TYPE public.payment_status AS ENUM ('none','pending','paid','refunded','failed');
CREATE TYPE public.access_status AS ENUM ('none','pending','granted','revoked');
CREATE TYPE public.price_tier AS ENUM ('none','foundation_490','early_590','standard_690','company_1_690','company_2_990','company_5_1900');

-- ============ CONTACTS EXTENSION ============
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'de',
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS campaign text,
  ADD COLUMN IF NOT EXISTS consent_marketing boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_recording boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_foundation_member boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS member_number integer,
  ADD COLUMN IF NOT EXISTS current_price_tier public.price_tier NOT NULL DEFAULT 'none';

-- ============ VISIBILITY HELPER ============
CREATE OR REPLACE FUNCTION public.can_view_record(_owner uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _owner = auth.uid()
      OR public.has_role(auth.uid(), 'admin')
      OR public.is_team_member(auth.uid(), _owner)
$$;

-- ============ ENROLLMENTS ============
CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  program_type public.program_type NOT NULL,
  status public.enrollment_status NOT NULL DEFAULT 'interested',
  funnel_source text,
  golem_campaign text,
  workshop_date timestamptz,
  payment_status public.payment_status NOT NULL DEFAULT 'none',
  access_status public.access_status NOT NULL DEFAULT 'none',
  price_tier public.price_tier NOT NULL DEFAULT 'none',
  monthly_amount numeric NOT NULL DEFAULT 0,
  seats integer NOT NULL DEFAULT 1,
  start_date date,
  cancel_date date,
  next_step text,
  notes text,
  external_ref text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_enrollments_contact ON public.enrollments(contact_id);
CREATE INDEX idx_enrollments_program ON public.enrollments(program_type, status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can view enrollments" ON public.enrollments
  FOR SELECT TO authenticated USING (public.can_view_record(created_by));
CREATE POLICY "Authenticated can insert enrollments" ON public.enrollments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creator or admin can update enrollments" ON public.enrollments
  FOR UPDATE TO authenticated USING (auth.uid() = created_by OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Creator or admin can delete enrollments" ON public.enrollments
  FOR DELETE TO authenticated USING (auth.uid() = created_by OR public.has_role(auth.uid(),'admin'));

CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ MEMBER EVENTS ============
CREATE TABLE public.member_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  enrollment_id uuid REFERENCES public.enrollments(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  title text NOT NULL,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_member_events_contact ON public.member_events(contact_id, occurred_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_events TO authenticated;
GRANT ALL ON public.member_events TO service_role;
ALTER TABLE public.member_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can view member events" ON public.member_events
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.contacts c WHERE c.id = member_events.contact_id AND public.can_view_record(c.created_by))
  );
CREATE POLICY "Authenticated can insert member events" ON public.member_events
  FOR INSERT TO authenticated WITH CHECK (created_by IS NULL OR auth.uid() = created_by);
CREATE POLICY "Creator or admin can delete member events" ON public.member_events
  FOR DELETE TO authenticated USING (auth.uid() = created_by OR public.has_role(auth.uid(),'admin'));

-- ============ JOURNEY TEMPLATES + STEPS ============
CREATE TABLE public.journey_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_type public.program_type NOT NULL,
  name text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  offset_days integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journey_templates TO authenticated;
GRANT ALL ON public.journey_templates TO service_role;
ALTER TABLE public.journey_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view templates" ON public.journey_templates
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and managers manage templates" ON public.journey_templates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

CREATE TABLE public.enrollment_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  name text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  due_date date,
  done boolean NOT NULL DEFAULT false,
  done_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_enrollment_steps_enrollment ON public.enrollment_steps(enrollment_id, position);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.enrollment_steps TO authenticated;
GRANT ALL ON public.enrollment_steps TO service_role;
ALTER TABLE public.enrollment_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team can view enrollment steps" ON public.enrollment_steps
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.enrollments e WHERE e.id = enrollment_steps.enrollment_id AND public.can_view_record(e.created_by))
  );
CREATE POLICY "Team can insert enrollment steps" ON public.enrollment_steps
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.enrollments e WHERE e.id = enrollment_steps.enrollment_id AND public.can_view_record(e.created_by))
  );
CREATE POLICY "Team can update enrollment steps" ON public.enrollment_steps
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.enrollments e WHERE e.id = enrollment_steps.enrollment_id AND public.can_view_record(e.created_by))
  );
CREATE POLICY "Creator or admin can delete enrollment steps" ON public.enrollment_steps
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.enrollments e WHERE e.id = enrollment_steps.enrollment_id
            AND (e.created_by = auth.uid() OR public.has_role(auth.uid(),'admin')))
  );

-- ============ PRICING LOGIC ============
CREATE OR REPLACE FUNCTION public.price_for_tier(_tier public.price_tier)
RETURNS numeric LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE _tier
    WHEN 'foundation_490' THEN 490
    WHEN 'early_590' THEN 590
    WHEN 'standard_690' THEN 690
    WHEN 'company_1_690' THEN 690
    WHEN 'company_2_990' THEN 990
    WHEN 'company_5_1900' THEN 1900
    ELSE 0 END::numeric
$$;

CREATE OR REPLACE FUNCTION public.enrollment_apply_rules()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_next integer;
  v_foundation boolean;
BEGIN
  -- Foundation members always keep 490
  SELECT is_foundation_member INTO v_foundation FROM public.contacts WHERE id = NEW.contact_id;

  IF NEW.program_type = 'cohort' THEN
    IF COALESCE(v_foundation,false) THEN
      NEW.price_tier := 'foundation_490';
    ELSIF NEW.price_tier = 'none' THEN
      -- assign member number on first cohort enrollment
      IF (SELECT member_number FROM public.contacts WHERE id = NEW.contact_id) IS NULL THEN
        SELECT COALESCE(MAX(member_number),0)+1 INTO v_next FROM public.contacts;
        UPDATE public.contacts SET member_number = v_next WHERE id = NEW.contact_id;
      ELSE
        SELECT member_number INTO v_next FROM public.contacts WHERE id = NEW.contact_id;
      END IF;
      NEW.price_tier := CASE WHEN v_next <= 50 THEN 'early_590'::public.price_tier ELSE 'standard_690'::public.price_tier END;
    END IF;
  END IF;

  IF NEW.program_type = 'company' AND NEW.price_tier = 'none' THEN
    NEW.price_tier := CASE
      WHEN NEW.seats >= 5 THEN 'company_5_1900'
      WHEN NEW.seats >= 2 THEN 'company_2_990'
      ELSE 'company_1_690' END;
  END IF;

  NEW.monthly_amount := public.price_for_tier(NEW.price_tier);

  -- Bootcamp completion grants lifetime foundation pricing
  IF NEW.program_type = 'bootcamp' AND NEW.status = 'completed' THEN
    UPDATE public.contacts
       SET is_foundation_member = true, current_price_tier = 'foundation_490'
     WHERE id = NEW.contact_id;
  ELSIF NEW.program_type IN ('cohort','company') THEN
    UPDATE public.contacts SET current_price_tier = NEW.price_tier
     WHERE id = NEW.contact_id AND is_foundation_member = false;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enrollments_apply_rules
BEFORE INSERT OR UPDATE OF status, price_tier, seats, program_type ON public.enrollments
FOR EACH ROW EXECUTE FUNCTION public.enrollment_apply_rules();

-- ============ AUTOMATION: seed steps + log events ============
CREATE OR REPLACE FUNCTION public.enrollment_after_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.enrollment_steps (enrollment_id, name, position, due_date)
  SELECT NEW.id, t.name, t.position,
         (COALESCE(NEW.workshop_date::date, NEW.start_date, CURRENT_DATE) + t.offset_days)
  FROM public.journey_templates t
  WHERE t.program_type = NEW.program_type
  ORDER BY t.position;

  INSERT INTO public.member_events (contact_id, enrollment_id, event_type, title, created_by)
  VALUES (NEW.contact_id, NEW.id, 'enrollment_created',
          'Teilnahme angelegt: ' || NEW.program_type::text, NEW.created_by);
  RETURN NEW;
END;
$$;
CREATE TRIGGER enrollments_after_insert AFTER INSERT ON public.enrollments
FOR EACH ROW EXECUTE FUNCTION public.enrollment_after_insert();

CREATE OR REPLACE FUNCTION public.enrollment_log_changes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.member_events (contact_id, enrollment_id, event_type, title, created_by)
    VALUES (NEW.contact_id, NEW.id, 'status_changed', 'Status: ' || OLD.status::text || ' → ' || NEW.status::text, auth.uid());
  END IF;
  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
    INSERT INTO public.member_events (contact_id, enrollment_id, event_type, title, created_by)
    VALUES (NEW.contact_id, NEW.id, 'payment_changed', 'Zahlung: ' || OLD.payment_status::text || ' → ' || NEW.payment_status::text, auth.uid());
  END IF;
  IF NEW.access_status IS DISTINCT FROM OLD.access_status THEN
    INSERT INTO public.member_events (contact_id, enrollment_id, event_type, title, created_by)
    VALUES (NEW.contact_id, NEW.id, 'access_changed', 'Zugang: ' || OLD.access_status::text || ' → ' || NEW.access_status::text, auth.uid());
  END IF;
  IF NEW.price_tier IS DISTINCT FROM OLD.price_tier THEN
    INSERT INTO public.member_events (contact_id, enrollment_id, event_type, title, created_by)
    VALUES (NEW.contact_id, NEW.id, 'price_changed', 'Kondition: ' || OLD.price_tier::text || ' → ' || NEW.price_tier::text, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER enrollments_log_changes AFTER UPDATE ON public.enrollments
FOR EACH ROW EXECUTE FUNCTION public.enrollment_log_changes();

-- ============ DEFAULT JOURNEY TEMPLATES ============
INSERT INTO public.journey_templates (program_type, name, position, offset_days) VALUES
  ('free_workshop','Anmeldung erfasst',0,-14),
  ('free_workshop','Bestätigung versendet',1,-14),
  ('free_workshop','Kalendereintrag verschickt',2,-13),
  ('free_workshop','Technische Vorbereitung',3,-2),
  ('free_workshop','Erinnerung 24h',4,-1),
  ('free_workshop','Teilnahme / No-show erfasst',5,0),
  ('free_workshop','Workshopmaterial versendet',6,1),
  ('free_workshop','Bootcamp-Angebot versendet',7,1),
  ('free_workshop','Nachfassen',8,4),
  ('free_workshop','Übergabe: Bootcamp oder Interessent',9,7),
  ('bootcamp','Zahlung bestätigt',0,0),
  ('bootcamp','Onboarding freigeschaltet',1,0),
  ('bootcamp','Start-here-Seite verschickt',2,0),
  ('bootcamp','Termine im Kalender',3,1),
  ('bootcamp','Bootcamp abgeschlossen',4,14),
  ('bootcamp','Foundation-Kondition (490 €) gesetzt',5,14),
  ('cohort','Zahlung bestätigt',0,0),
  ('cohort','Community-Zugang erteilt',1,0),
  ('cohort','Start-here-Seite',2,0),
  ('cohort','Vorbereitung Monatsmitarbeiter',3,3),
  ('cohort','Workshop-Termin',4,7),
  ('cohort','Testphase begleiten',5,10),
  ('cohort','Problem-Intake vor Catch-up',6,17),
  ('cohort','Catch-up-Termin',7,21),
  ('cohort','Verlängerung oder Kündigung prüfen',8,28),
  ('company','Angebot versendet',0,0),
  ('company','Vertrag / Bestellung',1,3),
  ('company','Seats festgelegt',2,5),
  ('company','Zugänge für Seats erteilt',3,7),
  ('company','Onboarding-Termin',4,10);

-- ============ SECURITY FIX: contacts visibility ============
DROP POLICY IF EXISTS "Authenticated users can view contacts" ON public.contacts;
CREATE POLICY "Team can view contacts" ON public.contacts
  FOR SELECT TO authenticated USING (public.can_view_record(created_by));