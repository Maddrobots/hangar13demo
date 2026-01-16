-- WARNING: THIS DISABLES RLS - ONLY FOR DEVELOPMENT!
-- DO NOT USE IN PRODUCTION!
-- This should only be used temporarily to debug RLS issues

-- Disable RLS on apprentices table (TEMPORARY - FOR DEBUGGING ONLY)
ALTER TABLE public.apprentices DISABLE ROW LEVEL SECURITY;

-- To re-enable RLS later, run:
-- ALTER TABLE public.apprentices ENABLE ROW LEVEL SECURITY;
