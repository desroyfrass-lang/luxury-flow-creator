CREATE OR REPLACE FUNCTION public.platform_domain_paused(_domain text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT s.enabled AND (COALESCE(NULLIF(s.notice, ''), '[]')::jsonb ? _domain)
       FROM public.launch_program_settings s
      WHERE s.id = 'platform_protection'),
    false)
$$;

CREATE OR REPLACE FUNCTION public.enforce_platform_protection()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.platform_domain_paused(TG_ARGV[0]) THEN
    RAISE EXCEPTION 'Frass is in Platform Protection Mode. This action is paused. Everything is safe - please try again shortly.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_live_broadcasts ON public.live_broadcasts;
CREATE TRIGGER protect_live_broadcasts BEFORE INSERT ON public.live_broadcasts
FOR EACH ROW EXECUTE FUNCTION public.enforce_platform_protection('broadcasting');

DROP TRIGGER IF EXISTS protect_card_orders_protection ON public.card_orders;
CREATE TRIGGER protect_card_orders_protection BEFORE INSERT ON public.card_orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_platform_protection('purchases');

DROP TRIGGER IF EXISTS protect_orders_protection ON public.orders;
CREATE TRIGGER protect_orders_protection BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_platform_protection('purchases');

DROP TRIGGER IF EXISTS protect_payment_requests_protection ON public.payment_requests;
CREATE TRIGGER protect_payment_requests_protection BEFORE INSERT ON public.payment_requests
FOR EACH ROW EXECUTE FUNCTION public.enforce_platform_protection('payments');

DROP TRIGGER IF EXISTS protect_registrations ON public.profiles;
CREATE TRIGGER protect_registrations BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.enforce_platform_protection('registrations');