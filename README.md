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

---

## 🛠 SETUP: THE WAR ROOM
We provide the "bullets." Get this running in **5 minutes**.

### Prerequisites
- **Node.js** >= 18 (check with `node --version`)
- **Yarn** package manager (install with `npm install -g yarn` if needed)
- **Google API Key** for Gemini ([Get one here](https://makersuite.google.com/app/apikey))

### Quick Start

1. **Clone/Fork this Repo**
   ```bash
   git clone <your-repo-url>
   cd AbsurdLangChain
   ```

2. **Install Dependencies**
   ```bash
   yarn install
   ```
   *(If `yarn` is not found, install it: `npm install -g yarn`)*

3. **Set Up Environment Variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   touch .env.local
   ```
   
   Add your Google API key:
   ```bash
   GOOGLE_API_KEY=your_google_api_key_here
   ```
   
   **Optional** (for retrieval features):
   ```bash
   SUPABASE_URL=your_supabase_url
   SUPABASE_PRIVATE_KEY=your_supabase_private_key
   ```
   
   **Optional** (for agent search features):
   ```bash
   SERPAPI_API_KEY=your_serpapi_key
   ```

4. **Start the Development Server**
   ```bash
   yarn dev
   ```

5. **Open Your Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### 🎯 Key Files to Know

- **`app/api/chat/retrieval/route.ts`** - The retrieval agent you need to fix
- **`app/api/chat/agents/route.ts`** - Agent with tool calling
- **`app/api/chat/route.ts`** - Simple chat endpoint
- **`app/api/chat/structured_output/route.ts`** - Structured output example

### 🧪 Test Your Setup

1. Visit `http://localhost:3000`
2. Try the **Simple Chat** - should work with just `GOOGLE_API_KEY`
3. Try the **Retrieval** tab - requires Supabase setup (optional for mission)
4. Try the **Agent** tab - requires `SERPAPI_API_KEY` for search (optional)

### ⚡ Troubleshooting

- **"yarn: command not found"** → Run `npm install -g yarn`
- **"GOOGLE_API_KEY is not defined"** → Check your `.env.local` file exists and has the key
- **Port 3000 already in use** → Kill the process or use `PORT=3001 yarn dev`
- **Module not found errors** → Run `yarn install` again

### 📚 Resources

- [LangChain.js Docs](https://js.langchain.com/)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Next.js Docs](https://nextjs.org/docs)

**Ready? Start the timer. You have 20 minutes.**