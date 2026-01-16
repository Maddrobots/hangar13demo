-- Create training_plans table
CREATE TABLE IF NOT EXISTS public.training_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    total_weeks INTEGER NOT NULL DEFAULT 130,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create training_plan_weeks table
CREATE TABLE IF NOT EXISTS public.training_plan_weeks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_plan_id UUID REFERENCES public.training_plans(id) ON DELETE CASCADE NOT NULL,
    week_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    ata_chapter TEXT,
    learning_objectives TEXT[] NOT NULL DEFAULT '{}',
    study_materials TEXT,
    practical_application TEXT,
    mentor_discussion_questions TEXT[] NOT NULL DEFAULT '{}',
    weekly_deliverable TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(training_plan_id, week_number)
);

-- Add training_plan_id to apprentices table
ALTER TABLE public.apprentices
ADD COLUMN IF NOT EXISTS training_plan_id UUID REFERENCES public.training_plans(id) ON DELETE SET NULL;

-- Enable Row Level Security on training_plans
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;

-- Create policy: All authenticated users can view active training plans
CREATE POLICY "Authenticated users can view training plans"
    ON public.training_plans FOR SELECT
    USING (auth.role() = 'authenticated');

-- Create policy: Mentors, managers, and gods can manage training plans
CREATE POLICY "Mentors and above can manage training plans"
    ON public.training_plans FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('mentor', 'manager', 'god')
        )
    );

-- Enable Row Level Security on training_plan_weeks
ALTER TABLE public.training_plan_weeks ENABLE ROW LEVEL SECURITY;

-- Create policy: All authenticated users can view training plan weeks
CREATE POLICY "Authenticated users can view training plan weeks"
    ON public.training_plan_weeks FOR SELECT
    USING (auth.role() = 'authenticated');

-- Create policy: Mentors, managers, and gods can manage training plan weeks
CREATE POLICY "Mentors and above can manage training plan weeks"
    ON public.training_plan_weeks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('mentor', 'manager', 'god')
        )
    );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_training_plan_weeks_training_plan_id ON public.training_plan_weeks(training_plan_id);
CREATE INDEX IF NOT EXISTS idx_training_plan_weeks_week_number ON public.training_plan_weeks(week_number);
CREATE INDEX IF NOT EXISTS idx_apprentices_training_plan_id ON public.apprentices(training_plan_id);

-- Create trigger to automatically update updated_at for training_plans
CREATE TRIGGER update_training_plans_updated_at BEFORE UPDATE ON public.training_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically update updated_at for training_plan_weeks
CREATE TRIGGER update_training_plan_weeks_updated_at BEFORE UPDATE ON public.training_plan_weeks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
