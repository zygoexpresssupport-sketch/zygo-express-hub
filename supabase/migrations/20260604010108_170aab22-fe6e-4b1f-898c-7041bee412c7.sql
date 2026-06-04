
-- 1. Lock down customer_history (admin only)
CREATE OR REPLACE FUNCTION public.customer_history(_phone text)
RETURNS TABLE(total_requests bigint, delivered bigint, total_spent numeric, first_seen timestamptz, last_seen timestamptz, tier text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY
  WITH s AS (
    SELECT COUNT(*)::bigint AS total_requests,
           SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END)::bigint AS delivered,
           COALESCE(SUM(CASE WHEN status='delivered' THEN price ELSE 0 END),0)::numeric AS total_spent,
           MIN(created_at) AS first_seen, MAX(created_at) AS last_seen
    FROM public.quote_requests WHERE phone = _phone
  )
  SELECT s.total_requests, s.delivered, s.total_spent, s.first_seen, s.last_seen,
    CASE WHEN s.delivered >= 25 THEN 'gold'
         WHEN s.delivered >= 10 THEN 'silver'
         WHEN s.delivered >= 3 THEN 'bronze'
         ELSE 'new' END
  FROM s;
END;
$$;

-- 2. Lock down rider_daily_stats (admin only)
CREATE OR REPLACE FUNCTION public.rider_daily_stats(_day date)
RETURNS TABLE(rider_id uuid, slot integer, name text, is_active boolean, signed_in_at timestamptz, deliveries bigint, revenue numeric, in_progress bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY
  SELECT r.id, r.slot, r.name, r.is_active, r.signed_in_at,
    COALESCE(SUM(CASE WHEN q.status = 'delivered' AND q.delivered_at::date = _day THEN 1 ELSE 0 END), 0)::bigint,
    COALESCE(SUM(CASE WHEN q.status = 'delivered' AND q.delivered_at::date = _day THEN q.price ELSE 0 END), 0)::numeric,
    COALESCE(SUM(CASE WHEN q.status NOT IN ('delivered','cancelled') AND q.created_at::date = _day THEN 1 ELSE 0 END), 0)::bigint
  FROM public.riders r
  LEFT JOIN public.quote_requests q ON q.assigned_rider_id = r.id
  GROUP BY r.id, r.slot, r.name, r.is_active, r.signed_in_at
  ORDER BY r.slot;
END;
$$;

-- 3. Revoke public execute on mark_quote_paid; only service role (webhook) calls it
REVOKE ALL ON FUNCTION public.mark_quote_paid(text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_quote_paid(text, text, text) TO service_role;

-- 4. Pin search_path on generate_tracking_code
CREATE OR REPLACE FUNCTION public.generate_tracking_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
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

-- 5. Remove quote_requests from realtime publication (admins use direct queries; prevents broadcast leak)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'quote_requests'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.quote_requests';
  END IF;
END $$;
