ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS area text;

CREATE TABLE public.school_sites (
  code text PRIMARY KEY REFERENCES public.schools(code),
  opened_at timestamptz NOT NULL DEFAULT now(),
  opened_by uuid
);
GRANT SELECT ON public.school_sites TO authenticated;
GRANT ALL ON public.school_sites TO service_role;
ALTER TABLE public.school_sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers read own school site" ON public.school_sites FOR SELECT TO authenticated
  USING (code = public.teacher_school(auth.uid()));

INSERT INTO public.school_sites (code, opened_at, opened_by)
SELECT p.school_code, min(p.created_at), (array_agg(p.id ORDER BY p.created_at))[1]
FROM public.profiles p JOIN public.user_roles r ON r.user_id = p.id AND r.role = 'teacher'
GROUP BY p.school_code
ON CONFLICT DO NOTHING;