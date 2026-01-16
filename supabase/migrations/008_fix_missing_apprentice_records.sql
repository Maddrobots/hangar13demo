-- Fix missing apprentice records for existing users
-- This creates apprentice records for any users with role='apprentice' in profiles
-- who don't already have an apprentice record

INSERT INTO public.apprentices (user_id, start_date, status)
SELECT 
    p.id as user_id,
    CURRENT_DATE as start_date,
    'active' as status
FROM public.profiles p
WHERE p.role = 'apprentice'
AND NOT EXISTS (
    SELECT 1 
    FROM public.apprentices a 
    WHERE a.user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Ensure the trigger function and trigger exist
-- Recreate the trigger to ensure it's active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
