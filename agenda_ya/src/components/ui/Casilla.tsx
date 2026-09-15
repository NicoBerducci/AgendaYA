import React from 'react';
import { ThemeTokens } from './theme';

export interface CasillaProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  marcada: boolean;
  T: ThemeTokens;
}

export function Casilla({ marcada, onClick, disabled, T, title, ...rest }: CasillaProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-pressed={marcada}
      style={{
        width: 24, height: 24, borderRadius: 3, cursor: disabled ? "not-allowed" : "pointer",
        border: `2px solid ${disabled ? T.faded : T.mark}`,
        background: marcada ? T.surface : disabled ? "transparent" : T.mark,
        color: T.mark, display: "grid", placeItems: "center",
        fontSize: 15, fontWeight: 800, lineHeight: 1, padding: 0,
        opacity: disabled ? 0.35 : 1, transition: "background .12s ease",
      }}
      {...rest}
    >
      {marcada ? "✓" : ""}
    </button>
  );
}
