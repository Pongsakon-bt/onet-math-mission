ALTER TABLE public.essay_answers ADD COLUMN IF NOT EXISTS ai_score numeric, ADD COLUMN IF NOT EXISTS ai_feedback text;
CREATE OR REPLACE FUNCTION public.essay_ai_reset() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.ai_score := NULL; NEW.ai_feedback := NULL; RETURN NEW; END $$;
DROP TRIGGER IF EXISTS essay_ai_reset ON public.essay_answers;
CREATE TRIGGER essay_ai_reset BEFORE INSERT ON public.essay_answers FOR EACH ROW EXECUTE FUNCTION public.essay_ai_reset();