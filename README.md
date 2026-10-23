# DevFlow — Voice-Driven Developer Cockpit 🎙️⚡

> **Built for "No Hands: The Wispr Challenge" (WeMakeDevs × Wispr Flow)**  
> *Track: Builders (Developer Track)*  
> *Live Deployment: [https://bestjobtrackr.vercel.app](https://bestjobtrackr.vercel.app)*  
> *GitHub Repository: [https://github.com/Lakshya-2440/DevFlow](https://github.com/Lakshya-2440/DevFlow)*

---

## 🚀 What is DevFlow?

**DevFlow** is a high-craft developer cockpit that turns natural spoken thoughts into precise, production-grade terminal commands, safe git rebase chains, and code diffs.

Instead of typing verbose bash syntax, remembering complex git flags, or context switching out of your flow, hold **`Space`** (or click the glowing voice orb), speak naturally, and let DevFlow synthesize the exact commands and code for your workspace.

---

## 🏆 Key Features Built for the Wispr Challenge

### 1. Dual-Engine Developer Execution
- **Option C (Terminal & Git Assistant)**:
  - Speak: *"Rebase my branch on origin/main and push with lease"*
  - Result: Generates exact git commands with safety badges (**Safe**, **Warning**, **Destructive**), risk explanation, and 1-click execution into your local workspace.
- **Option A (Code & Bugfix Copilot)**:
  - Speak: *"Fix the CORS preflight issue and add 25MB buffer limit to voice audio endpoint"*
  - Result: Generates syntax-highlighted code diff, file path, and explanation with 1-click copy.
- **Standup & PR Digest**:
  - Summarizes spoken day notes and uncommitted workspace files into structured Slack/Discord standup updates.

### 2. ⚡ Wispr Flow MCP Integration
- Connects directly to Wispr Flow's official Remote MCP Server (`https://api.wisprflow.ai/connect/mcp`).
- Automatically pulls spoken meeting transcripts, voice scratchpad memos, and action items.
- Converts spoken meeting decisions into executable code and git branches with a single click.

### 3. 🔥 Wispr Flow Usage Leaderboard Tracker
- Built-in word counter tracking all words dictated via Wispr Flow and the web cockpit.
- Real-time Insights counter to help sweep the ₹1,00,000 Wispr Usage Leaderboard prize!

### 4. 🧠 Powered by Hugging Face Inference
- **Speech-to-Text**: `openai/whisper-large-v3-turbo` for instant voice transcription.
- **Developer LLM**: `Qwen/Qwen2.5-Coder-32B-Instruct` & `meta-llama/Llama-3.3-70B-Instruct` for zero-shot code & terminal generation.
- Client token storage in `localStorage` ensures zero token leaks.

### 5. ✨ Impeccable Design System
- Obsidian dark theme (`#07090e`), responsive glassmorphism, glowing audio spectrum canvas visualizer (`AudioVisualizer.tsx`) running real-time Web Audio API FFT analysis.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Vite, Lucide Icons, Canvas Confetti, Web Audio API FFT Analyzer (Deployed to **Vercel**).
- **Backend**: Node.js, Express, TypeScript, Multer, Axios, Child Process Workspace Executor, Model Context Protocol client (Configured for **Render** via `render.yaml`).
- **AI / Inference**: Hugging Face Serverless Inference API (Whisper STT + Qwen Coder).
- **Voice / MCP**: Wispr Flow Remote MCP (`https://api.wisprflow.ai/connect/mcp`).

---

## 🎬 2-Minute Demo Video Script (For Judges)

- **0:00 - 0:25 (The Pain)**: Show frustration of context switching between typing complex git rebase flags (`git rebase -i HEAD~3`, force-with-lease) and looking up syntax.
- **0:25 - 0:50 (The Wispr Flow Build)**: Show Wispr Flow desktop app running. Dictate voice commands into the DevFlow cockpit.
- **0:50 - 1:30 (Live Action)**: 
  1. Hold `Space` and say: *"Pull latest main, rebase my feature branch, and push with lease"*. Watch the live audio spectrum visualizer pulse, see the generated command with the "Safe" badge, and 1-click run.
  2. Click the **Wispr Flow MCP Connector** card. Pick a spoken meeting note: *"Need to install @modelcontextprotocol/sdk and add healthcheck endpoint"*. Click **"Turn Spoken Note Into Code"**. Watch Qwen 2.5 Coder generate the exact code diff.
- **1:30 - 2:00 (The Result & Leaderboard)**: Show the Wispr word count badge incrementing, and the deployed Vercel URL working live.

---

## 💻 Local Quickstart

```bash
# 1. Clone repository
git clone https://github.com/Lakshya-2440/DevFlow.git
cd DevFlow

# 2. Install all dependencies (root, backend, frontend)
npm run install:all

# 3. Start local development (both server + client concurrently)
npm run dev
```

- Frontend runs at: `http://localhost:5173`
- Backend API runs at: `http://localhost:3001`
- Configure your Hugging Face Token in Settings (`hf_...`).
