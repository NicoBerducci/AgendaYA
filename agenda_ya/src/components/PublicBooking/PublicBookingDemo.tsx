'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AFTERNOON_SLOTS,
  BookingData,
  calculateEndTime,
  confirmBooking,
  expireLock,
  formatMinutesSeconds,
  getRemainingMs,
  getReservations,
  getSlots,
  MORNING_SLOTS,
  resetPublicBookingState,
  selectSlot,
  Slot,
} from '../../services/publicBookingService';
import {
  validarEmail,
  validarNombre,
  validarTelefono,
} from '../../utils/Rules/confirmacionReserva';
import { LIGHT, FONT, ThemeTokens } from '../ui/theme';
import { Boton } from '../ui/Boton';

interface PublicBookingDemoProps {
  targetDateStr?: string;
  theme?: ThemeTokens;
}

// Simula el polling con el que un segundo dispositivo se entera de un cambio
// de disponibilidad. El criterio de aceptación exige < 2 segundos.
const POLL_MS = 500;

// Paleta visual para los marcos móviles de la app pública
const PHONE = {
  bg: '#FFFFFF',
  frame: '#D8DDDB',
  text: '#1B2426',
  muted: '#5B6B6E',
  line: '#E2E8E6',
  slotDisabledBg: '#F1F3F2',
  slotDisabledBorder: '#C9D1CF',
  slotDisabledText: '#AEB8B6',
  teal: '#0E6B52',
  tealSoft: '#E6F4EF',
  countdownBg: '#FBDCE2',
  countdownText: '#A83248',
  successBg: '#ECFDF5',
  successBorder: '#A7F3D0',
  successText: '#065F46',
  inputBorder: '#CBD5E1',
};

function fmtLargo(dateStr: string): string {
  if (!dateStr) return '';
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
        border: `1px solid ${disabled ? PHONE.slotDisabledBorder : selected ? PHONE.teal : '#1B2426'}`,
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
  const [confirmedBooking, setConfirmedBooking] = useState<BookingData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Formulario de datos personales (US_032 / US_033 / CP_013)
  const [fullName, setFullName] = useState('Tomás Yanardi');
  const [email, setEmail] = useState('tomas.yanardi@gmail.com');
  const [phone, setPhone] = useState('2604123456');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

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
    setFormError(null);
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
    setPendingTime(null);
    setErrorMsg(null);
  };

  const handleConfirmarReserva = () => {
    if (!lockedTime) return;

    // Validación de campos obligatorios (US_033)
    const valNombre = validarNombre(fullName);
    if (!valNombre.isValid) {
      setFormError(valNombre.errorMessage || 'Ingrese un nombre válido');
      return;
    }

    const valEmail = validarEmail(email);
    if (!valEmail.isValid) {
      setFormError(valEmail.errorMessage || 'Ingrese un email válido');
      return;
    }

    const valTel = validarTelefono(phone);
    if (!valTel.isValid) {
      setFormError(valTel.errorMessage || 'Ingrese un teléfono válido');
      return;
    }

    setFormError(null);

    // Confirmar la reserva en el backend simulado (US_034 / US_035)
    const result = confirmBooking(lockedTime, deviceId, {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      note: note.trim(),
    });

    setSlots(getSlots());

    if (!result.ok) {
      setErrorMsg(result.message || 'El tiempo para confirmar la reserva expiró');
      return;
    }

    if (result.reservation) {
      setConfirmedBooking(result.reservation);
    }
  };

  const handleResetDevice = () => {
    setPendingTime(null);
    setLockedTime(null);
    setConfirmedBooking(null);
    setErrorMsg(null);
    setFormError(null);
  };

  const remainingMs = lockedTime && !confirmedBooking ? getRemainingMs(lockedTime) : 0;
  const expired = (lockedTime !== null && !confirmedBooking && remainingMs <= 0) || errorMsg === 'El tiempo para confirmar la reserva expiró';

  const endTime = lockedTime ? calculateEndTime(lockedTime, 30) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#5B6B6E', fontFamily: FONT }}>
        📱 {deviceLabel} — Usuario invitado
      </div>
      <div
        style={{
          width: 320,
          minHeight: 480,
          background: PHONE.bg,
          border: `1px solid ${PHONE.frame}`,
          borderRadius: 20,
          boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
          padding: '16px 18px',
          fontFamily: FONT,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* PASO 3: SELECCIÓN DE HORARIO */}
        {!lockedTime && !confirmedBooking && (
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
              <div style={{ fontSize: 11.5, color: PHONE.countdownText, background: PHONE.countdownBg, padding: '6px 10px', borderRadius: 6 }}>
                {errorMsg}
              </div>
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

        {/* PASO 4: FORMULARIO DE DATOS PERSONALES (CP_013 / CP_014) */}
        {lockedTime && !confirmedBooking && !expired && (
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
              <button
                onClick={handleResetDevice}
                style={{ background: 'none', border: 'none', color: PHONE.muted, fontSize: 16, cursor: 'pointer', padding: 0 }}
                title="Volver"
              >
                ↩
              </button>
              <StepPill label="4 de 5 — Tus datos" />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: PHONE.text }}>Ingresá tus datos</div>
              <div style={{ fontSize: 11.5, color: PHONE.muted, marginTop: 2 }}>
                Turno {lockedTime} a {endTime} hs · {fmtLargo(date)}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: PHONE.text, marginBottom: 2 }}>
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: Tomás Yanardi"
                  aria-label="Nombre completo"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: `1px solid ${PHONE.inputBorder}`,
                    fontSize: 12,
                    boxSizing: 'border-box',
                    fontFamily: FONT,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: PHONE.text, marginBottom: 2 }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ej: tomas.yanardi@gmail.com"
                  aria-label="Email"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: `1px solid ${PHONE.inputBorder}`,
                    fontSize: 12,
                    boxSizing: 'border-box',
                    fontFamily: FONT,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: PHONE.text, marginBottom: 2 }}>
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: 2604123456"
                  aria-label="Teléfono"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: `1px solid ${PHONE.inputBorder}`,
                    fontSize: 12,
                    boxSizing: 'border-box',
                    fontFamily: FONT,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: PHONE.text, marginBottom: 2 }}>
                  Nota adicional (opcional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Comentario o aclaración"
                  aria-label="Nota adicional"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: `1px solid ${PHONE.inputBorder}`,
                    fontSize: 12,
                    boxSizing: 'border-box',
                    fontFamily: FONT,
                  }}
                />
              </div>
            </div>

            {formError && (
              <div style={{ fontSize: 11, color: PHONE.countdownText, background: PHONE.countdownBg, padding: '4px 8px', borderRadius: 4 }}>
                {formError}
              </div>
            )}

            {/* Ayuda de testing rápido para CP_014 */}
            <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
              <button
                type="button"
                onClick={() => {
                  if (lockedTime) {
                    expireLock(lockedTime);
                    setErrorMsg('El tiempo para confirmar la reserva expiró');
                    setSlots(getSlots());
                  }
                }}
                style={{
                  background: '#FFF1F2',
                  border: '1px dashed #FDA4AF',
                  color: '#BE123C',
                  borderRadius: 4,
                  padding: '3px 6px',
                  fontSize: 10,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                ⏱ Simular expiración (00:00)
              </button>
            </div>

            <button
              onClick={handleConfirmarReserva}
              disabled={remainingMs <= 0}
              style={{
                marginTop: 'auto',
                background: PHONE.teal,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '11px 0',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: FONT,
              }}
            >
              Confirmar
            </button>

            <div style={{ fontSize: 10, color: PHONE.muted, borderTop: `1px solid ${PHONE.line}`, paddingTop: 4 }}>
              Estado backend {lockedTime}: <strong style={{ color: PHONE.text }}>preseleccionado</strong>
            </div>
          </>
        )}

        {/* PASO 5: PANTALLA DE CONFIRMACIÓN EXITOSA (CP_013 / US_034) */}
        {confirmedBooking && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <StepPill label="5 de 5 — Confirmación" />
            </div>

            <div style={{ textAlign: 'center', margin: '4px 0' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: PHONE.tealSoft,
                  color: PHONE.teal,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  fontWeight: 'bold',
                  margin: '0 auto 8px',
                }}
              >
                ✓
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: PHONE.teal }}>
                ¡Reserva confirmada!
              </div>
              <div style={{ fontSize: 11, color: PHONE.muted, marginTop: 2 }}>
                Tu turno ha sido registrado exitosamente
              </div>
            </div>

            {/* Resumen del turno confirmado (US_034 / M04-R04F) */}
            <div
              style={{
                background: PHONE.successBg,
                border: `1px solid ${PHONE.successBorder}`,
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                fontSize: 11.5,
              }}
            >
              <div>
                <strong style={{ color: PHONE.muted }}>Tipo de evento: </strong>
                <span style={{ color: PHONE.text, fontWeight: 600 }}>{confirmedBooking.eventType}</span>
              </div>
              <div>
                <strong style={{ color: PHONE.muted }}>Fecha: </strong>
                <span style={{ color: PHONE.text, fontWeight: 600 }}>{fmtLargo(confirmedBooking.date)}</span>
              </div>
              <div>
                <strong style={{ color: PHONE.muted }}>Horario: </strong>
                <span style={{ color: PHONE.text, fontWeight: 600 }}>
                  {confirmedBooking.time} a {confirmedBooking.endTime} hs
                </span>
              </div>
              <div>
                <strong style={{ color: PHONE.muted }}>Nombre: </strong>
                <span style={{ color: PHONE.text, fontWeight: 600 }}>{confirmedBooking.fullName}</span>
              </div>
              <div>
                <strong style={{ color: PHONE.muted }}>Email: </strong>
                <span style={{ color: PHONE.text }}>{confirmedBooking.email}</span>
              </div>
              <div>
                <strong style={{ color: PHONE.muted }}>Teléfono: </strong>
                <span style={{ color: PHONE.text }}>{confirmedBooking.phone}</span>
              </div>
              {confirmedBooking.note && (
                <div>
                  <strong style={{ color: PHONE.muted }}>Nota: </strong>
                  <span style={{ color: PHONE.text }}>{confirmedBooking.note}</span>
                </div>
              )}
            </div>

            <div style={{ fontSize: 10.5, color: PHONE.teal, fontWeight: 600, textAlign: 'center' }}>
              Estado backend: <strong style={{ textTransform: 'uppercase' }}>reservado</strong>
            </div>

            <button
              onClick={handleResetDevice}
              style={{
                marginTop: 'auto',
                background: PHONE.teal,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 0',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: FONT,
              }}
            >
              Reservar otro turno
            </button>
          </div>
        )}

        {/* PANTALLA DE RECHAZO POR EXPIRACIÓN (CP_014 / US_035) */}
        {expired && !confirmedBooking && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 36 }}>⏱</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: PHONE.countdownText, lineHeight: 1.4 }}>
              El tiempo para confirmar la reserva expiró
            </div>
            <div style={{ fontSize: 11, color: PHONE.muted }}>
              El horario temporalmente reservado fue liberado y se encuentra disponible nuevamente para todos los usuarios.
            </div>
            <button
              onClick={handleResetDevice}
              style={{
                marginTop: 12,
                background: PHONE.teal,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: FONT,
              }}
            >
              Elegir nuevo horario
            </button>
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

  const [slotsState, setSlotsState] = useState<Slot[]>(() => getSlots());
  const [reservations, setReservations] = useState<BookingData[]>(() => getReservations());

  useEffect(() => {
    resetPublicBookingState(date);
    setSlotsState(getSlots());
    setReservations(getReservations());
  }, [date]);

  useEffect(() => {
    const id = setInterval(() => {
      setSlotsState(getSlots());
      setReservations(getReservations());
    }, POLL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: FONT }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: '0 0 4px 0' }}>
          Reserva Pública Mobile — Confirmación y Bloqueo Temporal (CP_011 / CP_013 / CP_014)
        </h2>
        <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
          M04-R04F (US_034, US_035). Permite experimentar la selección de turno, el bloqueo de 10 minutos, la confirmación con datos personales y el rechazo automático por expiración con sincronización en tiempo real entre dispositivos.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        <DevicePanel deviceLabel="Dispositivo A" deviceId="device-a" date={date} />
        <DevicePanel deviceLabel="Dispositivo B" deviceId="device-b" date={date} />
      </div>

      {/* INSPECTOR DE ESTADO DE BASE DE DATOS EN TIEMPO REAL */}
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.lineStrong}`,
          borderRadius: 12,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
            🗄️ Estado en Base de Datos (Backend en memoria - Fecha: {date})
          </span>
          <Boton
            tone="ghost"
            T={T}
            small
            onClick={() => {
              resetPublicBookingState(date);
              setSlotsState(getSlots());
              setReservations(getReservations());
            }}
          >
            Reiniciar estado backend
          </Boton>
        </div>

        {/* Tabla de estados de turnos */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {slotsState.map((slot) => {
            const isReserved = slot.status === 'reservado';
            const isLocked = slot.status === 'preseleccionado';
            const bg = isReserved ? '#FEE2E2' : isLocked ? '#FEF3C7' : '#DCFCE7';
            const color = isReserved ? '#991B1B' : isLocked ? '#92400E' : '#166534';

            return (
              <div
                key={slot.time}
                style={{
                  background: bg,
                  color: color,
                  padding: '6px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  minWidth: 100,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{slot.time}</span>
                  <span style={{ fontSize: 10, textTransform: 'uppercase' }}>{slot.status}</span>
                </div>
                {slot.booking && (
                  <span style={{ fontSize: 10, color: '#450A0A' }}>
                    👤 {slot.booking.fullName}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Listado de reservas activas */}
        {reservations.length > 0 && (
          <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 10, marginTop: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 6 }}>
              📋 Reservas registradas en base de datos:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {reservations.map((r, i) => (
                <div
                  key={i}
                  style={{
                    background: T.panel,
                    padding: '8px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    color: T.text,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <strong>{r.fullName}</strong> ({r.email} - {r.phone})
                  </div>
                  <div>
                    Turno: <strong>{r.time} a {r.endTime} hs</strong> · {r.eventType}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
