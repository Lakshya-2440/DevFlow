export interface CommandItem {
  command: string;
  explanation: string;
  safety: 'safe' | 'warning' | 'destructive';
}

export interface CodeBlock {
  filename?: string;
  language: string;
  diffOrSnippet: string;
  explanation: string;
}

export interface StandupNotes {
  done: string[];
  next: string[];
  blockers: string[];
}

export interface GeneratedResponse {
  type: 'terminal' | 'code' | 'standup' | 'general';
  title: string;
  summary: string;
  commands?: CommandItem[];
  code?: CodeBlock;
  standupNotes?: StandupNotes;
}

export interface WorkspaceStatus {
  isGitRepo: boolean;
  branch: string;
  dirtyFiles: string[];
  recentCommits: string[];
  cwd: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

const getApiBase = (): string => {
  return localStorage.getItem('devflow_backend_url') || '';
};

const getHfToken = (): string => {
  return localStorage.getItem('devflow_hf_token') || '';
};

export const api = {
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const token = getHfToken();
    const base = getApiBase();

    // Try backend proxy if available
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      if (token) formData.append('token', token);

      const res = await fetch(`${base}/api/voice/transcribe`, {
        method: 'POST',
        headers: token ? { 'x-hf-token': token } : undefined,
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.transcription) return data.transcription;
      }
    } catch {
      console.warn('Backend transcribe unavailable, falling back to direct HF API...');
    }

    // Direct HF Whisper API fallback (pure client-side)
    if (!token) {
      throw new Error('Please configure your Hugging Face Token in Settings (gear icon).');
    }

    const hfRes = await fetch(
      'https://api-inference.huggingface.co/models/openai/whisper-large-v3-turbo',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'audio/wav',
        },
        body: audioBlob,
      }
    );

    if (!hfRes.ok) {
      const err = await hfRes.json().catch(() => ({ error: 'Whisper failed' }));
      throw new Error(err.error || `HF Whisper returned HTTP ${hfRes.status}`);
    }

    const data = await hfRes.json();
    return data.text || '';
  },

  async generate(
    prompt: string,
    mode: 'auto' | 'terminal' | 'code' | 'standup' = 'auto',
    includeContext: boolean = true,
    workspaceContext?: string
  ): Promise<GeneratedResponse> {
    const token = getHfToken();
    const base = getApiBase();

    // 1. Try Backend API
    try {
      const res = await fetch(`${base}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-hf-token': token } : {}),
        },
        body: JSON.stringify({
          prompt,
          mode,
          includeContext,
          workspaceContext,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      console.warn('Backend generate unavailable, attempting direct HF inference...');
    }

    // 2. Direct HF Inference Fallback
    if (!token) {
      throw new Error('Please configure your Hugging Face Token in Settings (gear icon).');
    }

    const model = localStorage.getItem('devflow_hf_model') || 'Qwen/Qwen2.5-Coder-32B-Instruct';

    const systemPrompt = `You are DevFlow, an elite AI developer cockpit engine.
Turn user's natural language into exact terminal commands, git actions, or code snippets.
Return ONLY valid JSON matching this format:
{
  "type": "terminal" | "code" | "standup",
  "title": "Short title",
  "summary": "Crisp 1-sentence summary",
  "commands": [
    {
      "command": "git command",
      "explanation": "why",
      "safety": "safe" | "warning" | "destructive"
    }
  ],
  "code": {
    "filename": "path/file.ts",
    "language": "typescript",
    "diffOrSnippet": "code here",
    "explanation": "why"
  }
}`;

    const hfRes = await fetch(
      `https://api-inference.huggingface.co/models/${model}/v1/chat/completions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 1500,
        }),
      }
    );

    if (!hfRes.ok) {
      const err = await hfRes.json().catch(() => ({ error: 'HF generation failed' }));
      throw new Error(err.error || `HF returned HTTP ${hfRes.status}`);
    }

    const json = await hfRes.json();
    const rawContent = json.choices?.[0]?.message?.content || '{}';

    let clean = rawContent.trim();
    if (clean.startsWith('```json')) clean = clean.slice(7);
    else if (clean.startsWith('```')) clean = clean.slice(3);
    if (clean.endsWith('```')) clean = clean.slice(0, -3);

    return JSON.parse(clean.trim());
  },

  async getWorkspaceStatus(): Promise<WorkspaceStatus | null> {
    try {
      const res = await fetch(`${getApiBase()}/api/workspace/status`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Local backend not reachable (e.g. standalone preview)
    }
    return null;
  },

  async getDiff(): Promise<string> {
    try {
      const res = await fetch(`${getApiBase()}/api/workspace/diff`);
      if (res.ok) {
        const json = await res.json();
        return json.data?.diff || '';
      }
    } catch {
      // fallback
    }
    return '';
  },

  async executeCommand(command: string): Promise<ExecutionResult> {
    const res = await fetch(`${getApiBase()}/api/workspace/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });

    if (!res.ok) {
      throw new Error(`Failed to execute command: HTTP ${res.status}`);
    }

    const json = await res.json();
    return json.data;
  },

  async connectMcp(token?: string): Promise<{ endpoint: string; tools: any[] }> {
    try {
      const res = await fetch(`${getApiBase()}/api/mcp/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return {
      endpoint: 'https://api.wisprflow.ai/connect/mcp',
      tools: [
        { name: 'get_meeting_notes', description: 'Fetch meeting notes from Wispr Flow' },
        { name: 'get_scratchpad', description: 'Fetch voice scratchpad from Wispr Flow' },
      ],
    };
  },

  async syncMcpToCode(noteText: string, toolName?: string): Promise<GeneratedResponse> {
    const token = getHfToken();
    const res = await fetch(`${getApiBase()}/api/mcp/sync-to-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'x-hf-token': token } : {}),
      },
      body: JSON.stringify({ noteText, toolName }),
    });

    if (!res.ok) {
      throw new Error('Failed to sync Wispr MCP notes to code.');
    }

    const json = await res.json();
    return json.data;
  },
};
