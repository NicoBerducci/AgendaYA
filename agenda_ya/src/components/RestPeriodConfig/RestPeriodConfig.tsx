'use client';

import React, { useState, useEffect } from 'react';
import { getRestPeriod, saveRestPeriod } from '../../services/restPeriodService';

export const RestPeriodConfig: React.FC = () => {
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
    <div className="p-4 border rounded shadow-sm bg-white dark:bg-zinc-900">
      <button
        onClick={handleOpenModal}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
      >
        Configurar descansos entre reservas
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Configurar descanso entre reservas"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-md w-full shadow-lg relative">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Ingrese el intervalo de descanso en minutos que desea:
            </h2>

            <div className="mb-4">
              <label htmlFor="rest-period-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minutos de descanso
              </label>
              <input
                id="rest-period-input"
                type="number"
                value={minutesInput}
                onChange={(e) => setMinutesInput(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white dark:border-zinc-600"
              />
            </div>

            {feedbackMessage && (
              <div
                role="alert"
                className={`p-3 rounded-md mb-4 text-sm font-medium ${
                  isSuccess
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                }`}
              >
                {feedbackMessage}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-200 dark:border-zinc-600 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700"
              >
                Cerrar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
