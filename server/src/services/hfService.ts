import axios from 'axios';

export interface GeneratedResponse {
  type: 'terminal' | 'code' | 'standup' | 'general';
  title: string;
  summary: string;
  commands?: Array<{
    command: string;
    explanation: string;
    safety: 'safe' | 'warning' | 'destructive';
  }>;
  code?: {
    filename?: string;
    language: string;
    diffOrSnippet: string;
    explanation: string;
  };
  standupNotes?: {
    done: string[];
    next: string[];
    blockers: string[];
  };
}

export class HFService {
  private defaultModel = 'Qwen/Qwen2.5-Coder-32B-Instruct';
  private whisperModel = 'openai/whisper-large-v3-turbo';

  async transcribeAudio(audioBuffer: Buffer, token?: string): Promise<string> {
    const hfToken = token || process.env.HF_TOKEN;
    if (!hfToken) {
      throw new Error('Hugging Face token not provided.');
    }

    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${this.whisperModel}`,
        audioBuffer,
        {
          headers: {
            Authorization: `Bearer ${hfToken}`,
            'Content-Type': 'audio/wav',
          },
          timeout: 45000,
        }
      );

      if (response.data && response.data.text) {
        return response.data.text.trim();
      }
      throw new Error('No transcription returned from Whisper model.');
    } catch (error: any) {
      console.error('Whisper transcription error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.error || error.message || 'Failed to transcribe audio'
      );
    }
  }

  async generateDevResponse(
    prompt: string,
    workspaceContext?: string,
    mode: 'auto' | 'terminal' | 'code' | 'standup' = 'auto',
    token?: string,
    modelName?: string
  ): Promise<GeneratedResponse> {
    const hfToken = token || process.env.HF_TOKEN;
    if (!hfToken) {
      throw new Error('Hugging Face token not provided.');
    }

    const selectedModel = modelName || this.defaultModel;

    const systemPrompt = `You are DevFlow, an elite AI developer cockpit engine.
You turn spoken natural-language dev thoughts into precise, production-grade terminal commands, git actions, or code snippets.

Active Mode: ${mode}
Workspace Context (Git status / files / diff):
${workspaceContext || 'No active workspace context provided.'}

RULES:
1. Analyze the user's voice prompt carefully.
2. Determine if user wants terminal/git commands (like branching, rebasing, committing, npm scripts, docker), code/bug fix, or standup notes.
3. ALWAYS return a valid, parseable JSON object matching this TypeScript interface EXACTLY without markdown fence around it:
{
  "type": "terminal" | "code" | "standup" | "general",
  "title": "Short descriptive title",
  "summary": "Crisp 1-2 sentence explanation of what these commands or code do",
  "commands": [
    {
      "command": "git checkout -b feature/auth",
      "explanation": "Creates and switches to new branch",
      "safety": "safe" | "warning" | "destructive"
    }
  ],
  "code": {
    "filename": "src/auth.ts",
    "language": "typescript",
    "diffOrSnippet": "// clean code or diff here",
    "explanation": "Why this fixes the problem"
  },
  "standupNotes": {
    "done": ["Completed X", "Merged Y"],
    "next": ["Working on Z"],
    "blockers": ["None"]
  }
}
4. For terminal commands, mark safety accurately:
   - "safe": read-only or non-destructive (status, checkout, pull, log, lint, test)
   - "warning": modifies uncommitted state (rebase, commit, stash, npm install)
   - "destructive": deletes data or force-pushes (reset --hard, clean -fd, push --force, rm)
5. Return ONLY raw JSON. No prefix, no backticks, no comments.`;

    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${selectedModel}/v1/chat/completions`,
        {
          model: selectedModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 1500,
        },
        {
          headers: {
            Authorization: `Bearer ${hfToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No content returned from Hugging Face model.');
      }

      // Clean markdown code blocks if the model wrapped it
      let cleanJson = content.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.slice(7);
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.slice(3);
      }
      if (cleanJson.endsWith('```')) {
        cleanJson = cleanJson.slice(0, -3);
      }
      cleanJson = cleanJson.trim();

      return JSON.parse(cleanJson);
    } catch (error: any) {
      console.error('HF Generation error:', error.response?.data || error.message);
      // If JSON parse failed, build fallback structure
      if (error instanceof SyntaxError) {
        return {
          type: 'general',
          title: 'Processed Dev Flow',
          summary: 'Generated from voice prompt',
          commands: [
            {
              command: prompt,
              explanation: 'Voice transcription command',
              safety: 'safe',
            },
          ],
        };
      }
      throw new Error(
        error.response?.data?.error || error.message || 'Failed to generate response'
      );
    }
  }
}

export const hfService = new HFService();
