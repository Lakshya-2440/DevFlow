import React from 'react';
import { X, GitCommit, FileText, CheckCircle2 } from 'lucide-react';
import { WorkspaceStatus } from '../services/api';

interface DiffDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  status: WorkspaceStatus | null;
  diffText: string;
}

export const DiffDrawer: React.FC<DiffDrawerProps> = ({ isOpen, onClose, status, diffText }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          height: '100vh',
          background: '#090c13',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflowY: 'auto',
          borderRadius: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GitCommit size={20} color="#818cf8" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
              Workspace Git Diff
            </h3>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Dirty files list */}
        {status?.dirtyFiles && status.dirtyFiles.length > 0 && (
          <div
            style={{
              padding: '14px',
              borderRadius: '8px',
              background: '#0e121c',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#94a3b8',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Modified Files ({status.dirtyFiles.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {status.dirtyFiles.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12.5px',
                    fontFamily: 'var(--font-mono)',
                    color: '#e2e8f0',
                  }}
                >
                  <FileText size={14} color="#38bdf8" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diff content viewer */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Unified Diff Output
          </div>
          <pre
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: '#040608',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              lineHeight: '1.6',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              margin: 0,
            }}
          >
            {diffText || 'No uncommitted changes detected in workspace.'}
          </pre>
        </div>
      </div>
    </div>
  );
};
