'use client';

import React, { useState } from 'react';
import { LIGHT, FONT, ThemeTokens } from '../ui/theme';

type DeviceType = 'desktop' | 'mobile';

interface DesktopAccessGuardProps {
  theme?: ThemeTokens;
}

// El requisito (M04-R05F / US_027) exige que la detección se base ÚNICAMENTE en la
// cabecera HTTP User-Agent. En esta demo, como no hay un backend real que la
// intercepte, la simulamos con un selector explícito que hace las veces de esa
// cabecera. El checkbox de "ventana angosta" está para demostrar el punto 4 del
// CP_012: el ancho de pantalla NO debe influir en el bloqueo.
export const DesktopAccessGuard: React.FC<DesktopAccessGuardProps> = ({ theme }) => {
  const T = theme || LIGHT;
  const [userAgent, setUserAgent] = useState<DeviceType>('desktop');
  const [narrowWindow, setNarrowWindow] = useState(false);
  const [eventType, setEventType] = useState('');

  const isBlocked = userAgent === 'desktop';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: FONT }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: '0 0 4px 0' }}>
          Restricción de acceso desde Desktop (CP_012)
        </h2>
        <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
          M04-R05F / US_027. El selector de abajo simula la cabecera User-Agent que en producción
          envía el navegador; el criterio de bloqueo depende exclusivamente de ese valor, nunca del
          ancho de la ventana.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, background: T.panel, padding: 4, borderRadius: 8, border: `1px solid ${T.lineStrong}` }}>
          {(['desktop', 'mobile'] as DeviceType[]).map((opt) => (
            <button
              key={opt}
              onClick={() => setUserAgent(opt)}
              style={{
                background: userAgent === opt ? T.sideActive : 'transparent',
                border: userAgent === opt ? `1px solid ${T.mark}` : '1px solid transparent',
                color: userAgent === opt ? '#0B2A20' : T.muted,
                borderRadius: 6,
                padding: '7px 16px',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: FONT,
              }}
            >
              {opt === 'desktop' ? '🖥️ User-Agent: Desktop' : '📱 User-Agent: Mobile'}
            </button>
          ))}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: T.text }}>
          <input
            type="checkbox"
            checked={narrowWindow}
            onChange={(e) => setNarrowWindow(e.target.checked)}
          />
          Achicar ventana (simular resolución de celular)
        </label>
      </div>

      <div
        style={{
          width: narrowWindow ? 380 : '100%',
          maxWidth: '100%',
          transition: 'width .2s ease',
          border: `1px solid ${T.lineStrong}`,
          borderRadius: 16,
          background: T.surface,
          overflow: 'hidden',
        }}
      >
        {isBlocked ? (
          <div
            role="alert"
            style={{
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 40 }}>🚫</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>
              Para realizar una reserva, ingrese desde un dispositivo móvil
            </div>
            <div style={{ fontSize: 11.5, color: T.muted }}>
              No se generó sesión temporal ni bloqueo de turno. El selector de tipo de evento no es
              alcanzable desde esta pantalla.
            </div>
          </div>
        ) : (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Seleccioná el tipo de evento</div>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              style={{
                padding: '8px 10px',
                borderRadius: 8,
                border: `1px solid ${T.lineStrong}`,
                background: T.panel,
                color: T.text,
                fontFamily: FONT,
              }}
            >
              <option value="">Seleccione el tipo de evento</option>
              <option value="consulta">Consulta general · 30 min</option>
              <option value="seguimiento">Reunión de seguimiento · 1h</option>
            </select>
            <div style={{ fontSize: 11.5, color: T.muted }}>
              Acceso permitido: el flujo público continúa con normalidad en dispositivos móviles.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
