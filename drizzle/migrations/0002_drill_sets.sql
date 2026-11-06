CREATE TABLE public.drill_sets (
  level text NOT NULL,
  subject text NOT NULL,
  topic text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (level, subject, topic)
);
GRANT SELECT ON public.drill_sets TO authenticated;
GRANT ALL ON public.drill_sets TO service_role;
ALTER TABLE public.drill_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read drill sets" ON public.drill_sets FOR SELECT TO authenticated USING (true);