-- Test RLS policy to verify it's working correctly
-- This query will show what auth.uid() sees when checking the policy

-- First, let's see all policies on the apprentices table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as policy_expression,
    with_check
FROM pg_policies
WHERE tablename = 'apprentices'
ORDER BY policyname;

-- To test if RLS is blocking queries, run this as the apprentice user:
-- (This would need to be run in a context where auth.uid() is set)
-- SELECT auth.uid() as current_user_id, 
--        (SELECT id FROM public.apprentices WHERE user_id = auth.uid()) as apprentice_record_id;
