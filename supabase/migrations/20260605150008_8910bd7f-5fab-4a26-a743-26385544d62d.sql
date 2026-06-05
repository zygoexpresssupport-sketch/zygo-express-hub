
CREATE TABLE IF NOT EXISTS public.partner_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  business_type TEXT,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  location TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.partner_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.partner_requests TO authenticated;
GRANT ALL ON public.partner_requests TO service_role;

ALTER TABLE public.partner_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit partner request"
  ON public.partner_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view partner requests"
  ON public.partner_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update partner requests"
  ON public.partner_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete partner requests"
  ON public.partner_requests FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
