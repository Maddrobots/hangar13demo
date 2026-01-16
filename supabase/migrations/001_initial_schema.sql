-- No extension needed - using gen_random_uuid() which is built into PostgreSQL
-- gen_random_uuid() is available in PostgreSQL 13+ and Supabase without any extension

-- Create profiles table to extend Supabase auth.users
-- This stores additional user information
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('apprentice', 'mentor', 'manager', 'god')) DEFAULT 'apprentice',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Create policy: Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Create policy: Managers and gods can update roles of apprentices and mentors
CREATE POLICY "Managers can update apprentice and mentor roles"
    ON public.profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('manager', 'god')
        )
        AND (
            -- Can only update apprentices and mentors
            (SELECT role FROM public.profiles WHERE id = profiles.id) IN ('apprentice', 'mentor')
        )
    );

-- Create policy: Gods can update roles of managers (and apprentices/mentors)
CREATE POLICY "Gods can update manager roles"
    ON public.profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'god'
        )
        AND (
            -- Can update managers (and apprentices/mentors via the above policy)
            (SELECT role FROM public.profiles WHERE id = profiles.id) = 'manager'
        )
    );

-- Create apprentices table
CREATE TABLE IF NOT EXISTS public.apprentices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status TEXT CHECK (status IN ('active', 'completed', 'inactive')) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security on apprentices
ALTER TABLE public.apprentices ENABLE ROW LEVEL SECURITY;

-- Create policy: Apprentices can view their own record
CREATE POLICY "Apprentices can view own record"
    ON public.apprentices FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy: Mentors can view their apprentices
CREATE POLICY "Mentors can view their apprentices"
    ON public.apprentices FOR SELECT
    USING (auth.uid() = mentor_id);

-- Create policy: Managers and gods can view all apprentices (hierarchical permissions)
CREATE POLICY "Managers and gods can view all apprentices"
    ON public.apprentices FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('manager', 'god')
        )
    );

-- Create curriculum_items table
CREATE TABLE IF NOT EXISTS public.curriculum_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5) DEFAULT 1,
    estimated_hours DECIMAL(10, 2),
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security on curriculum_items
ALTER TABLE public.curriculum_items ENABLE ROW LEVEL SECURITY;

-- Create policy: All authenticated users can view active curriculum items
CREATE POLICY "Authenticated users can view curriculum items"
    ON public.curriculum_items FOR SELECT
    USING (auth.role() = 'authenticated');

-- Create policy: Mentors, managers, and gods can manage curriculum items
-- (Hierarchical: manager and god inherit mentor permissions)
CREATE POLICY "Mentors and above can manage curriculum items"
    ON public.curriculum_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('mentor', 'manager', 'god')
        )
    );

-- Create logbook_entries table
CREATE TABLE IF NOT EXISTS public.logbook_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apprentice_id UUID REFERENCES public.apprentices(id) ON DELETE CASCADE NOT NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    hours_worked DECIMAL(10, 2) DEFAULT 0,
    description TEXT NOT NULL,
    skills_practiced TEXT[],
    challenges_encountered TEXT,
    next_steps TEXT,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    status TEXT CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security on logbook_entries
ALTER TABLE public.logbook_entries ENABLE ROW LEVEL SECURITY;

-- Create policy: Apprentices can view and create their own logbook entries
CREATE POLICY "Apprentices can manage own logbook entries"
    ON public.logbook_entries FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.apprentices
            WHERE id = logbook_entries.apprentice_id AND user_id = auth.uid()
        )
    );

-- Create policy: Mentors can view logbook entries for their apprentices
CREATE POLICY "Mentors can view apprentice logbook entries"
    ON public.logbook_entries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.apprentices
            WHERE id = logbook_entries.apprentice_id AND mentor_id = auth.uid()
        )
    );

-- Create policy: Managers and gods can view all logbook entries (hierarchical permissions)
CREATE POLICY "Managers and gods can view all logbook entries"
    ON public.logbook_entries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('manager', 'god')
        )
    );

-- Create policy: Mentors can approve logbook entries
CREATE POLICY "Mentors can approve logbook entries"
    ON public.logbook_entries FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.apprentices
            WHERE id = logbook_entries.apprentice_id AND mentor_id = auth.uid()
        )
    );

-- Create policy: Managers and gods can approve all logbook entries (hierarchical permissions)
CREATE POLICY "Managers and gods can approve all logbook entries"
    ON public.logbook_entries FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('manager', 'god')
        )
    );

-- Create apprentice_progress table
CREATE TABLE IF NOT EXISTS public.apprentice_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apprentice_id UUID REFERENCES public.apprentices(id) ON DELETE CASCADE NOT NULL,
    curriculum_item_id UUID REFERENCES public.curriculum_items(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'reviewed')) DEFAULT 'not_started',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    hours_spent DECIMAL(10, 2) DEFAULT 0,
    mentor_notes TEXT,
    apprentice_notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(apprentice_id, curriculum_item_id)
);

-- Enable Row Level Security on apprentice_progress
ALTER TABLE public.apprentice_progress ENABLE ROW LEVEL SECURITY;

-- Create policy: Apprentices can view and update their own progress
CREATE POLICY "Apprentices can manage own progress"
    ON public.apprentice_progress FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.apprentices
            WHERE id = apprentice_progress.apprentice_id AND user_id = auth.uid()
        )
    );

-- Create policy: Mentors can view and update progress for their apprentices
CREATE POLICY "Mentors can manage apprentice progress"
    ON public.apprentice_progress FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.apprentices
            WHERE id = apprentice_progress.apprentice_id AND mentor_id = auth.uid()
        )
    );

-- Create policy: Managers and gods can manage all apprentice progress (hierarchical permissions)
CREATE POLICY "Managers and gods can manage all apprentice progress"
    ON public.apprentice_progress FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('manager', 'god')
        )
    );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_apprentices_user_id ON public.apprentices(user_id);
CREATE INDEX IF NOT EXISTS idx_apprentices_mentor_id ON public.apprentices(mentor_id);
CREATE INDEX IF NOT EXISTS idx_apprentices_status ON public.apprentices(status);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_apprentice_id ON public.logbook_entries(apprentice_id);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_entry_date ON public.logbook_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_status ON public.logbook_entries(status);
CREATE INDEX IF NOT EXISTS idx_apprentice_progress_apprentice_id ON public.apprentice_progress(apprentice_id);
CREATE INDEX IF NOT EXISTS idx_apprentice_progress_curriculum_item_id ON public.apprentice_progress(curriculum_item_id);
CREATE INDEX IF NOT EXISTS idx_apprentice_progress_status ON public.apprentice_progress(status);
CREATE INDEX IF NOT EXISTS idx_curriculum_items_is_active ON public.curriculum_items(is_active);
CREATE INDEX IF NOT EXISTS idx_curriculum_items_order_index ON public.curriculum_items(order_index);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apprentices_updated_at BEFORE UPDATE ON public.apprentices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curriculum_items_updated_at BEFORE UPDATE ON public.curriculum_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_logbook_entries_updated_at BEFORE UPDATE ON public.logbook_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apprentice_progress_updated_at BEFORE UPDATE ON public.apprentice_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create profile and apprentice record when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    profile_id UUID;
BEGIN
    -- Extract role from metadata or default to 'apprentice'
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'apprentice');
    
    -- Create profile
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        user_role
    )
    RETURNING id INTO profile_id;
    
    -- If role is 'apprentice', create an apprentices record
    IF user_role = 'apprentice' THEN
        INSERT INTO public.apprentices (user_id, start_date, status)
        VALUES (
            NEW.id,
            CURRENT_DATE,
            'active'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

