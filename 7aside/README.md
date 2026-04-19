# 7-A-Side Football League Management System

A dynamic, production-ready web application for managing a 7-a-side football tournament. This system features a public-facing portal for fans to view standings and fixtures, alongside a secure administrative backend for tournament organizers to log Match fixtures, update results, and track top scorers.

## 🚀 Tech Stack

- **Frontend Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Database & Authentication:** [Supabase](https://supabase.com/)
- **Styling:** Custom CSS (Dark theme with glassmorphism UI)
- **Icons:** [Lucide React](https://lucide.dev/)

## ✨ Key Features

### Public Portal (Read-Only)
- **Live Leaderboard:** Real-time point tables split across multiple groups (e.g., Group A, Group B) with goal difference (GD) calculations.
- **Top Scorers:** View the highest goal scorers in the tournament.
- **Match Fixtures & Results:** View past match results and upcoming fixtures filtered by schedule stages (Group Stage, Semi-Finals, Finals).

### Admin Dashboard (Authenticated)
- **Restricted Access:** Secured by Supabase App Authentication.
- **Team Management:** Register new teams and categorize them into specific groups.
- **Player Management:** Add players to participating teams and credit them with goals scored.
- **Fixture Scheduling:** Schedule new matches between teams and categorize match phases.
- **Result Updating:** Enter and save definitive scores for the scheduled match fixtures.

## 💻 Running Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- A [Supabase](https://supabase.com/) account and a running project.

### 1. Clone & Install Dependencies
Navigate to the project root and install the necessary dependencies:

```bash
npm install
```

### 2. Environment Variables
You need to connect the app to your Supabase project. Create a `.env` file in the root directory and add the following keys:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

*(You can find these in your Supabase Dashboard under Settings > API).*

### 3. Database Schema setup
Ensure your linked Supabase Postgres database has tables set up for the data models mapping to the app:
- `teams` (id, name, group_name)
- `players` (id, name, team_id, goals)
- `matches` (id, home_team_id, away_team_id, home_score, away_score, is_played, stage, group_name, match_date)

*(Note: Row Level Security (RLS) policies must be correctly configured in Supabase to allow public READ access and authenticated authenticated/admin-only INSERT/UPDATE access).*

### 4. Start the Application
Boot up the Vite development server:
```bash
npm run dev
```

The application should now be running locally, typically on `http://localhost:5173`.
