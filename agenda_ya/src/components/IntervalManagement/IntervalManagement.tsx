'use client';

import React, { useState, useEffect } from 'react';
import { getIntervals, deleteInterval, getReservations, IntervalItem, ReservationItem } from '../../services/scheduleService';

export const IntervalManagement: React.FC = () => {
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
      setErrorMessage(result.errorMessage || 'No se puede eliminar el intervalo');
    } else {
      setIntervals(result.intervals);
    }
    setLoading(false);
  };

  const handleCloseErrorMessage = () => {
    setErrorMessage(null);
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-white dark:bg-zinc-900 border rounded-lg shadow-sm w-full max-w-4xl">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Módulo de Configuración de Horarios Laborales
        </h2>
        <button
          onClick={loadData}
          className="px-3 py-1 text-sm bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 rounded font-medium"
        >
          Recargar módulo
        </button>
      </div>

      {/* Cartel de error exacto al intentar eliminar */}
      {errorMessage && (
        <div role="alert" className="p-4 bg-red-100 border border-red-300 text-red-800 dark:bg-red-900/40 dark:text-red-300 rounded-md flex justify-between items-center">
          <span className="font-medium">{errorMessage}</span>
          <button
            onClick={handleCloseErrorMessage}
            className="px-2 py-1 text-xs bg-red-200 dark:bg-red-800 rounded font-semibold"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Grilla de intervalos configurados */}
      <div>
        <h3 className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-200">Intervalos Configuradas</h3>
        <div className="grid grid-cols-1 gap-3">
          {intervals.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 border rounded-md bg-gray-50 dark:bg-zinc-800"
            >
              <div>
                <span className="font-bold text-gray-900 dark:text-white">{item.turno}</span>
                <span className="mx-2 text-gray-400">—</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{item.dia}</span>
                <span className="mx-2 text-gray-400">—</span>
                <span className="text-gray-600 dark:text-gray-400">{item.horario}</span>
                {item.activeReservations > 0 && (
                  <span className="ml-3 px-2 py-0.5 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 rounded-full font-medium">
                    {item.activeReservations} reservas activas
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDeleteClick(item.id)}
                aria-label={`Eliminar ${item.turno} — ${item.dia} — ${item.horario}`}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-zinc-700 rounded transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Listado de reservas asociadas */}
      <div className="border-t pt-4">
        <h3 className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-200">Listado de Reservas Asociadas</h3>
        <div className="space-y-2">
          {reservations.map((res) => (
            <div key={res.id} className="flex justify-between items-center p-2 text-sm bg-gray-50 dark:bg-zinc-800 rounded border">
              <span>Reserva ID #{res.id} ({res.fecha})</span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded">
                Estado: {res.estado}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DE TURNO */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirmación de eliminación de turno"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white text-center">
              ¿Está seguro de que desea eliminar el turno?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleConfirmChoice(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700 font-medium"
              >
                NO
              </button>
              <button
                onClick={() => handleConfirmChoice(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium"
              >
                SI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
