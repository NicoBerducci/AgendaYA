'use client';

import React, { useState, useEffect } from 'react';
import { getRestPeriod, saveRestPeriod } from '../../services/restPeriodService';
import { LIGHT } from '../ui/theme';
import { Boton } from '../ui/Boton';
import { Modal } from '../ui/Modal';
import { Aviso } from '../ui/Aviso';

interface RestPeriodConfigProps {
  theme?: any;
}

export const RestPeriodConfig: React.FC<RestPeriodConfigProps> = ({ theme }) => {
  const T = theme || LIGHT; 

  const [isOpen, setIsOpen] = useState(false);
  const [minutesInput, setMinutesInput] = useState<string>('0');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchRestPeriod = async () => {
    setLoading(true);
    const currentPeriod = await getRestPeriod();
    setMinutesInput(String(currentPeriod));
    setLoading(false);
  };

  useEffect(() => {
    fetchRestPeriod();
  }, []);

  const handleOpenModal = async () => {
    await fetchRestPeriod();
    setFeedbackMessage(null);
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setFeedbackMessage(null);
  };

  const handleSave = async () => {
    setLoading(true);
    const response = await saveRestPeriod(minutesInput);
    if (response.isValid) {
      setIsSuccess(true);
      setFeedbackMessage(response.successMessage || 'El intervalo entre turnos fue configurado exitosamente');
    } else {
      setIsSuccess(false);
      setFeedbackMessage(response.errorMessage || 'El intervalo debe estar entre 0 y 120 minutos');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 16, border: `1px solid ${T.line}`, borderRadius: 8, background: T.surface, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <Boton T={T} onClick={handleOpenModal} tone="neutral">
        Configurar descansos entre reservas
      </Boton>

      <Modal
        T={T}
        open={isOpen}
        titulo="Ingrese el intervalo de descanso en minutos que desea:"
        textoSi="Guardar"
        textoNo="Cerrar"
        onSi={handleSave}
        onNo={handleCloseModal}
        cuerpo={
          <div>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="rest-period-input" style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: T.text, marginBottom: 4 }}>
                Minutos de descanso
              </label>
              <input
                id="rest-period-input"
                type="number"
                value={minutesInput}
                onChange={(e) => setMinutesInput(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: 14,
                  border: `1px solid ${T.lineStrong}`, borderRadius: 6,
                  background: T.surface, color: T.text,
                }}
              />
            </div>
            <Aviso
              T={T}
              texto={feedbackMessage || undefined}
              tipo={isSuccess ? "ok" : "err"}
            />
          </div>
        }
      />
    </div>
  );
};
