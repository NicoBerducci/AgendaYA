'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  formatMinutesSeconds,
  getRemainingMs,
  getSlots,
  resetPublicBookingState,
  selectSlot,
  Slot,
} from '../../services/publicBookingService';
import { LIGHT, FONT, ThemeTokens } from '../ui/theme';
import { Boton } from '../ui/Boton';

interface PublicBookingDemoProps {
  targetDateStr?: string;
  theme?: ThemeTokens;
}

// Simula el "polling" con el que un segundo dispositivo se entera de un cambio
// de disponibilidad. El criterio de aceptación exige < 2 segundos.
const POLL_MS = 500;

function DevicePanel({
  deviceLabel,
  deviceId,
  date,
  T,
  onSelected,
}: {
  deviceLabel: string;
  deviceId: string;
  date: string;
  T: ThemeTokens;
  onSelected: (time: string) => void;
}) {
  const [slots, setSlots] = useState<Slot[]>(() => getSlots());
  const [mySelection, setMySelection] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, forceTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSlots(getSlots());
      forceTick((n) => n + 1); // refresca el contador regresivo cada tick
    }, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const handlePick = (time: string) => {
    setErrorMsg(null);
    const result = selectSlot(time, deviceId);
    setSlots(getSlots());
    if (!result.ok) {
      setErrorMsg(result.message || 'El horario ya no está disponible');
      return;
    }
    setMySelection(time);
    onSelected(time);
  };

  const remainingMs = mySelection ? getRemainingMs(mySelection) : 0;
  const expired = mySelection !== null && remainingMs <= 0;

  return (
    <div
      style={{
        flex: 1,
        minWidth: 240,
        border: `1px solid ${T.lineStrong}`,
        borderRadius: 16,
        background: T.surface,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 13.5, color: T.text }}>
        📱 {deviceLabel} — Usuario invitado
      </div>
      <div style={{ fontSize: 11.5, color: T.muted }}>
        {date} · Consulta general
      </div>

      {!mySelection && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          {slots.map((slot) => {
            const disabled = slot.status !== 'disponible';
            return (
              <button
                key={slot.time}
                onClick={() => handlePick(slot.time)}
                disabled={disabled}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1px solid ${disabled ? T.faded : T.lineStrong}`,
                  background: disabled ? T.panel : T.sideActive,
                  color: disabled ? T.faded : '#0B2A20',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  fontFamily: FONT,
                }}
              >
                {slot.time}
              </button>
            );
          })}
        </div>
      )}

      {errorMsg && (
        <div style={{ fontSize: 12.5, color: T.blockedInk }}>{errorMsg}</div>
      )}

      {mySelection && !expired && (
        <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12.5, color: T.text }}>
            Turno <strong>{mySelection}</strong> seleccionado. Avanzando a la pantalla de ingreso de datos personales…
          </div>
          <div
            style={{
              background: T.okBg,
              color: T.ok,
              border: `1px solid ${T.ok}`,
              borderRadius: 8,
              padding: '8px 12px',
              fontWeight: 700,
              fontSize: 15,
              textAlign: 'center',
            }}
          >
            ⏱ Tiempo restante: {formatMinutesSeconds(remainingMs)} minutos
          </div>
        </div>
      )}

      {expired && (
        <div style={{ fontSize: 12.5, color: T.blockedInk }}>
          El tiempo para completar la reserva expiró. El turno vuelve a estar disponible.
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: `1px solid ${T.line}`, fontSize: 11, color: T.muted }}>
        Estado backend {mySelection || '—'}:{' '}
        <strong style={{ color: T.text }}>
          {mySelection
            ? slots.find((s) => s.time === mySelection)?.status ?? 'disponible'
            : '—'}
        </strong>
      </div>
    </div>
  );
}

export const PublicBookingDemo: React.FC<PublicBookingDemoProps> = ({ targetDateStr, theme }) => {
  const T = theme || LIGHT;

  const date = useMemo(() => {
    if (targetDateStr) return targetDateStr;
    const now = new Date();
    now.setDate(now.getDate() + 7);
    return now.toISOString().split('T')[0];
  }, [targetDateStr]);

  useEffect(() => {
    resetPublicBookingState(date);
  }, [date]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: FONT }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: '0 0 4px 0' }}>
          Selección de horario con bloqueo temporal (CP_011)
        </h2>
        <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
          Dos dispositivos móviles simulados comparten el mismo estado de disponibilidad (M04-R02F /
          US_028, US_029). Elegí un horario en el Dispositivo A y observá que deja de estar disponible en
          el Dispositivo B en menos de 2 segundos.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <DevicePanel deviceLabel="Dispositivo A" deviceId="device-a" date={date} T={T} onSelected={() => {}} />
        <DevicePanel deviceLabel="Dispositivo B" deviceId="device-b" date={date} T={T} onSelected={() => {}} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Boton
          tone="ghost"
          T={T}
          small
          onClick={() => {
            resetPublicBookingState(date);
          }}
        >
          Reiniciar demo
        </Boton>
      </div>
    </div>
  );
};
