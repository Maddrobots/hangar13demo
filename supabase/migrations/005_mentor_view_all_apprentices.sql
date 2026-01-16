-- Allow mentors to view all apprentices for assignment purposes
-- This policy allows mentors to see all apprentices so they can assign them to themselves
-- Note: Using the is_mentor() function to avoid infinite recursion with profiles table

-- First, ensure the is_mentor() function exists (created in migration 016)
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

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Mentors can view all apprentices for assignment" ON public.apprentices;

-- Create the policy using the function instead of direct query
CREATE POLICY "Mentors can view all apprentices for assignment"
    ON public.apprentices FOR SELECT
    USING (public.is_mentor());
