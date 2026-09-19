-- =====================================================================
-- ZYGO EXPRESS — TRICYCLE FLEET MANAGEMENT
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- Safe to re-run.
-- Creates: vehicles, fuel_logs, maintenance_logs + all RPCs used by
-- the Finance & Fleet section of admin3.html
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------
-- 1. VEHICLES (tricycles / motorbikes)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vehicles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  plate_number   TEXT,
  vehicle_type   TEXT NOT NULL DEFAULT 'tricycle',
  rider_id       TEXT,
  rider_name     TEXT,
  status         TEXT NOT NULL DEFAULT 'active',
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_type TEXT NOT NULL DEFAULT 'tricycle';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS rider_id   TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS rider_name TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS notes      TEXT;

CREATE INDEX IF NOT EXISTS idx_vehicles_rider  ON public.vehicles(rider_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);

GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
-- No direct table policies: all access goes through the RPCs below.

-- ---------------------------------------------------------------------
-- 2. FUEL LOGS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fuel_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id   UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  rider_id     TEXT,
  rider_name   TEXT,
  liters       NUMERIC(10,2) NOT NULL CHECK (liters > 0),
  cost         NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
  odometer_km  NUMERIC(12,1),
  notes        TEXT,
  logged_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fuel_vehicle ON public.fuel_logs(vehicle_id, logged_at DESC);

GRANT ALL ON public.fuel_logs TO service_role;
ALTER TABLE public.fuel_logs ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 3. MAINTENANCE LOGS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.maintenance_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id        UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  service_type      TEXT NOT NULL DEFAULT 'service',
  description       TEXT,
  cost              NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
  serviced_at       DATE NOT NULL DEFAULT CURRENT_DATE,
  next_service_due  DATE,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_maint_vehicle ON public.maintenance_logs(vehicle_id, serviced_at DESC);

GRANT ALL ON public.maintenance_logs TO service_role;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 4. RPCs
-- ---------------------------------------------------------------------

-- List all vehicles with fleet health info
CREATE OR REPLACE FUNCTION public.get_all_vehicles()
RETURNS TABLE(
  vehicle_id uuid, vehicle_name text, plate_number text, vehicle_type text,
  rider_id text, rider_name text, status text,
  last_service date, next_service_due date, maintenance_cost numeric, fuel_cost numeric
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT v.id, v.name, v.plate_number, v.vehicle_type, v.rider_id, v.rider_name, v.status,
         m.last_service, m.next_due, COALESCE(m.cost,0), COALESCE(f.cost,0)
  FROM public.vehicles v
  LEFT JOIN LATERAL (
    SELECT MAX(serviced_at) AS last_service,
           MAX(next_service_due) AS next_due,
           SUM(cost) AS cost
    FROM public.maintenance_logs ml WHERE ml.vehicle_id = v.id
  ) m ON TRUE
  LEFT JOIN LATERAL (
    SELECT SUM(cost) AS cost FROM public.fuel_logs fl WHERE fl.vehicle_id = v.id
  ) f ON TRUE
  ORDER BY v.created_at;
$$;

-- Create or update a vehicle
CREATE OR REPLACE FUNCTION public.upsert_vehicle(
  _id uuid,
  _name text,
  _plate text DEFAULT NULL,
  _rider_id text DEFAULT NULL,
  _status text DEFAULT 'active',
  _type text DEFAULT 'tricycle',
  _rider_name text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id UUID;
BEGIN
  IF _name IS NULL OR length(btrim(_name)) = 0 THEN RAISE EXCEPTION 'Vehicle name required'; END IF;
  IF _status NOT IN ('active','maintenance','retired') THEN RAISE EXCEPTION 'Invalid status'; END IF;

  IF _id IS NULL THEN
    INSERT INTO public.vehicles (name, plate_number, vehicle_type, rider_id, rider_name, status)
      VALUES (btrim(_name), NULLIF(btrim(COALESCE(_plate,'')),''), COALESCE(_type,'tricycle'),
              NULLIF(_rider_id,''), NULLIF(_rider_name,''), _status)
      RETURNING id INTO new_id;
  ELSE
    UPDATE public.vehicles SET
      name         = btrim(_name),
      plate_number = NULLIF(btrim(COALESCE(_plate,'')),''),
      vehicle_type = COALESCE(_type, vehicle_type),
      rider_id     = NULLIF(_rider_id,''),
      rider_name   = NULLIF(_rider_name,''),
      status       = _status
    WHERE id = _id
    RETURNING id INTO new_id;
  END IF;
  RETURN new_id;
END; $$;

-- Assign (or clear) the rider using a tricycle
CREATE OR REPLACE FUNCTION public.assign_vehicle_rider(_id uuid, _rider_id text, _rider_name text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.vehicles
    SET rider_id = NULLIF(_rider_id,''), rider_name = NULLIF(_rider_name,'')
    WHERE id = _id;
  RETURN FOUND;
END; $$;

-- Change status only
CREATE OR REPLACE FUNCTION public.set_vehicle_status(_id uuid, _status text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _status NOT IN ('active','maintenance','retired') THEN RAISE EXCEPTION 'Invalid status'; END IF;
  UPDATE public.vehicles SET status = _status WHERE id = _id;
  RETURN FOUND;
END; $$;

CREATE OR REPLACE FUNCTION public.delete_vehicle(_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.vehicles WHERE id = _id;
  RETURN FOUND;
END; $$;

-- Log fuel
CREATE OR REPLACE FUNCTION public.log_fuel(
  _vehicle_id uuid, _liters numeric, _cost numeric,
  _odometer numeric DEFAULT NULL, _rider_id text DEFAULT NULL,
  _rider_name text DEFAULT NULL, _notes text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id UUID; v_rider_id TEXT; v_rider_name TEXT;
BEGIN
  SELECT rider_id, rider_name INTO v_rider_id, v_rider_name FROM public.vehicles WHERE id = _vehicle_id;
  INSERT INTO public.fuel_logs (vehicle_id, rider_id, rider_name, liters, cost, odometer_km, notes)
    VALUES (_vehicle_id,
            COALESCE(NULLIF(_rider_id,''), v_rider_id),
            COALESCE(NULLIF(_rider_name,''), v_rider_name),
            _liters, COALESCE(_cost,0), _odometer, NULLIF(_notes,''))
    RETURNING id INTO new_id;
  RETURN new_id;
END; $$;

-- Log maintenance
CREATE OR REPLACE FUNCTION public.log_maintenance(
  _vehicle_id uuid, _service_type text, _description text, _cost numeric,
  _serviced_at date DEFAULT CURRENT_DATE, _next_due date DEFAULT NULL, _notes text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id UUID;
BEGIN
  INSERT INTO public.maintenance_logs (vehicle_id, service_type, description, cost, serviced_at, next_service_due, notes)
    VALUES (_vehicle_id, COALESCE(NULLIF(_service_type,''),'service'), NULLIF(_description,''),
            COALESCE(_cost,0), COALESCE(_serviced_at, CURRENT_DATE), _next_due, NULLIF(_notes,''))
    RETURNING id INTO new_id;
  RETURN new_id;
END; $$;

-- Fuel efficiency per vehicle (km per liter from odometer readings)
CREATE OR REPLACE FUNCTION public.get_fuel_efficiency_comparison()
RETURNS TABLE(
  vehicle_id uuid, vehicle_name text, rider_name text,
  avg_km_per_liter numeric, total_liters numeric, total_distance_km numeric, total_fuel_cost numeric
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH agg AS (
    SELECT fl.vehicle_id,
           SUM(fl.liters) AS liters,
           SUM(fl.cost) AS cost,
           MAX(fl.odometer_km) - MIN(fl.odometer_km) AS distance,
           COUNT(fl.odometer_km) AS odo_readings
    FROM public.fuel_logs fl GROUP BY fl.vehicle_id
  )
  SELECT v.id, v.name, v.rider_name,
         CASE WHEN COALESCE(a.odo_readings,0) > 1 AND COALESCE(a.liters,0) > 0 AND COALESCE(a.distance,0) > 0
              THEN ROUND(a.distance / a.liters, 1) ELSE NULL END,
         COALESCE(a.liters,0), COALESCE(a.distance,0), COALESCE(a.cost,0)
  FROM public.vehicles v
  LEFT JOIN agg a ON a.vehicle_id = v.id
  ORDER BY 4 DESC NULLS LAST, v.name;
$$;

-- Maintenance summary per vehicle
CREATE OR REPLACE FUNCTION public.get_maintenance_summary()
RETURNS TABLE(
  vehicle_id uuid, vehicle_name text, rider_name text,
  log_count bigint, total_cost numeric, last_service date, next_service_due date
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT v.id, v.name, v.rider_name,
         COUNT(ml.id)::bigint, COALESCE(SUM(ml.cost),0),
         MAX(ml.serviced_at), MAX(ml.next_service_due)
  FROM public.vehicles v
  LEFT JOIN public.maintenance_logs ml ON ml.vehicle_id = v.id
  GROUP BY v.id, v.name, v.rider_name
  ORDER BY 5 DESC;
$$;

-- Recent log lists
CREATE OR REPLACE FUNCTION public.get_fuel_logs(_limit int DEFAULT 50)
RETURNS TABLE(
  id uuid, vehicle_name text, rider_name text, liters numeric,
  cost numeric, odometer_km numeric, logged_at timestamptz
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT f.id, v.name, f.rider_name, f.liters, f.cost, f.odometer_km, f.logged_at
  FROM public.fuel_logs f JOIN public.vehicles v ON v.id = f.vehicle_id
  ORDER BY f.logged_at DESC LIMIT COALESCE(_limit,50);
$$;

CREATE OR REPLACE FUNCTION public.get_maintenance_logs(_limit int DEFAULT 50)
RETURNS TABLE(
  id uuid, vehicle_name text, service_type text, description text,
  cost numeric, serviced_at date, next_service_due date
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.id, v.name, m.service_type, m.description, m.cost, m.serviced_at, m.next_service_due
  FROM public.maintenance_logs m JOIN public.vehicles v ON v.id = m.vehicle_id
  ORDER BY m.serviced_at DESC, m.created_at DESC LIMIT COALESCE(_limit,50);
$$;

-- ---------------------------------------------------------------------
-- 5. EXECUTE GRANTS (admin dashboard uses the publishable/anon key)
-- ---------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.get_all_vehicles()                              TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_vehicle(uuid,text,text,text,text,text,text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assign_vehicle_rider(uuid,text,text)            TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_vehicle_status(uuid,text)                   TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_vehicle(uuid)                            TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_fuel(uuid,numeric,numeric,numeric,text,text,text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_maintenance(uuid,text,text,numeric,date,date,text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_fuel_efficiency_comparison()                TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_maintenance_summary()                       TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_fuel_logs(int)                              TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_maintenance_logs(int)                       TO anon, authenticated;

-- ---------------------------------------------------------------------
-- 6. SEED 30 TRICYCLE SLOTS (only if the fleet is empty)
-- ---------------------------------------------------------------------
INSERT INTO public.vehicles (name, vehicle_type, status)
SELECT 'Tricycle ' || s, 'tricycle', 'active'
FROM generate_series(1, 30) s
WHERE NOT EXISTS (SELECT 1 FROM public.vehicles);

-- =====================================================================
-- DONE
-- =====================================================================
