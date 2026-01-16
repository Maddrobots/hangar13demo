-- Allow mentors to view logbook entries for all apprentices for assignment purposes
-- This allows mentors to see total hours when viewing unassigned apprentices
CREATE POLICY "Mentors can view all apprentice logbook entries for assignment"
    ON public.logbook_entries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'mentor'
        )
    );
