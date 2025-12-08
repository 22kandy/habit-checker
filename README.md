# Habit Checker

A Next.js habit tracking application that helps you build and maintain daily habits with streak tracking and encouraging feedback.

## Features

- **Unlimited Habits**: Add as many habits as you want to track
- **Daily Tracking**: Check off habits as you complete them each day
- **Streak Counting**: Track consecutive days for each habit
- **Encouraging Messages**: Get positive feedback when you complete habits
- **Statistics Dashboard**: View your progress and streaks
- **User Authentication**: Secure authentication with Supabase

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd habit-checker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Project Settings > API to get your credentials
   - Run the migration file in the Supabase SQL Editor:
     - Copy the contents of `supabase/migrations/001_initial_schema.sql`
     - Paste and execute in the SQL Editor

4. **Configure environment variables**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase credentials:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Sign up for a new account or sign in

## Database Schema

The application uses two main tables:

- **habits**: Stores user habits
- **habit_completions**: Tracks daily completions

Row Level Security (RLS) is enabled to ensure users can only access their own data.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables in Vercel project settings
4. Deploy!

The application is configured to work seamlessly with Vercel's hosting platform.

## Project Structure

```
habit-checker/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication callbacks
│   ├── habits/            # Habits management page
│   ├── stats/             # Statistics page
│   ├── login/             # Login page
│   └── signup/            # Signup page
├── components/            # React components
├── lib/                   # Utility functions and Supabase clients
├── supabase/              # Database migrations
└── public/                # Static assets
```

## Usage

1. **Sign Up/Login**: Create an account or sign in
2. **Add Habits**: Go to the Habits page and add habits you want to track
3. **Check Off Habits**: On the Dashboard, check off habits as you complete them
4. **View Stats**: Check your streaks and progress on the Stats page

## License

Apache License 2.0

