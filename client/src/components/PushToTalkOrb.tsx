import React from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';

interface PushToTalkOrbProps {
  isRecording: boolean;
  isTranscribing: boolean;
  liveTranscript: string;
  mediaStream: MediaStream | null;
  onMouseDown: () => void;
  onMouseUp: () => void;
}

export const PushToTalkOrb: React.FC<PushToTalkOrbProps> = ({
  isRecording,
  isTranscribing,
  liveTranscript,
  mediaStream,
  onMouseDown,
  onMouseUp,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '24px 16px',
        position: 'relative',
      }}
    >
      {/* Audio Waveform Container */}
      <div style={{ height: '52px', display: 'flex', alignItems: 'center' }}>
        {isRecording ? (
          <AudioVisualizer isRecording={isRecording} stream={mediaStream} />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-faint)',
              fontSize: '13px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span>[SPACE]</span>
            <span>Hold to dictate into workspace</span>
          </div>
        )}
      </div>

      {/* Main Orb */}
      <div style={{ position: 'relative' }}>
        {/* Glowing pulse rings when recording */}
        {isRecording && (
          <>
            <div
              style={{
                position: 'absolute',
                inset: '-14px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
                animation: 'pulse-ring 1.6s ease-out infinite',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: '-28px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%)',
                animation: 'pulse-ring 2.4s ease-out infinite 0.4s',
              }}
            />
          </>
        )}

        <button
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onTouchStart={onMouseDown}
          onTouchEnd={onMouseUp}
          disabled={isTranscribing}
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            border: isRecording ? '2px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.15)',
            background: isRecording
              ? 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)'
              : 'linear-gradient(135deg, #181d28 0%, #0d1017 100%)',
            boxShadow: isRecording
              ? '0 0 40px rgba(99, 102, 241, 0.8), inset 0 0 15px rgba(255, 255, 255, 0.4)'
              : '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
            cursor: isTranscribing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isRecording ? 'scale(1.06)' : 'scale(1)',
            userSelect: 'none',
          }}
          title="Click and hold or use Spacebar"
        >
          {isTranscribing ? (
            <Loader2 size={32} className="animate-spin" style={{ color: '#818cf8' }} />
          ) : (
            <Mic
              size={32}
              style={{
                color: isRecording ? '#ffffff' : '#94a3b8',
                filter: isRecording ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' : 'none',
              }}
            />
          )}
        </button>
      </div>

      {/* Live Transcript Bubble */}
      {isRecording && liveTranscript && (
        <div
          className="glass-panel"
          style={{
            maxWidth: '540px',
            padding: '10px 18px',
            background: 'rgba(15, 23, 42, 0.85)',
            borderColor: 'rgba(99, 102, 241, 0.4)',
            color: '#e2e8f0',
            fontSize: '14px',
            lineHeight: '1.5',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          }}
        >
          <span style={{ color: 'var(--cyan)', marginRight: '6px', fontWeight: 600 }}>Listening:</span>
          "{liveTranscript}"
        </div>
      )}

      {/* Status indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          color: isRecording ? '#34d399' : isTranscribing ? '#818cf8' : 'var(--text-faint)',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: isRecording ? '#34d399' : isTranscribing ? '#818cf8' : '#475569',
            boxShadow: isRecording ? '0 0 10px #34d399' : 'none',
          }}
        />
        {isRecording
          ? 'Live Audio Recording'
          : isTranscribing
          ? 'Transcribing via Whisper Large v3...'
          : 'Ready for Voice Flow'}
      </div>
    </div>
  );
};
