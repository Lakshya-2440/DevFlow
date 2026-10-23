import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Terminal,
  FileCode,
  CalendarCheck,
  Send,
  Loader2,
  Clock,
  Trash2,
  Compass,
} from 'lucide-react';
import { WorkspaceBar } from './components/WorkspaceBar';
import { PushToTalkOrb } from './components/PushToTalkOrb';
import { TerminalOutputCard } from './components/TerminalOutputCard';
import { CodeOutputCard } from './components/CodeOutputCard';
import { StandupCard } from './components/StandupCard';
import { SettingsModal } from './components/SettingsModal';
import { DiffDrawer } from './components/DiffDrawer';
import { McpSyncCard } from './components/McpSyncCard';
import { useVoiceRecorder } from './hooks/useVoiceRecorder';
import { api, GeneratedResponse, WorkspaceStatus } from './services/api';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  const [mode, setMode] = useState<'auto' | 'terminal' | 'code' | 'standup'>('auto');
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<GeneratedResponse | null>(null);
  const [history, setHistory] = useState<GeneratedResponse[]>([]);
  const [workspaceStatus, setWorkspaceStatus] = useState<WorkspaceStatus | null>(null);
  const [diffText, setDiffText] = useState('');
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [wisprWords, setWisprWords] = useState(0);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDiffDrawerOpen, setIsDiffDrawerOpen] = useState(false);

  // Load workspace info and word counts
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

  // Execute dev flow generation
  const handleGenerate = async (textToUse?: string) => {
    const finalPrompt = (textToUse || promptInput).trim();
    if (!finalPrompt) return;

    setIsGenerating(true);
    try {
      const response = await api.generate(finalPrompt, mode, true);
      setCurrentResponse(response);
      setHistory((prev) => [response, ...prev.slice(0, 9)]);

      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#06b6d4', '#10b981'],
      });

      // Refresh git status after generation/execution
      refreshWorkspace();
    } catch (err: any) {
      alert(err.message || 'Generation failed. Check Hugging Face token in Settings.');
      if (!localStorage.getItem('devflow_hf_token')) {
        setIsSettingsOpen(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Voice recorder hook
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
    {
      label: 'Git Rebase & Push Lease',
      text: 'Rebase my branch on origin/main and push with force-with-lease safely',
      mode: 'terminal',
    },
    {
      label: 'Fix CORS Audio Endpoint',
      text: 'Fix the CORS preflight issue and add 25MB multer buffer limit to audio router',
      mode: 'code',
    },
    {
      label: 'Docker Compose Stack',
      text: 'Write a docker-compose for PostgreSQL, Redis, and Node backend with healthchecks',
      mode: 'code',
    },
    {
      label: 'Daily Standup Summary',
      text: 'Summarize today git commits and changed files into clean slack standup notes',
      mode: 'standup',
    },
  ];

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* Top Workspace Bar */}
      <WorkspaceBar
        status={workspaceStatus}
        isBackendConnected={isBackendConnected}
        wisprWords={wisprWords}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDiffDrawer={() => setIsDiffDrawerOpen(true)}
        onRefreshWorkspace={refreshWorkspace}
      />

      {/* Wispr Flow MCP Bridge Integration */}
      <McpSyncCard
        onGenerated={(data) => {
          setCurrentResponse(data);
          setHistory((prev) => [data, ...prev.slice(0, 9)]);
          refreshWorkspace();
        }}
      />

      {/* Main Cockpit Card */}
      <div
        className="glass-panel"
        style={{
          padding: '32px 28px',
          background: 'rgba(11, 14, 22, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        {/* Mode Selector Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '4px',
              borderRadius: '12px',
              backgroundColor: '#07090e',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              gap: '4px',
            }}
          >
            {[
              { id: 'auto', label: 'Auto-Detect', icon: Compass },
              { id: 'terminal', label: 'Terminal & Git', icon: Terminal },
              { id: 'code', label: 'Code & Bugfix', icon: FileCode },
              { id: 'standup', label: 'Standup & PR', icon: CalendarCheck },
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
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isActive ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-faint)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? '0 0 12px rgba(99, 102, 241, 0.3)' : 'none',
                  }}
                >
                  <Icon size={14} color={isActive ? '#818cf8' : 'currentColor'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Push-To-Talk Voice Orb */}
        <PushToTalkOrb
          isRecording={isRecording}
          isTranscribing={isTranscribing}
          liveTranscript={liveTranscript}
          mediaStream={mediaStream}
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
        />

        {/* Prompt Input Box */}
        <div
          style={{
            position: 'relative',
            borderRadius: '12px',
            backgroundColor: '#07090e',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '12px 16px',
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
            placeholder="Or type/refine voice instructions here (e.g. 'rebase on main and force push safely')..."
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '14px',
              fontFamily: 'var(--font-sans)',
            }}
          />

          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating || !promptInput.trim()}
            className="btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              opacity: !promptInput.trim() || isGenerating ? 0.6 : 1,
            }}
          >
            {isGenerating ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
            <span>Synthesize</span>
          </button>
        </div>

        {/* Sample Prompts Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-faint)', fontWeight: 500 }}>
            Try speaking:
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
                fontSize: '12px',
                padding: '5px 10px',
                borderRadius: '6px',
                color: 'var(--text-muted)',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Output Result Area */}
      {isGenerating && (
        <div
          className="glass-panel"
          style={{
            padding: '36px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px',
          }}
        >
          <Loader2 size={28} className="animate-spin" style={{ color: '#818cf8' }} />
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0' }}>
            Hugging Face Inference Running...
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
            Synthesizing workspace context with Qwen 2.5 Coder
          </div>
        </div>
      )}

      {/* Current Active Response */}
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

      {/* History Feed */}
      {history.length > 1 && (
        <div style={{ marginTop: '40px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="#818cf8" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>
                Recent Voice Actions ({history.length})
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {history.slice(1).map((item, idx) => (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(12, 16, 24, 0.65)',
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
                    {item.summary}
                  </div>
                </div>
                <button
                  onClick={() => setCurrentResponse(item)}
                  className="btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={refreshWorkspace}
      />

      {/* Git Diff Drawer */}
      <DiffDrawer
        isOpen={isDiffDrawerOpen}
        onClose={() => setIsDiffDrawerOpen(false)}
        status={workspaceStatus}
        diffText={diffText}
      />
    </div>
  );
};
