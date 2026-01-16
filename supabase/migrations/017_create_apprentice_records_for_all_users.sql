-- Update the handle_new_user function to create apprentice records for ALL users
-- This ensures everyone has an apprentice record, not just those with role='apprentice'

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
    
    -- Create an apprentice record for ALL users regardless of role
    -- This allows everyone to access apprentice features if needed
    INSERT INTO public.apprentices (user_id, start_date, status)
    VALUES (
        NEW.id,
        CURRENT_DATE,
        'active'
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create apprentice records for any existing users who don't have one
INSERT INTO public.apprentices (user_id, start_date, status)
SELECT 
    p.id as user_id,
    CURRENT_DATE as start_date,
    'active' as status
FROM public.profiles p
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.apprentices a 
    WHERE a.user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;
