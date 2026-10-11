REVOKE ALL ON public.pricing_room_worksheets FROM anon;
REVOKE ALL ON public.cj_shipping_quotes FROM anon;
REVOKE DELETE, TRUNCATE ON public.pricing_room_worksheets FROM authenticated;
REVOKE UPDATE, DELETE, TRUNCATE ON public.cj_shipping_quotes FROM authenticated;