import React, { useState } from 'react';
import { FileCode, Copy, Check, Sparkles } from 'lucide-react';
import { CodeBlock } from '../services/api';
import confetti from 'canvas-confetti';

interface CodeOutputCardProps {
  code: CodeBlock;
  title: string;
  summary: string;
}

export const CodeOutputCard: React.FC<CodeOutputCardProps> = ({ code, title, summary }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.diffOrSnippet);
    setCopied(true);
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#6366f1', '#a855f7', '#06b6d4'],
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
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
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#22d3ee',
              }}
            >
              <FileCode size={16} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>{title}</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            {summary}
          </p>
        </div>

        <button onClick={handleCopy} className="btn-primary" style={{ padding: '7px 14px', fontSize: '12px' }}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied to Clipboard' : 'Copy Code'}
        </button>
      </div>

      {/* Code Viewer Container */}
      <div
        style={{
          background: '#07090e',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Top File bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '12px',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
            {code.filename || 'suggested_change'}
          </span>
          <span
            style={{
              textTransform: 'uppercase',
              color: 'var(--text-faint)',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            {code.language}
          </span>
        </div>

        {/* Code body */}
        <pre
          style={{
            padding: '16px',
            fontSize: '13px',
            lineHeight: '1.6',
            color: '#e2e8f0',
            overflowX: 'auto',
            fontFamily: 'var(--font-mono)',
            margin: 0,
          }}
        >
          <code>{code.diffOrSnippet}</code>
        </pre>
      </div>

      {/* Explanation pill */}
      {code.explanation && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            fontSize: '12.5px',
            color: '#c7d2fe',
            lineHeight: '1.5',
          }}
        >
          <Sparkles size={16} style={{ color: '#818cf8', flexShrink: 0, marginTop: '2px' }} />
          <span>{code.explanation}</span>
        </div>
      )}
    </div>
  );
};
