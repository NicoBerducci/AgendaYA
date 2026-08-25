'use client';

import React, { useState, useEffect } from 'react';
import { getDayStatus, blockDay, DayItem } from '../../services/scheduleService';

interface BlockDayConfigProps {
  targetDateStr?: string;
}

export const BlockDayConfig: React.FC<BlockDayConfigProps> = ({ targetDateStr }) => {
  // Fecha F + 7 días por defecto si no se pasa explícitamente
  const getFPlus7Date = (): string => {
    if (targetDateStr) return targetDateStr;
    const now = new Date();
    now.setDate(now.getDate() + 7);
    return now.toISOString().split('T')[0];
  };

  const defaultDate = getFPlus7Date();

  const [editMode, setEditMode] = useState<string>('Lectura');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [reasonInput, setReasonInput] = useState<string>('');
  const [sidePanelList, setSidePanelList] = useState<{ date: string; reason: string }[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [internalDayStatus, setInternalDayStatus] = useState<DayItem | null>(null);
  const [publicDayStatus, setPublicDayStatus] = useState<DayItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDayData = async () => {
    const status = await getDayStatus(defaultDate);
    setInternalDayStatus(status);
    setPublicDayStatus(status);
  };

  useEffect(() => {
    fetchDayData();
  }, [defaultDate]);

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditMode(e.target.value);
  };

  const handleSelectDateOnCalendar = (date: string) => {
    if (editMode !== 'Bloqueo') return;
    setSelectedDate(date);
    setSidePanelList([{ date, reason: reasonInput }]);
  };

  const handleSaveClick = () => {
    if (sidePanelList.length > 0) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmModalChoice = async (confirmed: boolean) => {
    setShowConfirmModal(false);
    if (!confirmed || !selectedDate) return;

    setLoading(true);
    const result = await blockDay(selectedDate, true, new Date(), reasonInput);

    if (result.isValid && result.day) {
      setFeedbackMessage(result.successMessage || `Los siguientes días fueron bloqueados exitosamente: ${selectedDate}`);
      setSidePanelList([]);
      setSelectedDate(null);
      setReasonInput('');
      await fetchDayData();
    } else {
      setFeedbackMessage(result.errorMessage || 'Error al bloquear la fecha');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-white dark:bg-zinc-900 border rounded-lg shadow-sm w-full max-w-4xl">
      {/* SECCIÓN VISTA INTERNA ADMINISTRADOR */}
      <div className="border-b pb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Panel Administrador: Módulo de Configuración de Disponibilidad
        </h2>

        {/* Carga de jornada laboral precargada */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 p-3 rounded">
          <span className="font-semibold">Jornada Laboral Cargada:</span> Lunes a Viernes (08:00 a 16:00)
        </div>

        {/* Selector de modo de edición */}
        <div className="mb-4 flex items-center gap-3">
          <label htmlFor="mode-selector" className="font-medium text-gray-700 dark:text-gray-300">
            Modo de edición:
          </label>
          <select
            id="mode-selector"
            aria-label="Modo de edición"
            value={editMode}
            onChange={handleModeChange}
            className="px-3 py-2 border rounded-md dark:bg-zinc-800 dark:text-white"
          >
            <option value="Lectura">Lectura</option>
            <option value="Bloqueo">Bloqueo</option>
          </select>
        </div>

        {/* Calendario simulado */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Calendario de Configuración:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSelectDateOnCalendar(defaultDate)}
              disabled={editMode !== 'Bloqueo'}
              className={`px-4 py-2 border rounded-md transition-colors ${
                selectedDate === defaultDate
                  ? 'bg-amber-100 border-amber-500 font-semibold'
                  : internalDayStatus?.status === 'Bloqueado'
                  ? 'bg-red-100 border-red-400 text-red-700 cursor-not-allowed'
                  : 'bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700'
              }`}
            >
              Fecha F+7 ({defaultDate})
            </button>
          </div>
        </div>

        {/* Panel lateral de selección */}
        <div aria-label="Panel lateral" className="border p-4 rounded-md mb-4 bg-gray-50 dark:bg-zinc-800">
          <h3 className="font-semibold text-sm mb-2 text-gray-800 dark:text-gray-200">Panel Lateral de Fechas Seleccionadas</h3>
          {sidePanelList.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No hay fechas seleccionadas en el panel.</p>
          ) : (
            sidePanelList.map((item) => (
              <div key={item.date} className="flex flex-col gap-2">
                <p className="text-sm font-medium">Fecha: {item.date}</p>
                <div className="flex items-center gap-2">
                  <label htmlFor="reason-input" className="text-xs text-gray-600 dark:text-gray-400">
                    Motivo (opcional):
                  </label>
                  <input
                    id="reason-input"
                    type="text"
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value)}
                    placeholder="Motivo interno del bloqueo..."
                    className="px-2 py-1 text-sm border rounded dark:bg-zinc-700 dark:text-white"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Botón Guardar */}
        <button
          onClick={handleSaveClick}
          disabled={sidePanelList.length === 0 || loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md font-medium transition-colors"
        >
          Guardar
        </button>

        {/* Cartel de feedback */}
        {feedbackMessage && (
          <div role="alert" className="mt-4 p-3 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 rounded-md font-medium text-sm">
            {feedbackMessage}
          </div>
        )}

        {/* Detalle interno del estado de la fecha */}
        {internalDayStatus && (
          <div className="mt-4 p-3 border rounded bg-white dark:bg-zinc-800 text-sm">
            <span className="font-semibold">Detalle Vista Interna Admin: </span>
            <span>Fecha {internalDayStatus.date} ➔ Estado: </span>
            <span className="font-bold text-red-600 dark:text-red-400">{internalDayStatus.status}</span>
          </div>
        )}
      </div>

      {/* SECCIÓN VISTA PÚBLICA DE LA AGENDA (SIMULACIÓN USUARIO INVITADO) */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Vista Pública de la Agenda (Simulación Usuario Invitado)
        </h2>
        <div className="p-4 border rounded-md bg-gray-50 dark:bg-zinc-800 text-sm flex flex-col gap-2">
          <p className="font-medium text-gray-700 dark:text-gray-300">Enlace Público de Agenda:</p>
          <div className="flex items-center gap-3">
            <span>Fecha {defaultDate}:</span>
            {publicDayStatus?.isPublicSelectable ? (
              <span className="text-green-600 font-semibold">Seleccionable (Turnos Disponibles)</span>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 font-semibold cursor-not-allowed">
                No seleccionable (Sin turnos ofrecidos)
              </span>
            )}
          </div>
          {/* Verificar que NO se expone ningún motivo en la vista pública */}
          <div className="text-xs text-gray-500 italic mt-1">
            Información expuesta públicamente: Únicamente disponibilidad básica (Sin motivo ni configuración interna visible).
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN DE BLOQUEO */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirmación de bloqueo"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white text-center">
              ¿Estás seguro de bloquear esta fecha?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleConfirmModalChoice(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700 font-medium"
              >
                NO
              </button>
              <button
                onClick={() => handleConfirmModalChoice(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
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
