-- Test query to help debug auth.uid() in RLS policies
-- This will show how the policy evaluation works

-- When you run queries as an authenticated user in Supabase SQL Editor,
-- you can test the policy like this:
-- 
-- SELECT 
--     auth.uid() as current_auth_user_id,
--     a.id as apprentice_id,
--     a.user_id as apprentice_user_id,
--     a.user_id = auth.uid() as should_match,
--     CASE 
--         WHEN a.user_id = auth.uid() THEN 'Policy should allow'
--         ELSE 'Policy should block'
--     END as policy_result
-- FROM public.apprentices a
-- WHERE a.user_id = auth.uid();

-- However, to properly test this from the application side,
-- we need to ensure the server client is passing auth correctly

-- Alternative: Let's add a more permissive policy temporarily for testing
-- This will allow any authenticated user to see their own apprentice record
-- (which should be the same as the existing policy, but let's be explicit)

-- Actually, wait - let me check if there's a conflict. The policy should work.
-- The issue might be that the server-side client isn't properly authenticating.
