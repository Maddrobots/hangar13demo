-- Fix infinite recursion in RLS policies
-- The issue is that policies that query profiles table cause recursion
-- We need to use a different approach that doesn't query profiles within the policy

-- Drop the problematic mentor profile policy that causes recursion
DROP POLICY IF EXISTS "Mentors can view apprentice profiles" ON public.profiles;

-- Instead of checking profiles.role in the policy (which causes recursion),
-- we'll use a simpler approach: allow mentors to view profiles of apprentices
-- by checking if there's an apprentice record where the mentor could be assigned
-- But actually, this is tricky. Let's use a different approach:

-- Use a SECURITY DEFINER function to check roles without triggering RLS
CREATE OR REPLACE FUNCTION public.is_mentor()
RETURNS BOOLEAN AS $$
BEGIN
    -- This function bypasses RLS because it's SECURITY DEFINER
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'mentor'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now create the policy using the function instead of direct query
CREATE POLICY "Mentors can view apprentice profiles"
    ON public.profiles FOR SELECT
    USING (
        -- Use the function instead of direct query to avoid recursion
        public.is_mentor() 
        AND 
        -- Only allow viewing profiles of apprentices
        role = 'apprentice'
    );
