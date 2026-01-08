# 🚨 MISSION BRIEFING: ABSURD DATA FLYWHEEL [P0 - 20 MINS]

## 🔴 THE SITUATION
The **Absurd Data Flywheel** is broken. This is a P0 production incident.

Our creative engine generates video scripts, tracks their performance, and feeds insights back into the system to improve future scripts. This flywheel is the core of our product—without it, we're flying blind. The agents can't learn from what works. The creatives can't see which hooks drive viral performance. The entire feedback loop has stalled.

**The clock is ticking.** You have 20 minutes to restore the flywheel and prove this system can ship.

**Mission:** Fix the Absurd Data Flywheel. Get insights flowing from performance data back into script generation. Ship with Gemini 2.5 Pro.

---

## 🔴 THE PROBLEM

The **Absurd Data Flywheel** is broken. Our creative engine should generate video scripts, track their performance, and feed insights back to improve future scripts. This feedback loop is the core of our product—without it, we're flying blind.

**Your mission:** Restore the flywheel. Get performance insights flowing from the database back into the UI. The data exists in `performance_logs`, but creatives can't see it.

**Time limit:** 20 minutes

**Success criteria:** Performance data visible in the UI, metrics displayed, high performers highlighted.

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

6. **Open Your Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)



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