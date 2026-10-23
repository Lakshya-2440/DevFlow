import React, { useState } from 'react';
import { Terminal, Copy, Check, Play, AlertTriangle, ShieldCheck, AlertOctagon, Loader2 } from 'lucide-react';
import { CommandItem, ExecutionResult, api } from '../services/api';
import confetti from 'canvas-confetti';

interface TerminalOutputCardProps {
  commands: CommandItem[];
  title: string;
  summary: string;
  isBackendConnected: boolean;
  onExecutionComplete?: (res: ExecutionResult, command: string) => void;
}

export const TerminalOutputCard: React.FC<TerminalOutputCardProps> = ({
  commands,
  title,
  summary,
  isBackendConnected,
  onExecutionComplete,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [executingIndex, setExecutingIndex] = useState<number | null>(null);
  const [executionResults, setExecutionResults] = useState<{ [key: number]: ExecutionResult }>({});

  const handleCopy = (command: string, index: number) => {
    navigator.clipboard.writeText(command);
    setCopiedIndex(index);
    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.8 },
      colors: ['#6366f1', '#06b6d4', '#10b981'],
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    const all = commands.map((c) => c.command).join(' && ');
    navigator.clipboard.writeText(all);
    setCopiedIndex(999);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExecute = async (command: string, index: number) => {
    setExecutingIndex(index);
    try {
      const res = await api.executeCommand(command);
      setExecutionResults((prev) => ({ ...prev, [index]: res }));
      if (onExecutionComplete) onExecutionComplete(res, command);
    } catch (err: any) {
      setExecutionResults((prev) => ({
        ...prev,
        [index]: { stdout: '', stderr: err.message, exitCode: 1 },
      }));
    } finally {
      setExecutingIndex(null);
    }
  };

  const getSafetyBadge = (safety: string) => {
    switch (safety) {
      case 'safe':
        return (
          <span
            className="badge-safe"
            style={{
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={12} /> SAFE
          </span>
        );
      case 'warning':
        return (
          <span
            className="badge-warning"
            style={{
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600,
            }}
          >
            <AlertTriangle size={12} /> MODIFIES WORKSPACE
          </span>
        );
      case 'destructive':
        return (
          <span
            className="badge-destructive"
            style={{
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600,
            }}
          >
            <AlertOctagon size={12} /> DESTRUCTIVE
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        background: 'rgba(12, 16, 24, 0.85)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
              }}
            >
              <Terminal size={16} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>{title}</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            {summary}
          </p>
        </div>

        {commands.length > 1 && (
          <button
            onClick={handleCopyAll}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            {copiedIndex === 999 ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            Copy Chain
          </button>
        )}
      </div>

      {/* Command Blocks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {commands.map((cmd, idx) => (
          <div
            key={idx}
            style={{
              background: '#090c12',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              overflow: 'hidden',
            }}
          >
            {/* Command bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
                <span style={{ color: '#6366f1', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>$</span>
                <code
                  style={{
                    color: '#e2e8f0',
                    fontSize: '13.5px',
                    wordBreak: 'break-all',
                    fontWeight: 500,
                  }}
                >
                  {cmd.command}
                </code>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getSafetyBadge(cmd.safety)}

                <button
                  onClick={() => handleCopy(cmd.command, idx)}
                  className="btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                  title="Copy command"
                >
                  {copiedIndex === idx ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                </button>

                {isBackendConnected && (
                  <button
                    onClick={() => handleExecute(cmd.command, idx)}
                    disabled={executingIndex === idx}
                    className="btn-primary"
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      background:
                        cmd.safety === 'destructive'
                          ? 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)'
                          : undefined,
                    }}
                    title="Run in local terminal"
                  >
                    {executingIndex === idx ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Play size={13} fill="currentColor" />
                    )}
                    Run
                  </button>
                )}
              </div>
            </div>

            {/* Explanation */}
            <div
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                color: 'var(--text-faint)',
                background: 'rgba(0,0,0,0.2)',
                borderBottom: executionResults[idx] ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            >
              {cmd.explanation}
            </div>

            {/* Execution Output (if executed) */}
            {executionResults[idx] && (
              <div
                style={{
                  padding: '12px 16px',
                  background: '#040608',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  maxHeight: '180px',
                  overflowY: 'auto',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: executionResults[idx].exitCode === 0 ? '#10b981' : '#ef4444',
                    }}
                  />
                  <span style={{ color: executionResults[idx].exitCode === 0 ? '#34d399' : '#f87171' }}>
                    Process exited with code {executionResults[idx].exitCode}
                  </span>
                </div>
                {executionResults[idx].stdout && (
                  <pre style={{ color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>
                    {executionResults[idx].stdout}
                  </pre>
                )}
                {executionResults[idx].stderr && (
                  <pre style={{ color: '#f87171', whiteSpace: 'pre-wrap' }}>
                    {executionResults[idx].stderr}
                  </pre>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
