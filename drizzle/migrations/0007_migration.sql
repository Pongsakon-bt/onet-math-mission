CREATE OR REPLACE FUNCTION public.profiles_guard()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $function$
BEGIN
  IF coalesce(auth.jwt()->>'role','') <> 'service_role' AND current_user NOT IN ('postgres','supabase_admin','service_role') THEN
    IF new.school_code IS DISTINCT FROM old.school_code OR new.active IS DISTINCT FROM old.active THEN
      RAISE EXCEPTION 'school_code and active can only be changed by staff';
    END IF;
  END IF;
  IF new.grade IS NOT NULL AND new.grade NOT IN ('p4','p5','p6','m1','m2','m3') THEN RAISE EXCEPTION 'invalid grade'; END IF;
  new.room := nullif(left(btrim(coalesce(new.room,'')), 10), '');
  RETURN new;
END $function$;