GRANT INSERT ON public.partner_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_requests TO authenticated;
GRANT ALL ON public.partner_requests TO service_role;