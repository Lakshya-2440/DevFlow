import React, { useState } from 'react';
import { Network, Sparkles, ArrowRight, CheckCircle2, Loader2, BookOpen, Mic } from 'lucide-react';
import { api, GeneratedResponse } from '../services/api';

interface McpSyncCardProps {
  onGenerated: (data: GeneratedResponse) => void;
}

export const McpSyncCard: React.FC<McpSyncCardProps> = ({ onGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(0);

  const presets = [
    {
      title: 'Voice Standup Action Items',
      note: 'Meeting with frontend lead: Need to create a feature branch feature/wispr-mcp, install @modelcontextprotocol/sdk, and add MCP connector healthcheck route in backend.',
    },
    {
      title: 'Architecture Scratchpad Memo',
      note: 'Spoken memo in Wispr Flow: Migrate git service to support force-with-lease on git push and clean untracked files with git clean -fd.',
    },
    {
      title: 'DevOps Incident Triage',
      note: 'Triage call transcript: Update render.yaml with HF_TOKEN environment variable and add 30000ms timeout to child process executor.',
    },
  ];

  const handleSync = async () => {
    setLoading(true);
    try {
      const activeNote = presets[selectedPreset].note;
      const result = await api.syncMcpToCode(activeNote, 'get_meeting_notes');
      onGenerated(result);
    } catch (err: any) {
      alert(err.message || 'MCP Sync failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
            }}
          >
            <Network size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
                Wispr Flow MCP Connector
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: '#34d399',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckCircle2 size={11} /> api.wisprflow.ai/connect/mcp
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
              Sync spoken meeting notes, transcripts, and voice scratchpad directly into workspace actions
            </p>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={loading}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          <span>{loading ? 'Synthesizing with HF...' : 'Turn Spoken Note Into Code'}</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Preset selector pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedPreset(idx)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border:
                selectedPreset === idx
                  ? '1px solid #818cf8'
                  : '1px solid rgba(255, 255, 255, 0.08)',
              background:
                selectedPreset === idx ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.03)',
              color: selectedPreset === idx ? '#fff' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Mic size={12} color={selectedPreset === idx ? '#818cf8' : '#64748b'} />
            {p.title}
          </button>
        ))}
      </div>

      {/* Active Note Preview */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
          fontSize: '13px',
          color: '#cbd5e1',
          lineHeight: '1.5',
          fontStyle: 'italic',
        }}
      >
        "{presets[selectedPreset].note}"
      </div>
    </div>
  );
};
