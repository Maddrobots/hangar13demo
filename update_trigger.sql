-- Update the handle_new_user trigger function to create apprentice records
-- Run this in Supabase SQL Editor

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

-- Fix any existing apprentice users who don't have an apprentices record
INSERT INTO public.apprentices (user_id, start_date, status)
SELECT 
    id as user_id,
    CURRENT_DATE as start_date,
    'active' as status
FROM public.profiles
WHERE role = 'apprentice'
AND id NOT IN (SELECT user_id FROM public.apprentices WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;
