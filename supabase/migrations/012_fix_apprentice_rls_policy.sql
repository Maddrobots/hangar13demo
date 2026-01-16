-- Fix RLS policy for apprentices to view their own record
-- Ensure the policy exists and works correctly

-- Check if RLS is enabled
ALTER TABLE public.apprentices ENABLE ROW LEVEL SECURITY;

-- Drop the existing policy if it exists and recreate it
DROP POLICY IF EXISTS "Apprentices can view own record" ON public.apprentices;

-- Recreate the policy - apprentices can view their own record
-- This uses auth.uid() which is the authenticated user's ID from auth.users
-- and matches it against the user_id in the apprentices table
CREATE POLICY "Apprentices can view own record"
    ON public.apprentices FOR SELECT
    USING (auth.uid() = user_id);
