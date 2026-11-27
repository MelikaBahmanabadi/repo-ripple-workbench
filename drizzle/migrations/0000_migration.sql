CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  reservation_date date NOT NULL,
  reservation_time text NOT NULL,
  party_size int NOT NULL,
  area text,
  occasion text,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.reservations TO service_role;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE INDEX reservations_date_idx ON public.reservations (reservation_date, reservation_time);