# Running the Hangar 13 Application

## Prerequisites

1. **Node.js** - Version 20.9.0 or higher (check with `node --version`)
2. **npm** - Comes with Node.js (check with `npm --version`)
3. **Supabase Account** - You'll need a Supabase project with the database schema set up

## Quick Start

### 1. Install Dependencies

If you haven't already installed the dependencies:

```bash
npm install
```

### 2. Set Up Environment Variables

Make sure your `.env.local` file exists in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-publishable-key
```

You can get these from your Supabase project settings: https://app.supabase.com/project/_/settings/api

### 3. Set Up the Database

Run the SQL migration file in your Supabase SQL Editor:
- File: `supabase/migrations/001_initial_schema.sql`
- Copy the contents and run it in Supabase Dashboard → SQL Editor

This creates all the necessary tables (profiles, apprentices, logbook_entries, curriculum_items, apprentice_progress) with proper relationships and RLS policies.

### 4. Run the Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

### 5. Open in Browser

Open your browser and navigate to:
- **Development**: http://localhost:3000

## What to Check

1. **Home Page** (`/`) - Should show the dashboard
2. **Authentication Pages**:
   - `/auth/login` - Login page
   - `/auth/signup` - Signup page
3. **Apprentice Dashboard**: `/dashboard/apprentice`
   - Redirects based on user role (if middleware is working)
4. **Mentor Dashboard**: `/dashboard/mentor`
   - Shows assigned apprentices and pending entries

## Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
npm run dev -- -p 3001
```

### Environment Variables Not Loading
- Make sure `.env.local` is in the root directory
- Restart the dev server after changing `.env.local`
- Check that variable names start with `NEXT_PUBLIC_` for client-side access

### Database Connection Issues
- Verify your Supabase URL and keys are correct
- Check that the database schema has been created
- Ensure RLS policies are set up correctly

### Build Errors
Run the linter to check for issues:
```bash
npm run lint
```

## Production Build

To create a production build:

```bash
npm run build
npm start
```

This creates an optimized production build and starts the production server.

## Additional Commands

- `npm run lint` - Run ESLint to check for code issues
- `npm run build` - Create a production build
- `npm start` - Start the production server (after building)

