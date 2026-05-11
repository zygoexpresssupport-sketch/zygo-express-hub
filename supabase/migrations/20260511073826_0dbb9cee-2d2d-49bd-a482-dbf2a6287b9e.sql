-- Add fields to support tracking codes, status workflow, source attribution and map coordinates
ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'website',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS tracking_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pickup_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS pickup_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS dropoff_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS dropoff_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Function to generate ZGX-XXXXXX tracking codes
CREATE OR REPLACE FUNCTION public.generate_tracking_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT;
  i INT;
  attempts INT := 0;
BEGIN
  LOOP
    code := 'ZGX-';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.quote_requests WHERE tracking_code = code);
    attempts := attempts + 1;
    IF attempts > 20 THEN RAISE EXCEPTION 'Could not generate unique code'; END IF;
  END LOOP;
  RETURN code;
END;
$$;

-- Admin RPC: confirm a quote (auto-generate tracking code) and update status
CREATE OR REPLACE FUNCTION public.confirm_quote(_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  SELECT tracking_code INTO new_code FROM public.quote_requests WHERE id = _id;
  IF new_code IS NULL THEN
    new_code := public.generate_tracking_code();
    UPDATE public.quote_requests
      SET tracking_code = new_code,
          status = 'confirmed',
          confirmed_at = now()
      WHERE id = _id;
  END IF;
  RETURN new_code;
END;
$$;

-- Admin RPC: update status of a quote
CREATE OR REPLACE FUNCTION public.update_quote_status(_id UUID, _status TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF _status NOT IN ('pending','confirmed','picked_up','in_transit','out_for_delivery','delivered','cancelled') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;
  UPDATE public.quote_requests SET status = _status WHERE id = _id;
  RETURN TRUE;
END;
$$;

-- Admin RPC: manually log a request from social media DMs etc.
CREATE OR REPLACE FUNCTION public.log_manual_request(
  _name TEXT, _phone TEXT, _pickup TEXT, _dropoff TEXT,
  _details TEXT, _source TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_id UUID;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  INSERT INTO public.quote_requests (name, phone, pickup, dropoff, details, source)
    VALUES (_name, _phone, _pickup, _dropoff, NULLIF(_details, ''), COALESCE(NULLIF(_source,''), 'manual'))
    RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- Public lookup by tracking code (limited fields, no PII like phone)
CREATE OR REPLACE FUNCTION public.lookup_tracking(_code TEXT)
RETURNS TABLE (
  tracking_code TEXT,
  status TEXT,
  pickup TEXT,
  dropoff TEXT,
  created_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  pickup_lat DOUBLE PRECISION,
  pickup_lng DOUBLE PRECISION,
  dropoff_lat DOUBLE PRECISION,
  dropoff_lng DOUBLE PRECISION
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tracking_code, status, pickup, dropoff, created_at, confirmed_at,
         pickup_lat, pickup_lng, dropoff_lat, dropoff_lng
  FROM public.quote_requests
  WHERE tracking_code = upper(_code)
  LIMIT 1;
$$;

-- Enable realtime on quote_requests for live admin alerts
ALTER TABLE public.quote_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quote_requests;