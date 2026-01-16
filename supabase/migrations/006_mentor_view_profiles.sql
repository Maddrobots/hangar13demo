-- Allow mentors to view profiles of apprentices for assignment and mentoring purposes
CREATE POLICY "Mentors can view apprentice profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'mentor'
        )
        AND (
            -- Can view profiles of users who are apprentices
            (SELECT role FROM public.profiles WHERE id = profiles.id) = 'apprentice'
        )
    );
