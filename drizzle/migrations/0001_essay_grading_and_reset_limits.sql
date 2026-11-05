CREATE TABLE public.essay_answers (
  attempt_id text NOT NULL,
  qid text NOT NULL,
  user_id uuid NOT NULL,
  no text NOT NULL DEFAULT '',
  prompt text NOT NULL DEFAULT '',
  max_points numeric NOT NULL DEFAULT 0,
  answer text NOT NULL DEFAULT '',
  score numeric,
  comment text,
  graded_by uuid,
  graded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (attempt_id, qid)
);
GRANT SELECT, INSERT ON public.essay_answers TO authenticated;
GRANT UPDATE (score, comment, graded_by, graded_at) ON public.essay_answers TO authenticated;
GRANT ALL ON public.essay_answers TO service_role;
ALTER TABLE public.essay_answers ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.essay_answers_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.score := NULL; NEW.comment := NULL; NEW.graded_by := NULL; NEW.graded_at := NULL;
  ELSE
    IF NEW.score IS NOT NULL AND (NEW.score < 0 OR NEW.score > OLD.max_points) THEN
      RAISE EXCEPTION 'score out of range';
    END IF;
    NEW.graded_by := auth.uid(); NEW.graded_at := now();
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER essay_answers_guard BEFORE INSERT OR UPDATE ON public.essay_answers
FOR EACH ROW EXECUTE FUNCTION public.essay_answers_guard();

CREATE POLICY "Own essay answers insert" ON public.essay_answers FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Own essay answers read" ON public.essay_answers FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Teachers read essays in their school" ON public.essay_answers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = essay_answers.user_id AND p.school_code = public.teacher_school(auth.uid())));
CREATE POLICY "Teachers grade essays in their school" ON public.essay_answers FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = essay_answers.user_id AND p.school_code = public.teacher_school(auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = essay_answers.user_id AND p.school_code = public.teacher_school(auth.uid())));

CREATE TABLE public.reset_attempts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key text NOT NULL,
  at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reset_attempts_key_at ON public.reset_attempts (key, at);
GRANT ALL ON public.reset_attempts TO service_role;
ALTER TABLE public.reset_attempts ENABLE ROW LEVEL SECURITY;