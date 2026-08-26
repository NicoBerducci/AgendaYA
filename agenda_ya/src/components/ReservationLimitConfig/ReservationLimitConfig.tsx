'use client';

import React, { useState } from 'react';
import { LIGHT } from '../ui/theme';
import { saveReservationLimit } from '../../services/reservationLimitService';
import { Aviso } from '../ui/Aviso';
import { AlertModal } from '../ui/AlertModal';

interface ReservationLimitConfigProps {
  theme?: any;
}

export const ReservationLimitConfig: React.FC<ReservationLimitConfigProps> = ({ theme }) => {
  const T = theme || LIGHT;

  const [eventType, setEventType] = useState('');
  const [limitInput, setLimitInput] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSave = async () => {
    setLoading(true);
    setFeedbackMessage(null);
    const response = await saveReservationLimit(limitInput);
    if (response.isValid) {
      setIsSuccess(true);
      setFeedbackMessage(response.successMessage || 'El límite máximo de reservas fue configurado exitosamente');
    } else {
      setIsSuccess(false);
      setFeedbackMessage(response.errorMessage || 'El límite debe ser un número entero mayor a 0');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setEventType('');
    setLimitInput('');
    setFeedbackMessage(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Antelacion Minima de reserva */}
      <div style={{ padding: 24, border: `1px solid ${T.line}`, borderRadius: 12, background: T.surface, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 28, fontWeight: 500, color: T.text, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Antelacion Minima de reserva
          </h2>
          <p style={{ color: T.muted, margin: 0, fontSize: 14 }}>
            Define con cuánta anticipación mínima los clientes pueden reservar un evento.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', gap: 24 }}>
            {/* Tipo de evento */}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 8 }}>
                Tipo de evento
              </label>
              <select
                disabled
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: 14,
                  border: `1px solid ${T.lineStrong}`,
                  borderRadius: 8,
                  background: T.surface,
                  color: T.text,
                  appearance: 'none',
                  outline: 'none',
                }}
              >
                <option value="" disabled selected>Seleccione el tipo de evento</option>
              </select>
            </div>

            {/* Antelación mínima */}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 8 }}>
                Antelación mínima
              </label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Ej: 02"
                  disabled
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    fontSize: 14,
                    border: `1px solid ${T.lineStrong}`,
                    borderRadius: 8,
                    background: T.surface,
                    color: T.text,
                    outline: 'none',
                  }}
                />
                <div style={{
                  padding: '12px 16px',
                  background: T.appBg,
                  border: `1px solid ${T.line}`,
                  borderRadius: 8,
                  color: T.muted,
                  fontSize: 14,
                  fontWeight: 500
                }}>
                  horas
                </div>
              </div>
            </div>
          </div>

          {/* Información */}
          <div style={{ background: T.appBg, padding: '16px', borderRadius: 8, border: `1px solid ${T.line}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.muted, marginBottom: 4 }}>Información</div>
            <div style={{ fontSize: 14, color: T.muted }}>Establece el tiempo mínimo de anticipación requerido para permitir reservas.</div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 8 }}>
            <button
              disabled
              style={{
                padding: '12px 32px',
                background: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 500,
                cursor: 'not-allowed',
                opacity: 0.7,
              }}
            >
              Cancelar
            </button>
            <button
              disabled
              style={{
                padding: '12px 32px',
                background: '#A7F3D0',
                color: '#064E3B',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 500,
                cursor: 'not-allowed',
                opacity: 0.7,
              }}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Límite máximo de reservas por dia */}
      <div style={{ padding: 24, border: `1px solid ${T.line}`, borderRadius: 12, background: T.surface, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 28, fontWeight: 500, color: T.text, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Límite máximo de reservas por dia
          </h2>
          <p style={{ color: T.muted, margin: 0, fontSize: 14 }}>
            Define el máximo de reservas que desea tener por día
          </p>
        </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', gap: 24 }}>
          {/* Tipo de evento */}
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 8 }}>
              Tipo de evento
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 14,
                border: `1px solid ${T.lineStrong}`,
                borderRadius: 8,
                background: T.surface,
                color: T.text,
                appearance: 'none',
                outline: 'none',
              }}
            >
              <option value="" disabled>Seleccione el tipo de evento</option>
              <option value="Consulta general">Consulta general</option>
            </select>
          </div>

          {/* Límite máximo */}
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 8 }}>
              Límite máximo
            </label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Ej: 02"
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: 14,
                  border: `1px solid ${T.lineStrong}`,
                  borderRadius: 8,
                  background: T.surface,
                  color: T.text,
                  outline: 'none',
                }}
              />
              <div style={{
                padding: '12px 16px',
                background: T.appBg,
                border: `1px solid ${T.line}`,
                borderRadius: 8,
                color: T.muted,
                fontSize: 14,
                fontWeight: 500
              }}>
                Reservas
              </div>
            </div>
          </div>
        </div>

        {/* Información */}
        <div style={{ background: T.appBg, padding: '16px', borderRadius: 8, border: `1px solid ${T.line}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.muted, marginBottom: 4 }}>Información</div>
          <div style={{ fontSize: 14, color: T.muted }}>Establece el límite máximo de reservas por día.</div>
        </div>
        
        {feedbackMessage && (
          <div style={{ position: 'fixed', zIndex: 10000 }}>
            <AlertModal
              T={T}
              open={true}
              tipo={isSuccess ? 'ok' : 'err'}
              texto={feedbackMessage}
              onClose={() => setFeedbackMessage(null)}
              botones={
                !isSuccess ? (
                  <button
                    onClick={() => setFeedbackMessage(null)}
                    style={{
                      padding: '8px 32px',
                      background: '#fff',
                      color: '#000',
                      border: '1px solid #000',
                      borderRadius: 8,
                      fontSize: 18,
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    OK
                  </button>
                ) : undefined
              }
            />
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 8 }}>
          <button
            onClick={handleCancel}
            disabled={loading}
            style={{
              padding: '12px 32px',
              background: '#EF4444', // red
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 500,
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: '12px 32px',
              background: '#A7F3D0', // light green
              color: '#064E3B', // dark green text
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 500,
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            Guardar
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};
