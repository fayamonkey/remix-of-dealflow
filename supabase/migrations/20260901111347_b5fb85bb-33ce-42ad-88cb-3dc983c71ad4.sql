CREATE TABLE public.forecast_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  rows jsonb NOT NULL DEFAULT '[]'::jsonb,
  months integer NOT NULL DEFAULT 12,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.forecast_scenarios TO authenticated;
GRANT ALL ON public.forecast_scenarios TO service_role;

ALTER TABLE public.forecast_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View scenarios in team"
  ON public.forecast_scenarios FOR SELECT TO authenticated
  USING (public.can_view_record(created_by));

CREATE POLICY "Create own scenarios"
  ON public.forecast_scenarios FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Update own scenarios"
  ON public.forecast_scenarios FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Delete own scenarios"
  ON public.forecast_scenarios FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER forecast_scenarios_updated_at
  BEFORE UPDATE ON public.forecast_scenarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();