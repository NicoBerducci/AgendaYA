'use client';

import React, { useState } from 'react';
import { LIGHT, FONT, ThemeTokens } from '../ui/theme';
import { PublicBookingDemo } from './PublicBookingDemo';
import { DesktopAccessGuard } from './DesktopAccessGuard';

interface PublicBookingSectionProps {
  targetDateStr?: string;
  theme?: ThemeTokens;
}

// Agrupa los dos casos de prueba de Gracia Ignacio (Módulo 4 - Reserva Pública)
// en una misma pestaña del panel de administración, ya que ambos pertenecen a la
// interfaz mobile del Usuario Invitado y no a la de configuración del Administrador.
export const PublicBookingSection: React.FC<PublicBookingSectionProps> = ({ targetDateStr, theme }) => {
  const T = theme || LIGHT;
  const [subTab, setSubTab] = useState<'CP_011' | 'CP_012'>('CP_011');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: FONT }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {(
          [
            { id: 'CP_011', label: 'CP_011 · Bloqueo temporal' },
            { id: 'CP_012', label: 'CP_012 · Acceso desde Desktop' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            style={{
              background: subTab === tab.id ? T.sideActive : 'transparent',
              color: subTab === tab.id ? '#0B2A20' : T.muted,
              border: `1px solid ${subTab === tab.id ? T.mark : T.lineStrong}`,
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: FONT,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === 'CP_011' ? (
        <PublicBookingDemo targetDateStr={targetDateStr} theme={T} />
      ) : (
        <DesktopAccessGuard theme={T} />
      )}
    </div>
  );
};
