CREATE TABLE public.riders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot INT NOT NULL UNIQUE CHECK (slot BETWEEN 1 AND 10),
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  signed_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage riders" ON public.riders
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.riders (slot, name)
SELECT g, 'Rider ' || g FROM generate_series(1,10) g;

ALTER TABLE public.quote_requests
  ADD COLUMN price NUMERIC(10,2),
  ADD COLUMN assigned_rider_id UUID REFERENCES public.riders(id) ON DELETE SET NULL,
  ADD COLUMN delivered_at TIMESTAMPTZ;

CREATE INDEX idx_quote_assigned_rider ON public.quote_requests(assigned_rider_id);
CREATE INDEX idx_quote_phone ON public.quote_requests(phone);

CREATE OR REPLACE FUNCTION public.rider_sign_in(_id uuid)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  UPDATE public.riders SET is_active = TRUE, signed_in_at = now() WHERE id = _id;
  RETURN TRUE;
END; $$;

CREATE OR REPLACE FUNCTION public.rider_sign_out(_id uuid)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  UPDATE public.riders SET is_active = FALSE, signed_in_at = NULL WHERE id = _id;
  RETURN TRUE;
END; $$;

CREATE OR REPLACE FUNCTION public.update_rider(_id uuid, _name text, _phone text)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  UPDATE public.riders SET name = COALESCE(NULLIF(_name,''), name), phone = COALESCE(_phone, phone) WHERE id = _id;
  RETURN TRUE;
END; $$;

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

CREATE OR REPLACE FUNCTION public.set_quote_price(_id uuid, _price numeric)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  UPDATE public.quote_requests SET price = _price WHERE id = _id;
  RETURN TRUE;
END; $$;

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

CREATE OR REPLACE FUNCTION public.rider_daily_stats(_day date)
RETURNS TABLE(
  rider_id uuid,
  slot int,
  name text,
  is_active boolean,
  signed_in_at timestamptz,
  deliveries bigint,
  revenue numeric,
  in_progress bigint
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

CREATE OR REPLACE FUNCTION public.customer_history(_phone text)
RETURNS TABLE(total_requests bigint, delivered bigint, total_spent numeric, first_seen timestamptz, last_seen timestamptz, tier text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
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
         WHEN delivered >= 3 THEN 'bronze'
         ELSE 'new' END
  FROM s;
$$;