'use client';

import React, { useState } from 'react';
import { LIGHT, FONT, ThemeTokens } from '../ui/theme';

type DeviceType = 'desktop' | 'mobile';

interface DesktopAccessGuardProps {
  theme?: ThemeTokens;
}

const BLOCK_MESSAGE =
  'Este enlace está disponible únicamente desde dispositivos móviles. Por favor abrilo desde tu celular para poder realizar tu reserva';

// Réplica del diálogo nativo del wireframe M04-R05F (misma paleta que AlertModal:
// cabecera menta + ícono de error grande), pero embebida en el recuadro de la
// demo en lugar de un overlay fijo de pantalla completa, para no taparle al
// usuario el resto de la app admin mientras navega esta pestaña.
function BlockDialog() {
  return (
    <div
      style={{
        width: '100%',
        background: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ background: '#7DD3B1', padding: '6px 12px' }}>
        <span style={{ color: '#B91C1C', fontWeight: 'bold' }}>ⓧ</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '30px 24px', gap: 20 }}>
        <svg
          viewBox="0 0 24 24"
          width="56"
          height="56"
          stroke="#B91C1C"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <div style={{ fontSize: 16, fontWeight: 500, color: '#333', textAlign: 'center', flex: 1, lineHeight: 1.4 }}>
          {BLOCK_MESSAGE}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 24px 20px' }}>
        <span
          style={{
            border: '1px solid #ccc',
            borderRadius: 6,
            padding: '6px 24px',
            fontWeight: 600,
            color: '#999',
          }}
        >
          OK
        </span>
      </div>
      <div style={{ fontSize: 11, color: '#999', textAlign: 'center', paddingBottom: 12 }}>
        No hay forma de continuar el flujo desde esta pantalla.
      </div>
    </div>
  );
}

// El requisito (M04-R05F / US_027) exige que la detección se base ÚNICAMENTE en la
// cabecera HTTP User-Agent. En esta demo, como no hay un backend real que la
// intercepte, la simulamos con un selector explícito que hace las veces de esa
// cabecera. El checkbox de "ventana angosta" está para demostrar el punto 4 del
// CP_012: el ancho de pantalla NO debe influir en el bloqueo. La pantalla de
// bloqueo (BlockDialog) no tiene botón funcional para cerrarla: no existe forma
// de evadirla desde un entorno Desktop.
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
          minHeight: 220,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          alignItems: isBlocked ? 'center' : 'stretch',
          justifyContent: isBlocked ? 'center' : 'flex-start',
        }}
      >
        {isBlocked && <BlockDialog />}

        {!isBlocked && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};
