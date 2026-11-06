CREATE TABLE public.learning_links (
  level text NOT NULL,
  subject text NOT NULL,
  topic text NOT NULL,
  url text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  PRIMARY KEY (level, subject, topic)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_links TO authenticated;
GRANT ALL ON public.learning_links TO service_role;
ALTER TABLE public.learning_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read learning links" ON public.learning_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins insert learning links" ON public.learning_links FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND url ~* '^https?://');
CREATE POLICY "Admins update learning links" ON public.learning_links FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin') AND url ~* '^https?://');
CREATE POLICY "Admins delete learning links" ON public.learning_links FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));