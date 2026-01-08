# 🚨 MISSION BRIEFING: ABSURD DATA FLYWHEEL [P0 - 20 MINS]

## 🔴 THE SITUATION
The **Absurd Data Flywheel** is broken. This is a P0 production incident.

Our creative engine generates video scripts, tracks their performance, and feeds insights back into the system to improve future scripts. This flywheel is the core of our product—without it, we're flying blind. The agents can't learn from what works. The creatives can't see which hooks drive viral performance. The entire feedback loop has stalled.

**The clock is ticking.** You have 20 minutes to restore the flywheel and prove this system can ship.

**Mission:** Fix the Absurd Data Flywheel. Get insights flowing from performance data back into script generation. Ship with Gemini 2.5 Pro.

---

## 🎯 MISSION OBJECTIVES

The Absurd Data Flywheel has three critical breakpoints. Fix these to restore the feedback loop:

### 1. Restore Context Retrieval (The Learning Loop)
**Status:** 🔴 BROKEN

The agent in `app/api/chat/retrieval/route.ts` should be learning from our viral history, but it's not. The similarity threshold is misconfigured, so scripts aren't grounded in what actually works.

* **Task:** Fix the similarity threshold in the LangChain `ChatGoogleGenerativeAI` node.
* **Impact:** Without this, agents can't learn from past performance—the flywheel can't spin.
* **Files:** `app/api/chat/retrieval/route.ts`

### 2. Enable Search Grounding (Real-Time Context)
**Status:** 🔴 BROKEN

Scripts need to be grounded in *today's* trends, not just historical data. The founder's directive: pull live search results.

* **Task:** Enable **Google Search Grounding** in the Gemini model config.
* **Constraint:** **5 minutes max.** If the agent isn't pulling live search results, the demo fails.
* **Files:** `app/api/chat/agents/route.ts` (or relevant agent endpoint)

### 3. Build the Insights Dashboard (The Feedback Loop)
**Status:** 🔴 CRITICAL - THIS IS THE FLYWHEEL

This is the **core breakpoint**. The creatives can't see performance data, so they can't learn what drives virality. The data exists in `performance_logs`, but there's no UI to surface it. Without insights, the flywheel stops dead.

* **Task:** Build the Insights tab to:
  - Fetch performance data from the API
  - Display scripts with their metrics (views, likes, shares, viral_score)
  - Generate Gemini-powered summaries explaining why ads go viral
* **Files:** 
  - `app/insights/page.tsx` (currently locked)
  - `app/api/insights/performance/route.ts` (already exists)
  - `app/api/insights/generate-summary/route.ts` (needs implementation)
* **Impact:** This closes the loop. Creatives see what works → agents learn from patterns → better scripts → more data → flywheel spins.

**Priority:** Focus on Objective #3. This is the Data Flywheel's core mechanism.

---

## 🛠 SETUP: THE WAR ROOM
You have the tools. Get this running in **5 minutes**. The clock starts now.

### Prerequisites
- **Node.js** >= 18 (check with `node --version`)
  - Download from [nodejs.org](https://nodejs.org/) if needed
- **Yarn** package manager (install with `npm install -g yarn` if needed)
- **Google API Key** for Gemini ([Get one here](https://makersuite.google.com/app/apikey))
- **Git** (for cloning the repo)

**Works on:** Windows, macOS, and Linux

### Quick Start

> **Note:** All commands below work on Windows, macOS, and Linux. Use PowerShell, Command Prompt, Git Bash, or your preferred terminal on Windows.

1. **Fork this Repo**
   
   Click the "Fork" button at the top of this repository, then clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/AbsurdLangChain.git
   cd AbsurdLangChain
   ```
   
   > **Note:** After the interview, your fork will remain accessible to you. The seed repository may be made private to prevent new forks.

2. **Install Dependencies**
   ```bash
   yarn install
   ```
   *(If `yarn` is not found, install it: `npm install -g yarn`)*
   
   > **Windows users:** If you encounter permission issues, try running your terminal as Administrator or use `npm install` instead.
   
   > **Note:** The setup script will automatically configure Cursor hooks for prompt tracking.

3. **Set Up Environment Variables**
   
   Create a `.env.local` file in the root directory:
   
   **On macOS/Linux:**
   ```bash
   touch .env.local
   ```
   
   **On Windows (PowerShell):**
   ```powershell
   New-Item -Path .env.local -ItemType File
   ```
   
   **On Windows (Command Prompt):**
   ```cmd
   type nul > .env.local
   ```
   
   **Or manually:** Create a new file named `.env.local` in the project root using any text editor.
   
   Add your environment variables to `.env.local`:
   ```env
   GOOGLE_API_KEY=your_google_api_key_here
   ```
   
   **Required** (for Insights and retrieval features):
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_PRIVATE_KEY=your_supabase_private_key
   ```
   
   **Feature Flags:**
   ```env
   INSIGHTS_UNLOCKED=false
   ```
   
   **Optional** (for agent search features):
   ```env
   SERPAPI_API_KEY=your_serpapi_key
   ```

4. **Set Up Database (Required for Insights)**
   
   The Insights feature requires Supabase/PostgreSQL. Run the migrations:
   
   ```bash
   # If using Supabase CLI
   supabase db reset
   
   # Or manually run the SQL files in supabase/migrations/
   # 1. 001_initial_schema.sql - Creates video_scripts and performance_logs tables
   # 2. 002_seed_data.sql - Inserts sample data
   ```
   
   The migrations create:
   - `video_scripts` table - Stores generated video scripts
   - `performance_logs` table - Stores performance metrics (views, likes, shares, viral_score)
   - Seed data with 10 sample scripts and performance metrics

5. **Start the Development Server**
   ```bash
   yarn dev
   ```

6. **Setup Cursor Hooks (Automatic Prompt Tracking)**
   
   The setup script automatically configures Cursor hooks for tracking AI prompts. After `yarn install`:
   
   - ✅ Cursor hooks are automatically configured
   - ⚠️ **IMPORTANT:** Restart Cursor IDE to activate hooks
   
   **What this means:**
   - Use Cursor normally with your own API keys (GPT-4, Claude, Gemini, etc.)
   - All prompts are tracked automatically in the background
   - No Cursor settings configuration needed
   - Hooks work with any AI model you use in Cursor
   
   **⚠️ Known Issue:** There's a known bug in Cursor (versions 2.1.25+ on Windows) where `beforeSubmitPrompt` hooks may be called but not receive prompt data. If prompts aren't being logged:
   - Check Cursor's Output panel (Output tab → "Hooks" dropdown) to see what data Cursor is sending
   - Update Cursor to the latest version
   - Check `.cursor/logs/prompts-YYYYMMDD.log` for debug information

7. **Open Your Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### 🎯 Key Files: The Data Flywheel Components

**Core Flywheel Files (Priority Order):**
- **`app/insights/page.tsx`** - 🔒 **CRITICAL:** The Insights dashboard (currently locked - this is the flywheel's feedback mechanism)
- **`app/api/insights/performance/route.ts`** - Fetches performance metrics (views, likes, shares, viral_score)
- **`app/api/insights/generate-summary/route.ts`** - Generates Gemini summaries explaining viral performance patterns

**Agent & Retrieval Files:**
- **`app/api/chat/retrieval/route.ts`** - Retrieval agent (needs similarity threshold fix)
- **`app/api/chat/agents/route.ts`** - Agent with tool calling (needs search grounding)
- **`app/api/chat/route.ts`** - Simple chat endpoint
- **`app/api/chat/structured_output/route.ts`** - Structured output example

**Data Layer:**
- **`supabase/migrations/001_initial_schema.sql`** - Database schema (video_scripts, performance_logs)
- **`supabase/migrations/002_seed_data.sql`** - Seed data with performance metrics
- **`data/insights/seed-data.ts`** - Mock performance data (used if DB not configured)

### 🧪 Test Your Setup

1. Visit `http://localhost:3000`
2. Try the **Simple Chat** - should work with just `GOOGLE_API_KEY`
3. Check the **🔒 Insights** tab - shows locked state with mission objective
4. Try the **Retrieval** tab - requires Supabase setup (optional for mission)
5. Try the **Agent** tab - requires `SERPAPI_API_KEY` for search (optional)

### ⚡ Troubleshooting

- **"yarn: command not found"** → Run `npm install -g yarn`
- **"GOOGLE_API_KEY is not defined"** → Check your `.env.local` file exists and has the key
- **Port 3000 already in use:**
  - **macOS/Linux:** `PORT=3001 yarn dev`
  - **Windows (PowerShell):** `$env:PORT=3001; yarn dev`
  - **Windows (CMD):** `set PORT=3001 && yarn dev`
- **Module not found errors** → Run `yarn install` again
- **Windows: "touch is not recognized"** → Use `New-Item .env.local` in PowerShell or create the file manually
- **Windows: Permission denied** → Run your terminal as Administrator or use a different port
- **Cursor hooks not found** → Make sure the `.cursor/` directory with hooks exists in the repository
- **Hooks not working** → Make sure you restarted Cursor IDE completely after setup

### 📚 Resources

- [LangChain.js Docs](https://js.langchain.com/)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Next.js Docs](https://nextjs.org/docs)

---

## ⏱️ FINAL STATUS CHECK

**Mission:** Restore the Absurd Data Flywheel  
**Priority:** P0 - Production Incident  
**Time Limit:** 20 minutes  
**Success Criteria:** Insights dashboard operational, performance data flowing, Gemini summaries generating, feedback loop restored.

**The flywheel must spin. Start the timer.**