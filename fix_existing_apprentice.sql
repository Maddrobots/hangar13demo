-- Fix existing apprentice users who don't have an apprentices record
-- Run this in Supabase SQL Editor to create missing apprentice records

-- This will create an apprentice record for any user with role 'apprentice'
-- who doesn't already have an apprentices record
INSERT INTO public.apprentices (user_id, start_date, status)
SELECT 
    id as user_id,
    CURRENT_DATE as start_date,
    'active' as status
FROM public.profiles
WHERE role = 'apprentice'
AND id NOT IN (SELECT user_id FROM public.apprentices)
ON CONFLICT (user_id) DO NOTHING;

-- Verify the fix worked
SELECT 
    p.id,
    p.email,
    p.role,
    a.id as apprentice_id,
    a.status
FROM public.profiles p
LEFT JOIN public.apprentices a ON p.id = a.user_id
WHERE p.role = 'apprentice';
