CREATE TYPE public.app_role AS ENUM ('teacher', 'student');

CREATE TABLE public.schools (
  code text PRIMARY KEY CHECK (code ~ '^[0-9]{10}$'),
  name text NOT NULL,
  amphoe text,
  province text
);
GRANT SELECT ON public.schools TO anon, authenticated;
GRANT ALL ON public.schools TO service_role;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Schools are public" ON public.schools FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  school_code text NOT NULL REFERENCES public.schools(code),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- School code of the caller when the caller is a teacher, else null.
CREATE OR REPLACE FUNCTION public.teacher_school(_user_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.school_code FROM public.profiles p
  WHERE p.id = _user_id AND public.has_role(_user_id, 'teacher')
$$;

CREATE POLICY "Read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Teachers read profiles in their school" ON public.profiles FOR SELECT TO authenticated
  USING (school_code = public.teacher_school(auth.uid()));
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Teachers may read the roles of people in their school (to tell students from teachers).
CREATE POLICY "Teachers read roles in their school" ON public.user_roles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = user_roles.user_id AND p.school_code = public.teacher_school(auth.uid())));

-- Private: hashed teacher recovery codes. Only server code (service role) can touch it.
CREATE TABLE public.account_recovery (
  user_id uuid PRIMARY KEY,
  code_hash text NOT NULL
);
GRANT ALL ON public.account_recovery TO service_role;
ALTER TABLE public.account_recovery ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.attempts (
  id text NOT NULL,
  user_id uuid NOT NULL,
  kind text NOT NULL,
  level text NOT NULL,
  subject text NOT NULL,
  label text NOT NULL,
  at timestamptz NOT NULL DEFAULT now(),
  ms integer,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  PRIMARY KEY (user_id, id)
);
GRANT SELECT, INSERT, UPDATE ON public.attempts TO authenticated;
GRANT ALL ON public.attempts TO service_role;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own attempts read" ON public.attempts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Own attempts insert" ON public.attempts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Own attempts update" ON public.attempts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Teachers read attempts in their school" ON public.attempts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = attempts.user_id AND p.school_code = public.teacher_school(auth.uid())));
CREATE INDEX attempts_user_idx ON public.attempts(user_id);
CREATE INDEX profiles_school_idx ON public.profiles(school_code);