import React from 'react';
import { ThemeTokens } from './theme';

interface AlertModalProps {
  open: boolean;
  tipo: 'ok' | 'err' | 'warn';
  texto: string;
  onClose?: () => void;
  botones?: React.ReactNode;
  T: ThemeTokens;
}

export const AlertModal: React.FC<AlertModalProps> = ({ open, tipo, texto, onClose, botones, T }) => {
  if (!open) return null;

  const getIcon = () => {
    switch (tipo) {
      case 'err':
        return (
          <svg viewBox="0 0 24 24" width="64" height="64" stroke="#B91C1C" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      case 'warn':
        return (
          <svg viewBox="0 0 24 24" width="64" height="64" stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      case 'ok':
      default:
        return (
          <svg viewBox="0 0 24 24" width="64" height="64" stroke="#0369A1" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
    }
  };

  const getSmallIcon = () => {
    switch (tipo) {
      case 'err': return <span style={{ color: '#B91C1C', fontWeight: 'bold' }}>ⓧ</span>;
      case 'warn': return <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>⚠</span>;
      case 'ok':
      default: return <span style={{ color: '#0369A1', fontWeight: 'bold' }}>ⓘ</span>;
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)'
    }}>
      <div style={{
        background: '#fff', width: 450, borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: '#7DD3B1', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>{getSmallIcon()}</div>
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>×</button>
          )}
        </div>
        
        {/* Body */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '30px 24px', gap: 20 }}>
          <div style={{ flexShrink: 0 }}>
            {getIcon()}
          </div>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#333', textAlign: 'center', flex: 1, lineHeight: 1.4 }}>
            {texto}
          </div>
        </div>

        {/* Footer / Botones */}
        {botones && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, padding: '0 24px 24px' }}>
            {botones}
          </div>
        )}
      </div>
    </div>
  );
};
