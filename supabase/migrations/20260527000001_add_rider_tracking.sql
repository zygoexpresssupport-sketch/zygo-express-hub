ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS rider_lat double precision,
  ADD COLUMN IF NOT EXISTS rider_lng double precision,
  ADD COLUMN IF NOT EXISTS rider_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'GHS';

DROP FUNCTION IF EXISTS public.lookup_tracking(text);

CREATE FUNCTION public.lookup_tracking(_code text)
RETURNS TABLE(
  tracking_code text, status text, pickup text, dropoff text,
  created_at timestamptz, confirmed_at timestamptz,
  pickup_lat double precision, pickup_lng double precision,
  dropoff_lat double precision, dropoff_lng double precision,
  rider_lat double precision, rider_lng double precision,
  rider_updated_at timestamptz,
  price numeric, paid_at timestamptz, currency text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tracking_code, status, pickup, dropoff, created_at, confirmed_at,
         pickup_lat, pickup_lng, dropoff_lat, dropoff_lng,
         rider_lat, rider_lng, rider_updated_at,
         price, paid_at, currency
  FROM public.quote_requests
  WHERE tracking_code = upper(_code)
  LIMIT 1;
$$;
