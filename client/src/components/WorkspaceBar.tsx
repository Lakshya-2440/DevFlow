import React from 'react';
import { GitBranch, GitCommit, Settings, Layers, Flame, RefreshCw } from 'lucide-react';
import { WorkspaceStatus } from '../services/api';

interface WorkspaceBarProps {
  status: WorkspaceStatus | null;
  isBackendConnected: boolean;
  wisprWords: number;
  onOpenSettings: () => void;
  onOpenDiffDrawer: () => void;
  onRefreshWorkspace: () => void;
}

export const WorkspaceBar: React.FC<WorkspaceBarProps> = ({
  status,
  isBackendConnected,
  wisprWords,
  onOpenSettings,
  onOpenDiffDrawer,
  onRefreshWorkspace,
}) => {
  return (
    <header
      className="glass-panel"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 24px',
        marginBottom: '28px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(10, 13, 20, 0.75)',
      }}
    >
      {/* Brand & Bridge Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Layers size={18} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em', color: '#f8fafc' }}>
                DevFlow
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  fontWeight: 600,
                }}
              >
                PRO
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
              Voice Cockpit • Wispr Challenge
            </div>
          </div>
        </div>

        {/* Connection status pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '20px',
            background: isBackendConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)',
            border: `1px solid ${isBackendConnected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(148, 163, 184, 0.2)'}`,
            fontSize: '11px',
            fontWeight: 500,
            color: isBackendConnected ? '#34d399' : '#94a3b8',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isBackendConnected ? '#34d399' : '#94a3b8',
              boxShadow: isBackendConnected ? '0 0 8px #34d399' : 'none',
            }}
          />
          {isBackendConnected ? 'Local Bridge Active' : 'Cloud Fallback Mode'}
        </div>
      </div>

      {/* Center: Active Git & Workspace state */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {status?.isGitRepo ? (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: '#e2e8f0',
              }}
            >
              <GitBranch size={13} style={{ color: '#818cf8' }} />
              <span>{status.branch}</span>
            </div>

            <button
              onClick={onOpenDiffDrawer}
              className="btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                borderColor: status.dirtyFiles.length > 0 ? 'rgba(245, 158, 11, 0.3)' : undefined,
                color: status.dirtyFiles.length > 0 ? '#fbbf24' : '#94a3b8',
              }}
              title="Inspect git diff"
            >
              <GitCommit size={13} />
              <span>{status.dirtyFiles.length} dirty files</span>
            </button>

            <button
              onClick={onRefreshWorkspace}
              className="btn-secondary"
              style={{ padding: '6px 8px' }}
              title="Refresh workspace status"
            >
              <RefreshCw size={13} />
            </button>
          </>
        ) : (
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-faint)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Standalone Dev Cockpit
          </div>
        )}
      </div>

      {/* Right: Wispr Leaderboard Words Counter + Settings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Wispr word count badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            fontSize: '12px',
            fontWeight: 600,
            color: '#fbbf24',
          }}
          title="Track words dictated for the Wispr Flow Usage Leaderboard"
        >
          <Flame size={14} style={{ color: '#f97316' }} />
          <span>{wisprWords.toLocaleString()} words</span>
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="btn-secondary"
          style={{ padding: '7px 12px', fontSize: '13px' }}
        >
          <Settings size={15} />
          <span>Settings</span>
        </button>
      </div>
    </header>
  );
};
