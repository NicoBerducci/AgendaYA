'use client';

import React, { useState, useEffect } from 'react';
import { getIntervals, deleteInterval, getReservations, IntervalItem, ReservationItem } from '../../services/scheduleService';
import { LIGHT, FONT } from '../ui/theme';
import { Boton } from '../ui/Boton';
import { Modal } from '../ui/Modal';
import { Aviso } from '../ui/Aviso';

interface IntervalManagementProps {
  theme?: any;
}

export const IntervalManagement: React.FC<IntervalManagementProps> = ({ theme }) => {
  const T = theme || LIGHT;
  const [intervals, setIntervals] = useState<IntervalItem[]>([]);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [selectedIntervalId, setSelectedIntervalId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    const loadedIntervals = await getIntervals();
    const loadedReservations = await getReservations();
    setIntervals(loadedIntervals);
    setReservations(loadedReservations);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteClick = (id: number) => {
    setSelectedIntervalId(id);
    setShowConfirmModal(true);
  };

  const handleConfirmChoice = async (confirmed: boolean) => {
    setShowConfirmModal(false);
    if (!confirmed || selectedIntervalId === null) return;

    setLoading(true);
    const result = await deleteInterval(selectedIntervalId, true);

    if (!result.isValid) {
      setErrorMessage(result.errorMessage || 'No se puede eliminar el intervalo porque tiene reservas activas');
    } else {
      setIntervals(result.intervals);
    }
    setLoading(false);
  };

  const handleCloseErrorMessage = () => {
    setErrorMessage(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.line}`, paddingBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0, fontFamily: FONT }}>
          Módulo de Configuración de Horarios Laborales
        </h2>
        <Boton T={T} small tone="ghost" onClick={loadData}>
          Recargar módulo
        </Boton>
      </div>

      {errorMessage && (
        <Aviso T={T} tipo="err" texto={errorMessage} onClose={handleCloseErrorMessage} />
      )}

      <div>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: T.text }}>Intervalos Configuradas</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          {intervals.map((item) => (
            <div
              key={item.id}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, border: `1px solid ${T.line}`, borderRadius: 6, background: T.panel }}
            >
              <div>
                <span style={{ fontWeight: 700, color: T.text }}>{item.turno}</span>
                <span style={{ margin: '0 8px', color: T.faded }}>—</span>
                <span style={{ fontWeight: 500, color: T.text }}>{item.dia}</span>
                <span style={{ margin: '0 8px', color: T.faded }}>—</span>
                <span style={{ color: T.muted }}>{item.horario}</span>
                {item.activeReservations > 0 && (
                  <span style={{ marginLeft: 12, padding: '2px 8px', fontSize: 12, background: '#FEF3C7', color: '#92400E', borderRadius: 9999, fontWeight: 500 }}>
                    {item.activeReservations} reservas activas
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDeleteClick(item.id)}
                aria-label={`Eliminar ${item.turno} — ${item.dia} — ${item.horario}`}
                style={{ padding: 8, color: T.danger, background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4, transition: 'background 0.2s', fontSize: 20 }}
                title="Eliminar intervalo"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: T.text }}>Listado de Reservas Asociadas</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reservations.map((res) => (
            <div key={res.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, fontSize: 14, background: T.surface, borderRadius: 4, border: `1px solid ${T.lineStrong}` }}>
              <span style={{ color: T.text }}>Reserva ID #{res.id} ({res.fecha})</span>
              <span style={{ padding: '2px 8px', fontSize: 12, fontWeight: 600, background: '#DBEAFE', color: '#1E40AF', borderRadius: 4 }}>
                Estado: {res.estado}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Modal
        T={T}
        open={showConfirmModal}
        titulo="¿Está seguro de que desea eliminar el turno?"
        textoSi="SI"
        textoNo="NO"
        onSi={() => handleConfirmChoice(true)}
        onNo={() => handleConfirmChoice(false)}
      />
    </div>
  );
};
