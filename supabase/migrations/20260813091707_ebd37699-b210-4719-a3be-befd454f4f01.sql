CREATE TABLE public.voice_identity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_id text NOT NULL,
  speed numeric(3,2) NOT NULL DEFAULT 1.00,
  warmth smallint NOT NULL DEFAULT 3,
  pronunciation jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'candidate',
  note text,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.voice_identity
  ADD CONSTRAINT voice_identity_status_check CHECK (status IN ('official','candidate','retired')),
  ADD CONSTRAINT voice_identity_speed_check CHECK (speed >= 0.80 AND speed <= 1.20),
  ADD CONSTRAINT voice_identity_warmth_check CHECK (warmth BETWEEN 1 AND 5);

CREATE UNIQUE INDEX voice_identity_one_official
  ON public.voice_identity (status) WHERE status = 'official';

GRANT SELECT ON public.voice_identity TO anon;
GRANT SELECT, INSERT, UPDATE ON public.voice_identity TO authenticated;
GRANT ALL ON public.voice_identity TO service_role;

ALTER TABLE public.voice_identity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can hear the official voice"
  ON public.voice_identity FOR SELECT TO anon, authenticated
  USING (status = 'official');

CREATE POLICY "Founder can review every voice"
  ON public.voice_identity FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Founder can add a voice"
  ON public.voice_identity FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Founder can change a voice"
  ON public.voice_identity FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.voice_identity (voice_id, speed, warmth, pronunciation, status, note, approved_at)
VALUES (
  'shimmer',
  1.00,
  3,
  '{"Frass":"Frahss","Frassy":"Frahss-ee","Frass Hill":"Frahss Hill","Frass Kicks":"Frahss Kicks","Frass Drip":"Frahss Drip","Money Moves":"Money Moves","Afro Designers":"Afro Designers"}'::jsonb,
  'official',
  'Seeded from the voice already in use so Frassy never goes silent.',
  now()
);