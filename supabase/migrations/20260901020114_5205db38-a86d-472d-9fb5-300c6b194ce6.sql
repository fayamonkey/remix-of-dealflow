INSERT INTO public.app_settings(key, value, description)
VALUES ('pricing', jsonb_build_object(
  'foundation_490', 490,
  'early_590', 590,
  'standard_690', 690,
  'company_1_690', 690,
  'company_2_990', 990,
  'company_5_1900', 1900,
  'workshop_standalone_2300', 2300
), 'Monatliche bzw. einmalige Preise je Kondition — hier zentral änderbar')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.price_for_tier(_tier price_tier)
RETURNS numeric
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT (value ->> _tier::text)::numeric FROM public.app_settings WHERE key = 'pricing'),
    CASE _tier
      WHEN 'foundation_490' THEN 490
      WHEN 'early_590' THEN 590
      WHEN 'standard_690' THEN 690
      WHEN 'company_1_690' THEN 690
      WHEN 'company_2_990' THEN 990
      WHEN 'company_5_1900' THEN 1900
      WHEN 'workshop_standalone_2300' THEN 2300
      ELSE 0 END::numeric,
    0)
$function$;