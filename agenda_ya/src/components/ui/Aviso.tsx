import React from 'react';
import { ThemeTokens } from './theme';

export interface AvisoProps {
  tipo?: 'ok' | 'err';
  texto?: string;
  ms?: number;
  onClose?: () => void;
  T: ThemeTokens;
}

export function Aviso({ tipo, texto, ms, onClose, T }: AvisoProps) {
  if (!texto) return null;
  const exito = tipo === "ok";
  return (
    <div
      role="status"
      style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        background: exito ? T.okBg : T.errBg,
        border: `1px solid ${exito ? T.ok : T.danger}`,
        color: exito ? T.ok : T.danger,
        borderRadius: 8, padding: "10px 12px", fontSize: 13.5, marginBottom: 14, lineHeight: 1.45,
      }}
    >
      <span style={{ fontWeight: 800 }}>{exito ? "✓" : "!"}</span>
      <span style={{ flex: 1 }}>
        {texto}
        {ms != null && <span style={{ opacity: 0.75, fontSize: 12 }}> · respuesta en {ms} ms</span>}
      </span>
      {onClose && (
        <button aria-label="Cerrar" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 15, lineHeight: 1 }}>×</button>
      )}
    </div>
  );
}
