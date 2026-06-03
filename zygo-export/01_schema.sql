-- =====================================================================
-- ZYGO EXPRESS — Full schema bundle for external Supabase project
-- Target: hdskkfdtosgfznjscemz (or any fresh Supabase project)
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible
-- =====================================================================

-- ---------- Extensions ----------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================================
-- 1. ROLES (app_role enum + user_roles table + has_role + claim_first_admin)
-- =====================================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role     public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL    ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE admin_exists boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO admin_exists;
  IF admin_exists THEN RETURN FALSE; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin');
  RETURN TRUE;
END; $$;

-- =====================================================================
-- 2. RIDERS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.riders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot          INT  NOT NULL UNIQUE CHECK (slot BETWEEN 1 AND 50),
  name          TEXT NOT NULL DEFAULT '',
  phone         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT FALSE,
  signed_in_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- If the table already existed from an older version, make sure required columns exist
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS slot          INT;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS name          TEXT NOT NULL DEFAULT '';
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS phone         TEXT;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS is_active     BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS signed_in_at  TIMESTAMPTZ;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS created_at    TIMESTAMPTZ NOT NULL DEFAULT now();

-- Backfill slot for any existing rows that lack it, then add constraints
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM public.riders WHERE slot IS NULL
)
UPDATE public.riders r SET slot = n.rn FROM numbered n WHERE r.id = n.id;

ALTER TABLE public.riders ALTER COLUMN slot SET NOT NULL;
DO $$ BEGIN
  ALTER TABLE public.riders ADD CONSTRAINT riders_slot_key UNIQUE (slot);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.riders ADD CONSTRAINT riders_slot_check CHECK (slot BETWEEN 1 AND 50);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT ON public.riders TO anon, authenticated;
GRANT ALL    ON public.riders TO service_role;

ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Riders are publicly readable" ON public.riders;
CREATE POLICY "Riders are publicly readable"
  ON public.riders FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins manage riders" ON public.riders;
CREATE POLICY "Admins manage riders"
  ON public.riders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed 10 default rider slots
INSERT INTO public.riders (slot, name)
SELECT s, 'Rider ' || s FROM generate_series(1, 10) s
ON CONFLICT (slot) DO NOTHING;

-- =====================================================================
-- 3. QUOTE_REQUESTS  (main table)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code       TEXT UNIQUE,
  status              TEXT NOT NULL DEFAULT 'pending',
  name                TEXT NOT NULL,
  phone               TEXT NOT NULL,
  pickup              TEXT NOT NULL,
  dropoff             TEXT NOT NULL,
  details             TEXT,
  source              TEXT DEFAULT 'website',

  pickup_lat          DOUBLE PRECISION,
  pickup_lng          DOUBLE PRECISION,
  dropoff_lat         DOUBLE PRECISION,
  dropoff_lng         DOUBLE PRECISION,

  route_distance_m    INT,
  route_duration_s    INT,

  rider_lat           DOUBLE PRECISION,
  rider_lng           DOUBLE PRECISION,
  rider_updated_at    TIMESTAMPTZ,

  price               NUMERIC(10,2),
  currency            TEXT NOT NULL DEFAULT 'GHS',

  assigned_rider_id   UUID REFERENCES public.riders(id) ON DELETE SET NULL,

  paid_at             TIMESTAMPTZ,
  payment_reference   TEXT,
  payment_provider    TEXT,

  confirmed_at        TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotes_status        ON public.quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quotes_phone         ON public.quote_requests(phone);
CREATE INDEX IF NOT EXISTS idx_quotes_tracking      ON public.quote_requests(tracking_code);
CREATE INDEX IF NOT EXISTS idx_quotes_rider         ON public.quote_requests(assigned_rider_id);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at    ON public.quote_requests(created_at DESC);

GRANT SELECT, INSERT ON public.quote_requests TO anon;          -- public booking form
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_requests TO authenticated;
GRANT ALL ON public.quote_requests TO service_role;

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a quote" ON public.quote_requests;
CREATE POLICY "Anyone can submit a quote"
  ON public.quote_requests FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read all quotes" ON public.quote_requests;
CREATE POLICY "Admins read all quotes"
  ON public.quote_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update quotes" ON public.quote_requests;
CREATE POLICY "Admins update quotes"
  ON public.quote_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete quotes" ON public.quote_requests;
CREATE POLICY "Admins delete quotes"
  ON public.quote_requests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================================
-- 4. RPCs
-- =====================================================================

-- generate_tracking_code (used by confirm_quote)
CREATE OR REPLACE FUNCTION public.generate_tracking_code()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code  TEXT;
  i     INT;
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
END; $$;

-- assign_next_rider (round-robin by least deliveries today)
CREATE OR REPLACE FUNCTION public.assign_next_rider(_quote_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE chosen UUID;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT r.id INTO chosen
  FROM public.riders r
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS cnt FROM public.quote_requests q
    WHERE q.assigned_rider_id = r.id AND q.created_at::date = CURRENT_DATE
  ) c ON TRUE
  WHERE r.is_active = TRUE
  ORDER BY c.cnt ASC, r.signed_in_at ASC NULLS LAST, r.slot ASC
  LIMIT 1;
  IF chosen IS NOT NULL THEN
    UPDATE public.quote_requests SET assigned_rider_id = chosen WHERE id = _quote_id;
  END IF;
  RETURN chosen;
END; $$;

-- confirm_quote
CREATE OR REPLACE FUNCTION public.confirm_quote(_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_code TEXT; existing UUID;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT tracking_code, assigned_rider_id INTO new_code, existing FROM public.quote_requests WHERE id = _id;
  IF new_code IS NULL THEN
    new_code := public.generate_tracking_code();
    UPDATE public.quote_requests
      SET tracking_code = new_code, status = 'confirmed', confirmed_at = now()
      WHERE id = _id;
  END IF;
  IF existing IS NULL THEN
    PERFORM public.assign_next_rider(_id);
  END IF;
  RETURN new_code;
END; $$;

-- update_quote_status
CREATE OR REPLACE FUNCTION public.update_quote_status(_id uuid, _status text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF _status NOT IN ('pending','confirmed','picked_up','in_transit','out_for_delivery','delivered','cancelled') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;
  UPDATE public.quote_requests
    SET status = _status,
        delivered_at = CASE WHEN _status = 'delivered' THEN now() ELSE delivered_at END
    WHERE id = _id;
  RETURN TRUE;
END; $$;

-- set_quote_price
CREATE OR REPLACE FUNCTION public.set_quote_price(_id uuid, _price numeric)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  UPDATE public.quote_requests SET price = _price WHERE id = _id;
  RETURN TRUE;
END; $$;

-- log_manual_request
CREATE OR REPLACE FUNCTION public.log_manual_request(
  _name text, _phone text, _pickup text, _dropoff text, _details text, _source text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id UUID;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  INSERT INTO public.quote_requests (name, phone, pickup, dropoff, details, source)
    VALUES (_name, _phone, _pickup, _dropoff, NULLIF(_details, ''), COALESCE(NULLIF(_source,''), 'manual'))
    RETURNING id INTO new_id;
  RETURN new_id;
END; $$;

-- rider sign in / out / update
CREATE OR REPLACE FUNCTION public.rider_sign_in(_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  UPDATE public.riders SET is_active = TRUE, signed_in_at = now() WHERE id = _id;
  RETURN TRUE;
END; $$;

CREATE OR REPLACE FUNCTION public.rider_sign_out(_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  UPDATE public.riders SET is_active = FALSE, signed_in_at = NULL WHERE id = _id;
  RETURN TRUE;
END; $$;

CREATE OR REPLACE FUNCTION public.update_rider(_id uuid, _name text, _phone text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  UPDATE public.riders SET name = COALESCE(NULLIF(_name,''), name), phone = COALESCE(_phone, phone) WHERE id = _id;
  RETURN TRUE;
END; $$;

-- customer_history (tiering)
CREATE OR REPLACE FUNCTION public.customer_history(_phone text)
RETURNS TABLE(
  total_requests bigint, delivered bigint, total_spent numeric,
  first_seen timestamptz, last_seen timestamptz, tier text
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH s AS (
    SELECT COUNT(*)::bigint AS total_requests,
           SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END)::bigint AS delivered,
           COALESCE(SUM(CASE WHEN status='delivered' THEN price ELSE 0 END),0)::numeric AS total_spent,
           MIN(created_at) AS first_seen, MAX(created_at) AS last_seen
    FROM public.quote_requests WHERE phone = _phone
  )
  SELECT total_requests, delivered, total_spent, first_seen, last_seen,
    CASE WHEN delivered >= 25 THEN 'gold'
         WHEN delivered >= 10 THEN 'silver'
         WHEN delivered >= 3  THEN 'bronze'
         ELSE 'new' END
  FROM s;
$$;

-- rider_daily_stats
CREATE OR REPLACE FUNCTION public.rider_daily_stats(_day date)
RETURNS TABLE(
  rider_id uuid, slot int, name text, is_active boolean, signed_in_at timestamptz,
  deliveries bigint, revenue numeric, in_progress bigint
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id, r.slot, r.name, r.is_active, r.signed_in_at,
    COALESCE(SUM(CASE WHEN q.status = 'delivered' AND q.delivered_at::date = _day THEN 1 ELSE 0 END), 0)::bigint,
    COALESCE(SUM(CASE WHEN q.status = 'delivered' AND q.delivered_at::date = _day THEN q.price ELSE 0 END), 0)::numeric,
    COALESCE(SUM(CASE WHEN q.status NOT IN ('delivered','cancelled') AND q.created_at::date = _day THEN 1 ELSE 0 END), 0)::bigint
  FROM public.riders r
  LEFT JOIN public.quote_requests q ON q.assigned_rider_id = r.id
  GROUP BY r.id, r.slot, r.name, r.is_active, r.signed_in_at
  ORDER BY r.slot;
$$;

-- mark_quote_paid (called by Paystack webhook)
CREATE OR REPLACE FUNCTION public.mark_quote_paid(_tracking_code text, _reference text, _provider text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.quote_requests
    SET paid_at = COALESCE(paid_at, now()),
        payment_reference = _reference,
        payment_provider = _provider
    WHERE tracking_code = upper(_tracking_code);
  RETURN FOUND;
END; $$;

-- lookup_tracking (public — for the tracking page)
CREATE OR REPLACE FUNCTION public.lookup_tracking(_code text)
RETURNS TABLE(
  tracking_code text, status text, pickup text, dropoff text,
  created_at timestamptz, confirmed_at timestamptz,
  pickup_lat double precision, pickup_lng double precision,
  dropoff_lat double precision, dropoff_lng double precision,
  price numeric, paid_at timestamptz
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tracking_code, status, pickup, dropoff, created_at, confirmed_at,
         pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, price, paid_at
  FROM public.quote_requests
  WHERE tracking_code = upper(_code)
  LIMIT 1;
$$;

-- Allow anon to call public RPCs that need to be public
GRANT EXECUTE ON FUNCTION public.lookup_tracking(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

-- =====================================================================
-- 5. REALTIME
-- =====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.quote_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.riders;

-- =====================================================================
-- DONE
-- =====================================================================
