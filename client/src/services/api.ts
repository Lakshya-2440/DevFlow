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
  const custom = localStorage.getItem('devflow_backend_url');
  if (custom) return custom;
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return '';
  }
  return 'https://devflow-backend-lonx.onrender.com';
};

export const api = {
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const base = getApiBase();
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    const res = await fetch(`${base}/api/voice/transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Transcription failed' }));
      throw new Error(err.error || `Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.transcription || '';
  },

  async generate(
    prompt: string,
    mode: 'auto' | 'terminal' | 'code' | 'standup' = 'auto',
    includeContext: boolean = true,
    workspaceContext?: string
  ): Promise<GeneratedResponse> {
    const base = getApiBase();
    const model = localStorage.getItem('devflow_hf_model') || 'Qwen/Qwen2.5-Coder-32B-Instruct';

    const res = await fetch(`${base}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        mode,
        model,
        includeContext,
        workspaceContext,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Generation failed' }));
      throw new Error(err.error || `Server returned HTTP ${res.status}`);
    }

    const json = await res.json();
    return json.data;
  },

  async getWorkspaceStatus(): Promise<WorkspaceStatus | null> {
    try {
      const res = await fetch(`${getApiBase()}/api/workspace/status`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Backend unavailable or starting up
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
    const res = await fetch(`${getApiBase()}/api/mcp/sync-to-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ noteText, toolName }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Sync failed' }));
      throw new Error(err.error || 'Failed to sync Wispr MCP notes to code.');
    }

    const json = await res.json();
    return json.data;
  },
};
