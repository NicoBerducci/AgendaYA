'use client';

import React, { useState } from 'react';
import { LIGHT, FONT, ThemeTokens } from '../ui/theme';
import { PublicBookingDemo } from './PublicBookingDemo';
import { DesktopAccessGuard } from './DesktopAccessGuard';

interface PublicBookingSectionProps {
  targetDateStr?: string;
  theme?: ThemeTokens;
  initialSubTab?: 'CP_011' | 'CP_012' | 'CP_013_014';
}

// Agrupa los casos de prueba del Módulo 4 (Reserva Pública - Mobile)
// CP_011 / CP_012 (Gracia Ignacio) y CP_013 / CP_014 (Tomás Yanardi)
export const PublicBookingSection: React.FC<PublicBookingSectionProps> = ({
  targetDateStr,
  theme,
  initialSubTab = 'CP_013_014',
}) => {
  const T = theme || LIGHT;
  const [subTab, setSubTab] = useState<'CP_011' | 'CP_012' | 'CP_013_014'>(initialSubTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: FONT }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {(
          [
            { id: 'CP_013_014', label: 'CP_013_014 · Confirmación y Vencimiento (Tomás Yanardi)' },
            { id: 'CP_011', label: 'CP_011 · Bloqueo temporal (Ignacio Gracia)' },
            { id: 'CP_012', label: 'CP_012 · Acceso Desktop (Ignacio Gracia)' },
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

      {subTab === 'CP_012' ? (
        <DesktopAccessGuard theme={T} />
      ) : (
        <PublicBookingDemo targetDateStr={targetDateStr} theme={T} />
      )}
    </div>
  );
};
