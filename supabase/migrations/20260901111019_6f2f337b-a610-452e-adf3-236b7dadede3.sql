CREATE OR REPLACE FUNCTION public.check_allowed_signup_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) NOT IN ('fayamonkeyrecords@gmail.com', 'hje@golem.de') THEN
    RAISE EXCEPTION 'signup_not_allowed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_allowed_signup_email ON auth.users;
CREATE TRIGGER enforce_allowed_signup_email
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.check_allowed_signup_email();