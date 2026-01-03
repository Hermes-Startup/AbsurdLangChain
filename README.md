# 🦜️🔗 MISSION: GEMINI CREATIVE ENGINE [20 MINS]

## 🚨 THE SITUATION
The creative engine is stalling. We're building for the next billion views, and our agents are failing to leverage the 1M token context window. The "Data Flywheel" is broken: it's not retrieving the viral hooks we need from the Postgres archive.

**Goal:** Restore the agentic flow. Prove you can ship with Gemini 2.5 Pro.

---

## 🎯 OBJECTIVES

### 1. Fix the "Context Retrieval" (Gemini/Node.js)
The agent in `app/api/chat/retrieval/route.ts` is failing to ground its scripts in our viral history. 
* **Task:** Correct the similarity threshold in the LangChain `ChatGoogleGenerativeAI` node.
* **Signal:** Can you tune an AI-native retrieval system without breaking the loop?

### 2. Implement "Search Grounding" (The Pivot)
The founder just called—we need the scripts to be grounded in *today's* news.
* **Task:** Enable **Google Search Grounding** in the Gemini model config. 
* **Constraint:** You have **5 minutes**. If the agent isn't pulling live search results into the video script, the demo fails.

### 3. Build the "Insights" Tab (Data Flywheel)
The creatives need to see 'Ad Performance Scores' for their generated scripts. The data is already in the `performance_logs` table.
* **Task:** Build the 'Insights' tab to fetch this data and show a Gemini-generated summary of why the ad is likely to go viral.
* **Files:** `app/insights/page.tsx`, `app/api/insights/performance/route.ts`, `app/api/insights/generate-summary/route.ts`
* **Signal:** Can you build full-stack features that help creatives understand what drives performance?

---

## 🛠 SETUP: THE WAR ROOM
We provide the "bullets." Get this running in **5 minutes**.

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
   
   **Optional** (for Insights with database - uses mock data by default):
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_PRIVATE_KEY=your_supabase_private_key
   ```
   
   **Optional** (for retrieval features):
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

4. **Database Setup (Optional)**
   
   The Insights feature works out-of-the-box with mock data. No database setup required!
   
   **Optional:** If you want to use Supabase instead of mock data:
   
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
   
   **Note:** The API automatically uses mock data if Supabase is not configured.

5. **Start the Development Server**
   ```bash
   yarn dev
   ```

6. **Open Your Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### 🎯 Key Files to Know

- **`app/api/chat/retrieval/route.ts`** - The retrieval agent you need to fix
- **`app/api/chat/agents/route.ts`** - Agent with tool calling
- **`app/api/chat/route.ts`** - Simple chat endpoint
- **`app/api/chat/structured_output/route.ts`** - Structured output example
- **`app/insights/page.tsx`** - 🔒 Locked Insights tab (your mission)
- **`app/api/insights/performance/route.ts`** - API to fetch performance data
- **`app/api/insights/generate-summary/route.ts`** - API to generate Gemini summaries
- **`supabase/migrations/`** - Database schema and seed data

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

**Ready? Start the timer. You have 20 minutes.**