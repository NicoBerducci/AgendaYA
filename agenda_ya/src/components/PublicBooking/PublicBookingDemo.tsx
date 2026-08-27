'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AFTERNOON_SLOTS,
  formatMinutesSeconds,
  getRemainingMs,
  getSlots,
  MORNING_SLOTS,
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

// La app pública (Módulo 4) es una interfaz aparte de la del administrador,
// por eso mantiene su propia paleta fija en vez de heredar el tema claro/oscuro
// del panel desktop — así se ve igual que en los wireframes de Figma del TP N°1.
const PHONE = {
  bg: '#FFFFFF',
  frame: '#D8DDDB',
  text: '#1B2426',
  muted: '#5B6B6E',
  line: '#1B2426',
  slotDisabledBg: '#F1F3F2',
  slotDisabledBorder: '#C9D1CF',
  slotDisabledText: '#AEB8B6',
  teal: '#0E6B52',
  tealSoft: '#E6F4EF',
  countdownBg: '#FBDCE2',
  countdownText: '#A83248',
};

function fmtLargo(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  return `${dias[date.getDay()]} ${date.getDate()} de ${meses[date.getMonth()]}`;
}

function StepPill({ label }: { label: string }) {
  return (
    <span
      style={{
        background: PHONE.tealSoft,
        color: PHONE.teal,
        borderRadius: 20,
        padding: '3px 10px',
        fontSize: 10.5,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
}

function SlotButton({
  time,
  state,
  onClick,
}: {
  time: string;
  state: 'disponible' | 'seleccionado' | 'no-disponible';
  onClick: () => void;
}) {
  const disabled = state === 'no-disponible';
  const selected = state === 'seleccionado';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '10px 0',
        borderRadius: 6,
        border: `1px solid ${disabled ? PHONE.slotDisabledBorder : selected ? PHONE.teal : PHONE.line}`,
        background: disabled ? PHONE.slotDisabledBg : selected ? PHONE.teal : PHONE.bg,
        color: disabled ? PHONE.slotDisabledText : selected ? '#FFFFFF' : PHONE.text,
        fontWeight: 600,
        fontSize: 12.5,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: FONT,
      }}
    >
      {time}
    </button>
  );
}

function DevicePanel({
  deviceLabel,
  deviceId,
  date,
}: {
  deviceLabel: string;
  deviceId: string;
  date: string;
}) {
  const [slots, setSlots] = useState<Slot[]>(() => getSlots());
  const [pendingTime, setPendingTime] = useState<string | null>(null);
  const [lockedTime, setLockedTime] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, forceTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSlots(getSlots());
      forceTick((n) => n + 1); // refresca el contador regresivo cada tick
    }, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const statusOf = (time: string): 'disponible' | 'seleccionado' | 'no-disponible' => {
    if (time === pendingTime || time === lockedTime) return 'seleccionado';
    const slot = slots.find((s) => s.time === time);
    return slot && slot.status === 'disponible' ? 'disponible' : 'no-disponible';
  };

  const handlePickLocal = (time: string) => {
    setErrorMsg(null);
    setPendingTime(time);
  };

  const handleContinuar = () => {
    if (!pendingTime) return;
    const result = selectSlot(pendingTime, deviceId);
    setSlots(getSlots());
    if (!result.ok) {
      setErrorMsg(result.message || 'El horario ya no está disponible');
      setPendingTime(null);
      return;
    }
    setLockedTime(pendingTime);
  };

  const remainingMs = lockedTime ? getRemainingMs(lockedTime) : 0;
  const expired = lockedTime !== null && remainingMs <= 0;
  const [endTime, endMinutes] = lockedTime
    ? (() => {
        const [h, m] = lockedTime.split(':').map(Number);
        const total = h * 60 + m + 30;
        return [lockedTime, `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`];
      })()
    : [null, null];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#5B6B6E', fontFamily: FONT }}>
        📱 {deviceLabel} — Usuario invitado
      </div>
      <div
        style={{
          width: 300,
          minHeight: 420,
          background: PHONE.bg,
          border: `1px solid ${PHONE.frame}`,
          borderRadius: 20,
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          padding: '16px 18px',
          fontFamily: FONT,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {!lockedTime && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: PHONE.muted, fontSize: 16 }}>↩</span>
              <StepPill label="3 de 5 — Horarios" />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: PHONE.text }}>Elegí un horario</div>
              <div style={{ fontSize: 11.5, color: PHONE.muted, marginTop: 2 }}>
                {fmtLargo(date)} · Consulta general
              </div>
            </div>

            <div style={{ fontSize: 10.5, fontWeight: 700, color: PHONE.muted, letterSpacing: 0.5 }}>MAÑANA</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {MORNING_SLOTS.map((time) => (
                <SlotButton key={time} time={time} state={statusOf(time)} onClick={() => handlePickLocal(time)} />
              ))}
            </div>

            <div style={{ fontSize: 10.5, fontWeight: 700, color: PHONE.muted, letterSpacing: 0.5 }}>TARDE</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {AFTERNOON_SLOTS.map((time) => (
                <SlotButton key={time} time={time} state={statusOf(time)} onClick={() => handlePickLocal(time)} />
              ))}
            </div>

            {errorMsg && (
              <div style={{ fontSize: 11.5, color: PHONE.countdownText }}>{errorMsg}</div>
            )}

            {pendingTime && !errorMsg && (
              <div
                style={{
                  background: PHONE.tealSoft,
                  color: PHONE.teal,
                  borderRadius: 8,
                  padding: '8px 10px',
                  fontSize: 11.5,
                  fontWeight: 600,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>Turno de {pendingTime} hs preseleccionado</span>
                <span style={{ background: '#fff', borderRadius: 12, padding: '2px 8px', fontSize: 10 }}>
                  Reservando
                </span>
              </div>
            )}

            <button
              onClick={handleContinuar}
              disabled={!pendingTime}
              style={{
                marginTop: 'auto',
                background: pendingTime ? PHONE.teal : '#CBD3D1',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 0',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: pendingTime ? 'pointer' : 'not-allowed',
                fontFamily: FONT,
              }}
            >
              Continuar
            </button>
          </>
        )}

        {lockedTime && !expired && (
          <>
            <div
              style={{
                background: PHONE.countdownBg,
                color: PHONE.countdownText,
                borderRadius: 20,
                padding: '8px 12px',
                fontSize: 11.5,
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              Tiempo restante para completar la reserva: {formatMinutesSeconds(remainingMs)} min
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: PHONE.muted, fontSize: 16 }}>↩</span>
              <StepPill label="4 de 5 — Tus datos" />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: PHONE.text }}>Ingresá tus datos</div>
              <div style={{ fontSize: 11.5, color: PHONE.muted, marginTop: 2 }}>
                Turno {endTime} a {endMinutes} hs · reservado del lado del servidor
              </div>
            </div>
            <div style={{ fontSize: 11, color: PHONE.muted, fontStyle: 'italic', marginTop: 'auto' }}>
              El formulario de datos personales corresponde a US_032/US_033 (fuera del alcance de CP_011).
            </div>
            <div style={{ fontSize: 10.5, color: PHONE.muted, borderTop: `1px solid ${PHONE.frame}`, paddingTop: 8 }}>
              Estado backend {lockedTime}: <strong style={{ color: PHONE.text }}>preseleccionado</strong>
            </div>
          </>
        )}

        {expired && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 34 }}>⏱</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: PHONE.text }}>
              El tiempo para completar tu reserva venció. Por favor elegí un nuevo horario
            </div>
          </div>
        )}
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
          US_028, US_029). Elegí un horario en el Dispositivo A y presioná &quot;Continuar&quot;: va a
          dejar de estar disponible en el Dispositivo B en menos de 2 segundos.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        <DevicePanel deviceLabel="Dispositivo A" deviceId="device-a" date={date} />
        <DevicePanel deviceLabel="Dispositivo B" deviceId="device-b" date={date} />
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
