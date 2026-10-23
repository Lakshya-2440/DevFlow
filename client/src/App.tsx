import React, { useState, useEffect, useCallback } from 'react';
import {
  Compass,
  Terminal,
  FileCode,
  CalendarCheck,
  Send,
  Loader2,
  Clock,
  Trash2,
  Network,
  Sparkles,
} from 'lucide-react';
import { WorkspaceBar } from './components/WorkspaceBar';
import { PushToTalkOrb } from './components/PushToTalkOrb';
import { TerminalOutputCard } from './components/TerminalOutputCard';
import { CodeOutputCard } from './components/CodeOutputCard';
import { StandupCard } from './components/StandupCard';
import { SettingsModal } from './components/SettingsModal';
import { DiffDrawer } from './components/DiffDrawer';
import { useVoiceRecorder } from './hooks/useVoiceRecorder';
import { api, GeneratedResponse, WorkspaceStatus } from './services/api';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  const [mode, setMode] = useState<'auto' | 'terminal' | 'code' | 'standup'>('auto');
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMcpSyncing, setIsMcpSyncing] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<GeneratedResponse | null>(null);
  const [history, setHistory] = useState<GeneratedResponse[]>([]);
  const [workspaceStatus, setWorkspaceStatus] = useState<WorkspaceStatus | null>(null);
  const [diffText, setDiffText] = useState('');
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [wisprWords, setWisprWords] = useState(0);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDiffDrawerOpen, setIsDiffDrawerOpen] = useState(false);

  const refreshWorkspace = useCallback(async () => {
    const status = await api.getWorkspaceStatus();
    if (status) {
      setWorkspaceStatus(status);
      setIsBackendConnected(true);
      const diff = await api.getDiff();
      setDiffText(diff);
    } else {
      setIsBackendConnected(false);
    }

    const words = parseInt(localStorage.getItem('devflow_wispr_words') || '0', 10);
    setWisprWords(words);
  }, []);

  useEffect(() => {
    refreshWorkspace();
  }, [refreshWorkspace]);

  const handleGenerate = async (textToUse?: string) => {
    const finalPrompt = (textToUse || promptInput).trim();
    if (!finalPrompt) return;

    setIsGenerating(true);
    try {
      const response = await api.generate(finalPrompt, mode, true);
      setCurrentResponse(response);
      setHistory((prev) => [response, ...prev.slice(0, 9)]);

      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#06b6d4', '#10b981'],
      });

      refreshWorkspace();
    } catch (err: any) {
      alert(err.message || 'Failed to generate dev flow.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMcpQuickSync = async () => {
    setIsMcpSyncing(true);
    try {
      const note =
        'Spoken meeting action items: Create a feature branch for wispr-mcp connector, update git diff executor timeout, and test healthcheck endpoint.';
      const res = await api.syncMcpToCode(note, 'get_meeting_notes');
      setCurrentResponse(res);
      setHistory((prev) => [res, ...prev.slice(0, 9)]);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#818cf8', '#34d399'],
      });
      refreshWorkspace();
    } catch (err: any) {
      alert(err.message || 'Wispr MCP sync failed.');
    } finally {
      setIsMcpSyncing(false);
    }
  };

  const {
    isRecording,
    isTranscribing,
    liveTranscript,
    mediaStream,
    startRecording,
    stopRecording,
  } = useVoiceRecorder({
    onTranscribed: (text) => {
      setPromptInput(text);
      handleGenerate(text);
      refreshWorkspace();
    },
    onError: (err) => {
      console.warn('Voice error:', err);
    },
  });

  const samplePrompts = [
    { label: 'Rebase on Main & Push Lease', text: 'Rebase my branch on origin/main and force-push with lease', mode: 'terminal' },
    { label: 'Fix CORS Audio Endpoint', text: 'Fix the CORS issue and bump audio multer buffer to 25MB in server', mode: 'code' },
    { label: 'Docker Compose Stack', text: 'Write a docker-compose for PostgreSQL, Redis, and Node with healthchecks', mode: 'code' },
    { label: 'Daily Standup Summary', text: 'Summarize today git commits and changed files into clean slack standup notes', mode: 'standup' },
  ];

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* Workspace Bar */}
      <WorkspaceBar
        status={workspaceStatus}
        isBackendConnected={isBackendConnected}
        wisprWords={wisprWords}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDiffDrawer={() => setIsDiffDrawerOpen(true)}
        onRefreshWorkspace={refreshWorkspace}
      />

      {/* Hero Cockpit */}
      <div
        className="glass-panel"
        style={{
          padding: '36px 32px',
          background: 'rgba(10, 13, 20, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        {/* Mode Selector + MCP Sync Pill */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '4px',
              borderRadius: '10px',
              backgroundColor: '#07090e',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              gap: '4px',
            }}
          >
            {[
              { id: 'auto', label: 'Auto-Detect', icon: Compass },
              { id: 'terminal', label: 'Terminal & Git', icon: Terminal },
              { id: 'code', label: 'Code & Bugfix', icon: FileCode },
              { id: 'standup', label: 'Standup', icon: CalendarCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setMode(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '7px',
                    border: 'none',
                    backgroundColor: isActive ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-faint)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={13} color={isActive ? '#818cf8' : 'currentColor'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Wispr Flow MCP Quick Sync Button */}
          <button
            onClick={handleMcpQuickSync}
            disabled={isMcpSyncing}
            className="btn-secondary"
            style={{
              padding: '7px 14px',
              fontSize: '12px',
              borderColor: 'rgba(99, 102, 241, 0.35)',
              background: 'rgba(99, 102, 241, 0.1)',
              color: '#c7d2fe',
            }}
            title="Sync meeting action items from api.wisprflow.ai/connect/mcp"
          >
            {isMcpSyncing ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Network size={13} color="#818cf8" />
            )}
            <span>{isMcpSyncing ? 'Syncing MCP...' : 'Wispr MCP Sync'}</span>
          </button>
        </div>

        {/* Central Push-To-Talk Voice Orb */}
        <PushToTalkOrb
          isRecording={isRecording}
          isTranscribing={isTranscribing}
          liveTranscript={liveTranscript}
          mediaStream={mediaStream}
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
        />

        {/* Prompt Input Field */}
        <div
          style={{
            borderRadius: '12px',
            backgroundColor: '#07090e',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGenerate();
            }}
            placeholder="Hold Spacebar to speak, or refine instructions here..."
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '13.5px',
              fontFamily: 'var(--font-sans)',
            }}
          />

          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating || !promptInput.trim()}
            className="btn-primary"
            style={{
              padding: '7px 16px',
              fontSize: '12.5px',
              opacity: !promptInput.trim() || isGenerating ? 0.6 : 1,
            }}
          >
            {isGenerating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            <span>Synthesize</span>
          </button>
        </div>

        {/* Suggested Prompts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11.5px', color: 'var(--text-faint)', fontWeight: 500 }}>
            Suggestions:
          </span>
          {samplePrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPromptInput(item.text);
                setMode(item.mode as any);
                handleGenerate(item.text);
              }}
              className="btn-secondary"
              style={{
                fontSize: '11.5px',
                padding: '4px 9px',
                borderRadius: '6px',
                color: 'var(--text-muted)',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isGenerating && (
        <div
          className="glass-panel"
          style={{
            padding: '32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '32px',
          }}
        >
          <Loader2 size={24} className="animate-spin" style={{ color: '#818cf8' }} />
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>
            Synthesizing Workspace Output...
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-faint)' }}>
            Processing speech with Whisper & Qwen 2.5 Coder
          </div>
        </div>
      )}

      {/* Active Output */}
      {currentResponse && !isGenerating && (
        <div style={{ marginBottom: '32px' }}>
          {currentResponse.type === 'terminal' && currentResponse.commands && (
            <TerminalOutputCard
              commands={currentResponse.commands}
              title={currentResponse.title}
              summary={currentResponse.summary}
              isBackendConnected={isBackendConnected}
              onExecutionComplete={() => refreshWorkspace()}
            />
          )}

          {currentResponse.type === 'code' && currentResponse.code && (
            <CodeOutputCard
              code={currentResponse.code}
              title={currentResponse.title}
              summary={currentResponse.summary}
            />
          )}

          {currentResponse.type === 'standup' && currentResponse.standupNotes && (
            <StandupCard
              notes={currentResponse.standupNotes}
              title={currentResponse.title}
              summary={currentResponse.summary}
            />
          )}

          {currentResponse.type === 'general' && currentResponse.commands && (
            <TerminalOutputCard
              commands={currentResponse.commands}
              title={currentResponse.title}
              summary={currentResponse.summary}
              isBackendConnected={isBackendConnected}
              onExecutionComplete={() => refreshWorkspace()}
            />
          )}
        </div>
      )}

      {/* Recent History */}
      {history.length > 1 && (
        <div style={{ marginTop: '36px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={15} color="#818cf8" />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>
                Recent Actions ({history.length})
              </h3>
            </div>
            <button
              onClick={() => setHistory([])}
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              <Trash2 size={12} /> Clear
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.slice(1).map((item, idx) => (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(10, 13, 20, 0.65)',
                }}
              >
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#f8fafc' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-faint)' }}>
                    {item.summary}
                  </div>
                </div>
                <button
                  onClick={() => setCurrentResponse(item)}
                  className="btn-secondary"
                  style={{ fontSize: '11.5px', padding: '5px 10px' }}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={refreshWorkspace}
      />

      <DiffDrawer
        isOpen={isDiffDrawerOpen}
        onClose={() => setIsDiffDrawerOpen(false)}
        status={workspaceStatus}
        diffText={diffText}
      />
    </div>
  );
};
