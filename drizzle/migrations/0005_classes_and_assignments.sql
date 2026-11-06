ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS grade text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS room text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

CREATE OR REPLACE FUNCTION public.profiles_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF coalesce(auth.jwt()->>'role','') <> 'service_role' AND current_user NOT IN ('postgres','supabase_admin','service_role') THEN
    IF new.school_code IS DISTINCT FROM old.school_code OR new.active IS DISTINCT FROM old.active THEN
      RAISE EXCEPTION 'school_code and active can only be changed by staff';
    END IF;
  END IF;
  IF new.grade IS NOT NULL AND new.grade NOT IN ('p6','m3') THEN RAISE EXCEPTION 'invalid grade'; END IF;
  new.room := nullif(left(btrim(coalesce(new.room,'')), 10), '');
  RETURN new;
END $$;
DROP TRIGGER IF EXISTS profiles_guard ON public.profiles;
CREATE TRIGGER profiles_guard BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.profiles_guard();

CREATE OR REPLACE FUNCTION public.my_school(_user_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT school_code FROM public.profiles WHERE id = _user_id
$$;

CREATE TABLE public.teacher_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  grade text NOT NULL CHECK (grade IN ('p6','m3')),
  room text NOT NULL DEFAULT '',
  subject text NOT NULL CHECK (subject IN ('math','thai','eng','sci')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, grade, room, subject)
);
GRANT SELECT, INSERT, DELETE ON public.teacher_classes TO authenticated;
GRANT ALL ON public.teacher_classes TO service_role;
ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers manage own classes insert" ON public.teacher_classes FOR INSERT TO authenticated
  WITH CHECK (teacher_id = auth.uid() AND public.teacher_school(auth.uid()) IS NOT NULL);
CREATE POLICY "Teachers delete own classes" ON public.teacher_classes FOR DELETE TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "Teachers read classes in school" ON public.teacher_classes FOR SELECT TO authenticated
  USING (public.my_school(teacher_id) = public.teacher_school(auth.uid()));

CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_code text NOT NULL,
  teacher_id uuid NOT NULL,
  grade text NOT NULL CHECK (grade IN ('p6','m3')),
  room text,
  subject text NOT NULL CHECK (subject IN ('math','thai','eng','sci')),
  kind text NOT NULL CHECK (kind IN ('pre1','pre2','drill')),
  target text NOT NULL DEFAULT '',
  title text NOT NULL,
  due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.assignments TO authenticated;
GRANT ALL ON public.assignments TO service_role;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers create assignments" ON public.assignments FOR INSERT TO authenticated
  WITH CHECK (teacher_id = auth.uid() AND school_code = public.teacher_school(auth.uid()));
CREATE POLICY "Teachers delete own assignments" ON public.assignments FOR DELETE TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "Teachers read school assignments" ON public.assignments FOR SELECT TO authenticated
  USING (school_code = public.teacher_school(auth.uid()));
CREATE POLICY "Students read their assignments" ON public.assignments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.school_code = assignments.school_code
    AND p.grade = assignments.grade AND (assignments.room IS NULL OR assignments.room = p.room)));