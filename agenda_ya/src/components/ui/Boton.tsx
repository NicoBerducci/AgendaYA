import React from 'react';
import { ThemeTokens, FONT } from './theme';

export interface BotonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'neutral' | 'danger' | 'ghost' | 'mint';
  T: ThemeTokens;
  small?: boolean;
}

export function Boton({ children, onClick, tone = "neutral", T, disabled, small, ...rest }: BotonProps) {
  const map = {
    neutral: { bg: T.save, fg: "#fff", bd: T.save },
    danger: { bg: T.danger, fg: "#fff", bd: T.danger },
    ghost: { bg: "transparent", fg: T.text, bd: T.lineStrong },
    mint: { bg: T.sideActive, fg: "#0B2A20", bd: T.mark },
  }[tone];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: map.bg, color: map.fg, border: `1px solid ${map.bd}`,
        borderRadius: 6, padding: small ? "5px 12px" : "9px 26px",
        fontSize: small ? 12.5 : 15, fontWeight: 600, fontFamily: FONT,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
