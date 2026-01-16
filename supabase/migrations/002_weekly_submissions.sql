-- Create weekly_submissions table
CREATE TABLE IF NOT EXISTS public.weekly_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apprentice_id UUID REFERENCES public.apprentices(id) ON DELETE CASCADE NOT NULL,
    week_number INTEGER NOT NULL,
    curriculum_item_id UUID REFERENCES public.curriculum_items(id) ON DELETE SET NULL,
    reflection_text TEXT CHECK (LENGTH(reflection_text) <= 1000),
    status TEXT CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved', 'rejected')) DEFAULT 'draft',
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(apprentice_id, week_number)
);

-- Create weekly_submission_files table
CREATE TABLE IF NOT EXISTS public.weekly_submission_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.weekly_submissions(id) ON DELETE CASCADE NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security on weekly_submissions
ALTER TABLE public.weekly_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy: Apprentices can manage their own submissions
CREATE POLICY "Apprentices can manage own submissions"
    ON public.weekly_submissions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.apprentices
            WHERE id = weekly_submissions.apprentice_id AND user_id = auth.uid()
        )
    );

-- Create policy: Mentors can view submissions for their apprentices
CREATE POLICY "Mentors can view apprentice submissions"
    ON public.weekly_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.apprentices
            WHERE id = weekly_submissions.apprentice_id AND mentor_id = auth.uid()
        )
    );

-- Create policy: Mentors can review submissions for their apprentices
CREATE POLICY "Mentors can review apprentice submissions"
    ON public.weekly_submissions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.apprentices
            WHERE id = weekly_submissions.apprentice_id AND mentor_id = auth.uid()
        )
    );

-- Create policy: Managers and gods can view all submissions
CREATE POLICY "Managers and gods can view all submissions"
    ON public.weekly_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('manager', 'god')
        )
    );

-- Create policy: Managers and gods can review all submissions
CREATE POLICY "Managers and gods can review all submissions"
    ON public.weekly_submissions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('manager', 'god')
        )
    );

-- Enable Row Level Security on weekly_submission_files
ALTER TABLE public.weekly_submission_files ENABLE ROW LEVEL SECURITY;

-- Create policy: Apprentices can view files for their own submissions
CREATE POLICY "Apprentices can view own submission files"
    ON public.weekly_submission_files FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.weekly_submissions ws
            JOIN public.apprentices a ON a.id = ws.apprentice_id
            WHERE ws.id = weekly_submission_files.submission_id 
            AND a.user_id = auth.uid()
        )
    );

-- Create policy: Mentors can view files for their apprentices' submissions
CREATE POLICY "Mentors can view apprentice submission files"
    ON public.weekly_submission_files FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.weekly_submissions ws
            JOIN public.apprentices a ON a.id = ws.apprentice_id
            WHERE ws.id = weekly_submission_files.submission_id 
            AND a.mentor_id = auth.uid()
        )
    );

-- Create policy: Managers and gods can view all submission files
CREATE POLICY "Managers and gods can view all submission files"
    ON public.weekly_submission_files FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('manager', 'god')
        )
    );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_weekly_submissions_apprentice_id ON public.weekly_submissions(apprentice_id);
CREATE INDEX IF NOT EXISTS idx_weekly_submissions_week_number ON public.weekly_submissions(week_number);
CREATE INDEX IF NOT EXISTS idx_weekly_submissions_status ON public.weekly_submissions(status);
CREATE INDEX IF NOT EXISTS idx_weekly_submission_files_submission_id ON public.weekly_submission_files(submission_id);

-- Create trigger to automatically update updated_at for weekly_submissions
CREATE TRIGGER update_weekly_submissions_updated_at BEFORE UPDATE ON public.weekly_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
