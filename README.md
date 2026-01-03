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
We provide the "bullets."

1. **Fork this Repo.**
2. **Run the Provisioning Script:** ```bash
   chmod +x setup-mission.sh && ./setup-mission.sh