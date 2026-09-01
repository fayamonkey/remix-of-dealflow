REVOKE ALL ON FUNCTION public.package_seats_guard() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.subscription_status_effects() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.audit_price_grant() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.enrollment_grant_foundation() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.price_grants_set_amount() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.detect_ops_issues() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.detect_ops_issues() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.can_view_contact(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.can_view_contact(uuid) TO authenticated, service_role;