import React from 'react';
import { ThemeTokens } from './theme';
import { Boton } from './Boton';

export interface ModalProps {
  open: boolean;
  titulo?: string;
  cuerpo?: React.ReactNode;
  onSi: () => void;
  onNo: () => void;
  T: ThemeTokens;
  textoSi?: string;
  textoNo?: string;
}

export function Modal({ open, titulo, cuerpo, onSi, onNo, T, textoSi = "SI", textoNo = "NO" }: ModalProps) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "absolute", inset: 0, background: "rgba(10,16,18,.45)",
        display: "grid", placeItems: "center", zIndex: 60, padding: 16,
      }}
    >
      <div style={{ background: T.surface, borderRadius: 10, padding: "22px 24px", width: "min(420px,100%)", boxShadow: "0 18px 50px rgba(0,0,0,.28)" }}>
        <div style={{ fontSize: 16.5, fontWeight: 700, color: T.text, lineHeight: 1.35 }}>{titulo}</div>
        {cuerpo && <div style={{ marginTop: 10, fontSize: 13.5, color: T.muted, lineHeight: 1.5 }}>{cuerpo}</div>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
          <Boton tone="ghost" T={T} onClick={onNo}>{textoNo}</Boton>
          <Boton tone="neutral" T={T} onClick={onSi}>{textoSi}</Boton>
        </div>
      </div>
    </div>
  );
}
