CREATE TABLE public.school_learning_links (
 school_code text NOT NULL REFERENCES public.schools(code),
 level text NOT NULL CHECK (level IN ('p6','m3')),
 subject text NOT NULL CHECK (subject IN ('math','thai','eng','sci')),
 topic text NOT NULL,
 slot integer NOT NULL CHECK (slot BETWEEN 1 AND 3),
 url text NOT NULL CHECK (url ~* '^https?://'),
 updated_by uuid NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (school_code, level, subject, topic, slot)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.school_learning_links TO authenticated;
GRANT ALL ON public.school_learning_links TO service_role;
ALTER TABLE public.school_learning_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY school_resources_read ON public.school_learning_links FOR SELECT TO authenticated USING (school_code = public.my_school(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY school_resources_insert ON public.school_learning_links FOR INSERT TO authenticated WITH CHECK (school_code = public.teacher_school(auth.uid()) AND updated_by = auth.uid());
CREATE POLICY school_resources_update ON public.school_learning_links FOR UPDATE TO authenticated USING (school_code = public.teacher_school(auth.uid())) WITH CHECK (school_code = public.teacher_school(auth.uid()) AND updated_by = auth.uid());
CREATE POLICY school_resources_delete ON public.school_learning_links FOR DELETE TO authenticated USING (school_code = public.teacher_school(auth.uid()));
CREATE TABLE public.tutoring_plans (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 school_code text NOT NULL REFERENCES public.schools(code),
 teacher_id uuid NOT NULL,
 title text NOT NULL,
 grade text NOT NULL CHECK (grade IN ('p4','p5','p6','m1','m2','m3')),
 config jsonb NOT NULL,
 schedule jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tutoring_plans TO authenticated;
GRANT ALL ON public.tutoring_plans TO service_role;
ALTER TABLE public.tutoring_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY tutoring_plans_read ON public.tutoring_plans FOR SELECT TO authenticated USING (school_code = public.teacher_school(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY tutoring_plans_insert ON public.tutoring_plans FOR INSERT TO authenticated WITH CHECK (school_code = public.teacher_school(auth.uid()) AND teacher_id = auth.uid());
CREATE POLICY tutoring_plans_update ON public.tutoring_plans FOR UPDATE TO authenticated USING (school_code = public.teacher_school(auth.uid()) AND teacher_id = auth.uid()) WITH CHECK (school_code = public.teacher_school(auth.uid()) AND teacher_id = auth.uid());
CREATE POLICY tutoring_plans_delete ON public.tutoring_plans FOR DELETE TO authenticated USING (school_code = public.teacher_school(auth.uid()) AND teacher_id = auth.uid());