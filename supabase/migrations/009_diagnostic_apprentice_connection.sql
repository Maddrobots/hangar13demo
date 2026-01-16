-- Diagnostic query to check apprentice-profile connections
-- Run this in Supabase SQL Editor to see if apprentices are properly connected to profiles

-- This will show all apprentices and their connected profiles
SELECT 
    a.id as apprentice_id,
    a.user_id as apprentice_user_id,
    a.status as apprentice_status,
    p.id as profile_id,
    p.email as profile_email,
    p.full_name as profile_name,
    p.role as profile_role,
    CASE 
        WHEN a.user_id = p.id THEN '✓ Connected'
        ELSE '✗ MISMATCH'
    END as connection_status
FROM public.apprentices a
LEFT JOIN public.profiles p ON a.user_id = p.id
ORDER BY a.created_at DESC;

-- This will show any apprentices with missing or mismatched profiles
SELECT 
    a.id as apprentice_id,
    a.user_id as apprentice_user_id,
    a.status,
    'Missing or mismatched profile' as issue
FROM public.apprentices a
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = a.user_id
);

-- This will show any profiles with role='apprentice' that don't have apprentice records
SELECT 
    p.id as profile_id,
    p.email,
    p.full_name,
    p.role,
    'Missing apprentice record' as issue
FROM public.profiles p
WHERE p.role = 'apprentice'
AND NOT EXISTS (
    SELECT 1 FROM public.apprentices a WHERE a.user_id = p.id
);
