-- Fix apprentice records where user_id doesn't match profile id
-- This ensures all apprentices are properly connected to their profiles

-- First, let's see what we're working with
-- Update any apprentices where user_id doesn't match a valid profile
-- This shouldn't normally happen, but can fix data inconsistencies

-- If an apprentice has a user_id that doesn't match any profile,
-- try to find the profile by email or create the connection
UPDATE public.apprentices a
SET user_id = p.id
FROM public.profiles p
WHERE a.user_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM public.profiles p2 WHERE p2.id = a.user_id
)
AND EXISTS (
    -- Try to match by finding a profile with role='apprentice' that doesn't have an apprentice record
    SELECT 1 FROM public.profiles p3
    WHERE p3.role = 'apprentice'
    AND NOT EXISTS (SELECT 1 FROM public.apprentices a2 WHERE a2.user_id = p3.id)
    LIMIT 1
);

-- Ensure all profiles with role='apprentice' have apprentice records
INSERT INTO public.apprentices (user_id, start_date, status)
SELECT 
    p.id as user_id,
    COALESCE((SELECT MIN(start_date) FROM public.apprentices), CURRENT_DATE) as start_date,
    'active' as status
FROM public.profiles p
WHERE p.role = 'apprentice'
AND NOT EXISTS (
    SELECT 1 
    FROM public.apprentices a 
    WHERE a.user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;
