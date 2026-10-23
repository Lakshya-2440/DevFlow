import React, { useState } from 'react';
import { CalendarCheck, Copy, Check, MessageSquare } from 'lucide-react';
import { StandupNotes } from '../services/api';
import confetti from 'canvas-confetti';

interface StandupCardProps {
  notes: StandupNotes;
  title: string;
  summary: string;
}

export const StandupCard: React.FC<StandupCardProps> = ({ notes, title, summary }) => {
  const [copied, setCopied] = useState(false);

  const formatSlack = () => {
    let out = `*${title}*\n`;
    if (notes.done?.length) {
      out += `\n*Completed:*\n` + notes.done.map((d) => `• ${d}`).join('\n');
    }
    if (notes.next?.length) {
      out += `\n\n*Next / In Progress:*\n` + notes.next.map((n) => `• ${n}`).join('\n');
    }
    if (notes.blockers?.length) {
      out += `\n\n*Blockers:*\n` + notes.blockers.map((b) => `• ${b}`).join('\n');
    }
    return out;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formatSlack());
    setCopied(true);
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#10b981', '#6366f1'],
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
        border: '1px solid rgba(16, 185, 129, 0.25)',
      }}
    >
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
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
              }}
            >
              <CalendarCheck size={16} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>{title}</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{summary}</p>
        </div>

        <button onClick={handleCopy} className="btn-primary" style={{ padding: '7px 14px', fontSize: '12px' }}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy for Slack'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {notes.done && notes.done.length > 0 && (
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: '#0a0d14',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <h4 style={{ fontSize: '13px', color: '#34d399', fontWeight: 600, marginBottom: '10px' }}>
              ✓ Completed
            </h4>
            <ul style={{ paddingLeft: '18px', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
              {notes.done.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {notes.next && notes.next.length > 0 && (
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: '#0a0d14',
              border: '1px solid rgba(99, 102, 241, 0.2)',
            }}
          >
            <h4 style={{ fontSize: '13px', color: '#818cf8', fontWeight: 600, marginBottom: '10px' }}>
              ⚡ In Progress / Next
            </h4>
            <ul style={{ paddingLeft: '18px', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
              {notes.next.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {notes.blockers && notes.blockers.length > 0 && (
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: '#0a0d14',
              border: '1px solid rgba(245, 158, 11, 0.2)',
            }}
          >
            <h4 style={{ fontSize: '13px', color: '#fbbf24', fontWeight: 600, marginBottom: '10px' }}>
              ⚠️ Blockers
            </h4>
            <ul style={{ paddingLeft: '18px', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
              {notes.blockers.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
