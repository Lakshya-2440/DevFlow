import React, { useState, useEffect } from 'react';
import { X, Server, Cpu, Check, ShieldCheck, Flame } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [backendUrl, setBackendUrl] = useState('');
  const [model, setModel] = useState('Qwen/Qwen2.5-Coder-32B-Instruct');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBackendUrl(localStorage.getItem('devflow_backend_url') || '');
      setModel(localStorage.getItem('devflow_hf_model') || 'Qwen/Qwen2.5-Coder-32B-Instruct');
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('devflow_backend_url', backendUrl.trim());
    localStorage.setItem('devflow_hf_model', model);
    setIsSaved(true);
    onSaved();
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleResetWords = () => {
    if (confirm('Reset Wispr dictated words count?')) {
      localStorage.setItem('devflow_wispr_words', '0');
      onSaved();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel-glow"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#0c0f17',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
              }}
            >
              <Server size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
                Cockpit Settings
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
                Zero frontend secrets. All AI inference processed securely via backend.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Backend Endpoint (Render) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Server size={14} style={{ color: '#06b6d4' }} />
            Backend Service URL
          </label>
          <input
            type="text"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            placeholder="https://devflow-backend-lonx.onrender.com (empty for default)"
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: '#07090e',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <div style={{ fontSize: '11.5px', color: 'var(--text-faint)' }}>
            Render backend handles Hugging Face Whisper STT, Qwen 2.5 Coder, and Wispr MCP.
          </div>
        </div>

        {/* Model Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={14} style={{ color: '#a855f7' }} />
            Inference Model
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: '#07090e',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontSize: '13px',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <option value="Qwen/Qwen2.5-Coder-32B-Instruct">Qwen/Qwen2.5-Coder-32B-Instruct (Recommended)</option>
            <option value="meta-llama/Llama-3.3-70B-Instruct">meta-llama/Llama-3.3-70B-Instruct</option>
            <option value="mistralai/Mixtral-8x7B-Instruct-v0.1">mistralai/Mixtral-8x7B-Instruct-v0.1</option>
          </select>
        </div>

        {/* Wispr Challenge Stats Card */}
        <div
          style={{
            padding: '14px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Flame size={20} color="#f97316" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fef3c7' }}>
                Wispr Flow Challenge Leaderboard
              </div>
              <div style={{ fontSize: '11.5px', color: '#fde68a' }}>
                {parseInt(localStorage.getItem('devflow_wispr_words') || '0', 10).toLocaleString()} words dictated so far
              </div>
            </div>
          </div>
          <button
            onClick={handleResetWords}
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '4px 8px' }}
          >
            Reset
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px 16px' }}>
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary" style={{ padding: '8px 20px' }}>
            {isSaved ? <Check size={16} /> : <ShieldCheck size={16} />}
            {isSaved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};
