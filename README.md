# CarbonWise

CarbonWise is an AI-assisted sustainability app that helps users understand their carbon footprint, complete daily eco-quests, build streaks, and chat about their progress using saved report memory.

## Chosen Vertical

The chosen vertical is **personal carbon-footprint tracking and behavior change**.

The goal of CarbonWise is to make sustainability feel practical and repeatable, not abstract. Users answer a short onboarding assessment, receive a carbon index and AI-generated recommendations, complete daily tasks, and return to a dashboard that remembers their history.

## Approach And Logic

The solution is built as a full-stack app with a clear separation of responsibilities:

- **Frontend** handles the user experience, onboarding flow, dashboard, quests, reports, badges, and chatbot UI.
- **Backend** manages authentication, profile storage, scoring, quest generation, streak updates, report generation, and conversational memory.
- **Database** stores everything that should persist between logins: account data, assessment answers, analysis, quests, history, streak state, reports, and chat messages.

The main product logic is:

1. A user registers with email and password.
2. During registration, the user answers sustainability questions.
3. The backend stores the account and assessment data.
4. The backend calculates a carbon index from the answers and uses AI to generate a human-readable analysis.
5. The backend generates 3 personalized daily quests.
6. Completing quests updates points, streak, and history.
7. Reports and chatbot messages are saved so the user can return later and continue the same conversation.

## How The Solution Works

### 1) Authentication and onboarding

The app opens on a landing page with **Register** and **Login** options.

- Registration creates a unique account using email + password.
- The app prevents duplicate accounts for the same email.
- The registration flow also captures assessment answers needed for carbon analysis.
- Login uses the saved database credentials to authenticate the user and restore their saved state.

### 2) Carbon index calculation

The carbon index is not generated randomly.

- A deterministic scoring function calculates a base score from onboarding inputs like transport, diet, AC usage, shopping frequency, and plastic usage.
- AI is then used to generate the narrative explanation, category label, comparison text, and recommendations.
- The backend normalizes the final output so the score stays in a sensible range.

### 3) Daily quests and streaks

Each user gets **3 daily quests**.

- Quests are generated server-side and stored in the database.
- Users cannot manually create quests.
- Completing all 3 quests updates the streak.
- If the user misses a day, the streak resets.
- Because the data is stored in the backend, the user sees the same progress after logging back in.

### 4) Reports section

The reports page shows the saved AI report and a chatbot panel.

- Weekly-goal style content was removed.
- Report data is stored in the database and reloaded later.
- The chatbot uses **conversation memory + retrieval-based context** so it can answer questions about the user's own reports, quests, streak, and footprint history.
- Saved chat messages are reloaded when the page opens so the conversation can continue naturally.

### 5) Badges and profile

The profile section shows badges that unlock based on actual user activity.

- Some badges depend on completed quests.
- Some depend on streak length, score, saved carbon, or repeat logins.
- The badge counter shows only badges actually earned.

## Architecture Summary

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Flask + SQLAlchemy
- **Database**: MySQL schema defined in `backend/sqlscript.sql`
- **AI**: Gemini-powered generation for analysis, report text, quests, and chatbot responses

## Assumptions Made

These assumptions were used while building the project:

- One email maps to one user account.
- The user should complete the onboarding assessment once during registration.
- Daily quests should be exactly 3 and should refresh automatically.
- Streaks should reset if the user misses a day.
- Report and chatbot history should persist in the database, not local storage.
- AI should assist with narrative output, but the carbon index itself should remain deterministic and reproducible.
- The backend environment variables are configured manually by the user.

## Repository Structure

```text
CarbonWise/
|-- backend/
|   |-- app.py
|   |-- sqlscript.sql
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   `-- utils/
|   `-- package.json
`-- README.md
```

## Local Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Set these environment variables before running:

- `SECRET_KEY`
- `GEMINI_API_KEY`
- `DATABASE_URL` or `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_NAME`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

If the frontend runs on a different port from the backend, set:

- `VITE_API_BASE_URL`

## Notes

- All persistent state is designed to live in the backend database.
- The app is intended to feel like a sustainability coach, not just a tracker.
- The chatbot should be able to continue a conversation because previous messages are stored and reloaded.

## Live link
- Live Application: https://carbon-wise-navy.vercel.app
- Alternative Mirror: https://carbon-wise-git-main-shruti-bhundes-projects.vercel.app

## Author
### Shruti Bhunde
- Linkedin-www.linkedin.com/in/shruti-bhunde-bb9ab0388
