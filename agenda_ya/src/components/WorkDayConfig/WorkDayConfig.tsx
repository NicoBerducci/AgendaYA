'use client';

import React, { useState } from 'react';
import { LIGHT } from '../ui/theme';
import { AlertModal } from '../ui/AlertModal';

interface WorkDayConfigProps {
  theme?: any;
}

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const WorkDayConfig: React.FC<WorkDayConfigProps> = ({ theme }) => {
  const T = theme || LIGHT;

  // Estado: para cada día, guardamos si está seleccionado y su horario (inicio, fin)
  const [schedule, setSchedule] = useState<Record<string, { selected: boolean; start: string; end: string }>>({
    Lunes: { selected: false, start: '08:00', end: '16:00' },
    Martes: { selected: false, start: '08:00', end: '16:00' },
    Miércoles: { selected: false, start: '08:00', end: '16:00' },
    Jueves: { selected: false, start: '08:00', end: '16:00' },
    Viernes: { selected: false, start: '08:00', end: '16:00' },
    Sábado: { selected: false, start: '08:00', end: '16:00' },
    Domingo: { selected: false, start: '08:00', end: '16:00' },
  });

  // Estado del modal de edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');

  // Estado del AlertModal (error)
  const [alertState, setAlertState] = useState<{ open: boolean; tipo: 'err'; texto: string } | null>(null);

  const toggleDay = (day: string) => {
    setSchedule((prev) => {
      const isSelected = !prev[day].selected;
      return {
        ...prev,
        [day]: {
          selected: isSelected,
          // CP_001: precarga automática de horarios
          start: isSelected ? '08:00' : prev[day].start,
          end: isSelected ? '16:00' : prev[day].end,
        },
      };
    });
  };

  const handleEditClick = (day: string) => {
    setEditingDay(day);
    setEditStart(schedule[day].start);
    setEditEnd(schedule[day].end);
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingDay) return;

    // Validación de coherencia horaria (CP_002)
    const [startH, startM] = editStart.split(':').map(Number);
    const [endH, endM] = editEnd.split(':').map(Number);

    const startTotal = (startH || 0) * 60 + (startM || 0);
    const endTotal = (endH || 0) * 60 + (endM || 0);

    if (endTotal <= startTotal) {
      setAlertState({
        open: true,
        tipo: 'err',
        texto: `El horario de fin debe ser posterior al de inicio en el día ${editingDay}`
      });
      return;
    }

    setSchedule((prev) => ({
      ...prev,
      [editingDay]: {
        ...prev[editingDay],
        start: editStart,
        end: editEnd,
      },
    }));
    setEditModalOpen(false);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingDay(null);
  };

  const mainPanelStyle = {
    background: '#d4dad8', // color gris-verdoso de la imagen
    border: '1px solid #94a3b8',
    borderRadius: 6,
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  };

  const columnHeaderStyle = {
    padding: '12px',
    textAlign: 'center' as const,
    borderBottom: '1px solid #94a3b8',
    fontSize: 16,
    color: '#1e293b',
    margin: '0 12px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, padding: 24 }}>
      <h2 style={{ fontSize: 32, fontWeight: 500, color: '#000', margin: '0 0 16px 0' }}>
        Configurar Jornada Laboral
      </h2>

      <div style={{ display: 'flex', gap: 8, maxWidth: 1000 }}>
        {/* Columna 1: Días */}
        <div style={{ ...mainPanelStyle, flex: '1.2' }}>
          <div style={{ padding: '8px 0' }}>
            <div style={columnHeaderStyle}>Días</div>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 24px', gap: 28 }}>
              {DIAS.map((day) => (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 18, color: '#1e293b' }}>{day}</span>
                  <div
                    onClick={() => toggleDay(day)}
                    style={{
                      width: 24,
                      height: 24,
                      background: '#000',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    {schedule[day].selected && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna 2: Turno 1 */}
        <div style={{ ...mainPanelStyle, flex: '1.8' }}>
          <div style={{ padding: '8px 0' }}>
            <div style={columnHeaderStyle}>
              Turno 1 <span style={{ color: '#ef4444' }}>🗑️</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 24px', gap: 28 }}>
              {DIAS.map((day) => (
                <div key={day} style={{ display: 'flex', alignItems: 'center', height: 28 }}>
                  {schedule[day].selected ? (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 12, 
                      background: editingDay === day ? '#fff' : 'transparent',
                      padding: editingDay === day ? '2px 12px' : '0',
                      borderRadius: 16
                    }}>
                      <span style={{ fontSize: 14, color: '#1e293b' }}>Horario:</span>
                      <span style={{ fontSize: 14, color: '#1e293b' }}>
                        {schedule[day].start}-{schedule[day].end}
                      </span>
                      <button
                        onClick={() => handleEditClick(day)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => toggleDay(day)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                      >
                        ❌
                      </button>
                    </div>
                  ) : (
                    <div style={{ height: 28 }}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna 3: Agregar Turno */}
        <div style={{ ...mainPanelStyle, flex: '1.2', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={columnHeaderStyle}>Agregar Turno</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: '#fff',
                border: '1px solid #94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 40,
                color: '#000',
                paddingBottom: 4
              }}>
                +
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 1000, marginTop: 16 }}>
        <button style={{
          padding: '12px 24px',
          background: '#fef08a', // light yellow
          border: '1px solid #b45309',
          borderRadius: 6,
          fontSize: 16,
          color: '#000',
          cursor: 'pointer'
        }}>
          Configurar descansos entre reservas
        </button>

        <div style={{ display: 'flex', gap: 16 }}>
          <button style={{
            padding: '12px 32px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 500,
            cursor: 'pointer',
          }}>
            Cancelar
          </button>
          <button style={{
            padding: '12px 32px',
            background: '#a7f3d0',
            color: '#064e3b',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 500,
            cursor: 'pointer',
          }}>
            Guardar
          </button>
        </div>
      </div>

      {/* Edit Modal (Imagen 3) */}
      {editModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ width: 650, borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.15)', background: '#fff' }}>
            {/* Modal Header */}
            <div style={{ background: '#7AC9B7', padding: '12px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>

            <div style={{ padding: '24px 32px' }}>
              <h3 style={{ fontSize: 32, fontWeight: 400, color: '#000', margin: '0 0 32px 0', textAlign: 'center' }}>
                Ingrese el intervalo de horario deseado
              </h3>

              <div style={{ display: 'flex', gap: 48 }}>
                {/* Left side: Days list */}
                <div style={{ flex: 1, border: '1px solid #94a3b8', borderRadius: 6 }}>
                  <div style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #94a3b8', fontSize: 16, color: '#1e293b' }}>
                    Días
                  </div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {DIAS.map((day) => (
                      <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 16, color: '#1e293b' }}>{day}</span>
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            background: '#000',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {/* We just show the checkmark if it's the editing day, or keep it matching the actual state. For fidelity, we check the selected state */}
                          {(schedule[day].selected || day === editingDay) && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side: Inputs */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
                    <span style={{ fontSize: 24, width: 70 }}>Inicio</span>
                    <input
                      type="time"
                      value={editStart}
                      onChange={(e) => setEditStart(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        background: '#e2e8f0',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 18,
                        width: 120,
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
                    <span style={{ fontSize: 24, width: 70 }}>Fin</span>
                    <input
                      type="time"
                      value={editEnd}
                      onChange={(e) => setEditEnd(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        background: '#e2e8f0',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 18,
                        width: 120,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '0 24px 24px', display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
              <button
                onClick={closeEditModal}
                style={{
                  padding: '12px 32px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 18,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  padding: '12px 32px',
                  background: '#a7f3d0',
                  color: '#064e3b',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 18,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AlertModal for CP_002 */}
      {alertState?.open && (
        <div style={{ position: 'fixed', zIndex: 10000 }}>
          <AlertModal
            T={T}
            open={alertState.open}
            tipo={alertState.tipo}
            texto={alertState.texto}
            onClose={() => setAlertState(null)}
            botones={
              <button
                onClick={() => setAlertState(null)}
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
            }
          />
        </div>
      )}
    </div>
  );
};
