-- ========================================
-- ENSURE PROFILE IS CREATED ON SIGNUP
-- ========================================
-- Run this in Supabase SQL Editor so every new auth user gets a row in public.users.
-- Fixes: "nakapagregister na pero hindi pumapasok sa supabase" (user in Auth, no row in public.users).

-- 1. Function: insert into public.users when auth.users row is inserted
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, name, email, phone, user_type)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'patient')
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'User profile already exists for user %', NEW.id;
        RETURN NEW;
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- 2. Trigger on auth.users (Supabase Auth)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();

COMMENT ON FUNCTION public.create_user_profile() IS
'Creates a row in public.users when a new user signs up. Run ENSURE_SIGNUP_PROFILE_TRIGGER.sql once in Supabase.';
