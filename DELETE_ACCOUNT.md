# How to Delete Your Account

## Option 1: Via Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **Users** in the left sidebar
4. Find your user account (search by email)
5. Click on the user to open details
6. Click the **Delete** button (usually in the top right or at the bottom of the user details)
7. Confirm the deletion

This will delete the user from `auth.users`, which will automatically cascade delete:
- The profile in `profiles` table (due to `ON DELETE CASCADE`)
- Any related data in `apprentices`, `logbook_entries`, etc.

## Option 2: Via SQL Editor (Alternative)

If you prefer using SQL directly:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run this query (replace `your-email@example.com` with your actual email):

```sql
-- First, get your user ID
SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Then delete the user (replace 'USER_ID_HERE' with the ID from above)
-- This will cascade delete all related data
DELETE FROM auth.users WHERE email = 'your-email@example.com';
```

Or delete directly by email (if Supabase allows it):
```sql
DELETE FROM auth.users WHERE email = 'your-email@example.com';
```

## After Deletion

Once your account is deleted:
1. Log out of the application (if still logged in)
2. Clear your browser cookies/local storage for localhost:3000
3. Go to `/auth/signup` to create a new account
4. Select your role (Apprentice or Mentor) during signup

## Note

Since your profile table has `ON DELETE CASCADE` constraints, deleting the user from `auth.users` will automatically clean up all related records.
