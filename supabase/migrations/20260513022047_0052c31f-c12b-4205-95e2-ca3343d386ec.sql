
ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS payment_provider text,
  ADD COLUMN IF NOT EXISTS route_distance_m integer,
  ADD COLUMN IF NOT EXISTS route_duration_s integer;

CREATE UNIQUE INDEX IF NOT EXISTS quote_requests_payment_reference_key
  ON public.quote_requests (payment_reference) WHERE payment_reference IS NOT NULL;

DROP FUNCTION IF EXISTS public.lookup_tracking(text);

CREATE FUNCTION public.lookup_tracking(_code text)
RETURNS TABLE(
  tracking_code text, status text, pickup text, dropoff text,
  created_at timestamptz, confirmed_at timestamptz,
  pickup_lat double precision, pickup_lng double precision,
  dropoff_lat double precision, dropoff_lng double precision,
  price numeric, paid_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tracking_code, status, pickup, dropoff, created_at, confirmed_at,
         pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, price, paid_at
  FROM public.quote_requests
  WHERE tracking_code = upper(_code)
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.mark_quote_paid(_tracking_code text, _reference text, _provider text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.quote_requests
    SET paid_at = COALESCE(paid_at, now()),
        payment_reference = _reference,
        payment_provider = _provider
    WHERE tracking_code = upper(_tracking_code);
  RETURN FOUND;
END; $$;
