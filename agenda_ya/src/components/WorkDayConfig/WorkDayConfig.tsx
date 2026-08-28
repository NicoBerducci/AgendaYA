'use client';

import React, { useState, useEffect } from 'react';
import { LIGHT } from '../ui/theme';
import { AlertModal } from '../ui/AlertModal';
import { getIntervals, getWorkDays, saveWorkDaysAndIntervals, toggleIntervalStatus, IntervalItem } from '../../services/scheduleService';

interface WorkDayConfigProps {
  theme?: any;
}

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const WorkDayConfig: React.FC<WorkDayConfigProps> = ({ theme }) => {
  const T = theme || LIGHT;

  const [schedule, setSchedule] = useState<Record<string, { selected: boolean; intervals: IntervalItem[] }>>({});
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [modalSelectedDays, setModalSelectedDays] = useState<string[]>([]);
  const [editStart, setEditStart] = useState('08:00');
  const [editEnd, setEditEnd] = useState('12:00');

  const [alertState, setAlertState] = useState<{ open: boolean; tipo: 'ok' | 'err'; texto: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [apiWorkDays, apiIntervals] = await Promise.all([getWorkDays(), getIntervals()]);
      
      const newSchedule: Record<string, { selected: boolean; intervals: IntervalItem[] }> = {};
      
      DIAS.forEach(day => {
        newSchedule[day] = {
          selected: apiWorkDays.includes(day),
          intervals: apiIntervals.filter(i => i.dia === day).sort((a, b) => a.horario.localeCompare(b.horario))
        };
      });

      setSchedule(newSchedule);
      setLoading(false);
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ padding: 24 }}>Cargando configuración...</div>;
  }

  const maxTurnos = Math.max(
    ...Object.values(schedule).map((day) => day.intervals.length),
    2
  );

  const toggleDay = (day: string) => {
    setSchedule((prev) => {
      const isSelected = !prev[day].selected;
      return {
        ...prev,
        [day]: {
          ...prev[day],
          selected: isSelected,
        },
      };
    });
  };

  const handleEditClick = (day: string, index: number) => {
    setIsAddMode(false);
    setEditingDay(day);
    setEditingIndex(index);
    setModalSelectedDays([day]);
    const interval = schedule[day].intervals[index];
    const [start, end] = interval.horario.split(' a ');
    setEditStart(start);
    setEditEnd(end);
    setEditModalOpen(true);
  };

  const handleAddTurnoClick = () => {
    setIsAddMode(true);
    setEditingDay('Lunes');
    setEditingIndex(null);
    setModalSelectedDays(['Lunes']);
    setEditStart('11:00');
    setEditEnd('15:00');
    setEditModalOpen(true);
  };

  const handleDisableInterval = async (day: string, index: number) => {
    const interval = schedule[day].intervals[index];
    if (interval.id) {
      // Si el intervalo ya tiene ID (existe en backend), usamos la API
      const res = await toggleIntervalStatus(interval.id, false);
      if (res.isValid) {
        setAlertState({ open: true, tipo: 'ok', texto: res.successMessage || '' });
        // Actualizamos local state
        setSchedule(prev => {
          const newIntervals = [...prev[day].intervals];
          newIntervals[index] = { ...newIntervals[index], enabled: false };
          return { ...prev, [day]: { ...prev[day], intervals: newIntervals } };
        });
      } else {
        setAlertState({ open: true, tipo: 'err', texto: res.errorMessage || '' });
      }
    } else {
      // Es un intervalo nuevo (no guardado), solo deshabilitar localmente
      setSchedule(prev => {
        const newIntervals = [...prev[day].intervals];
        newIntervals[index] = { ...newIntervals[index], enabled: false };
        return { ...prev, [day]: { ...prev[day], intervals: newIntervals } };
      });
      setAlertState({
        open: true,
        tipo: 'ok',
        texto: `Se deshabilitó el intervalo del turno Turno ${index + 1} del día ${day} exitosamente`,
      });
    }
  };

  const handleEnableInterval = async (day: string, index: number) => {
    const interval = schedule[day].intervals[index];
    if (interval.id) {
      const res = await toggleIntervalStatus(interval.id, true);
      if (res.isValid) {
        setAlertState({ open: true, tipo: 'ok', texto: res.successMessage || '' });
        setSchedule(prev => {
          const newIntervals = [...prev[day].intervals];
          newIntervals[index] = { ...newIntervals[index], enabled: true };
          return { ...prev, [day]: { ...prev[day], intervals: newIntervals } };
        });
      } else {
        setAlertState({ open: true, tipo: 'err', texto: res.errorMessage || '' });
      }
    } else {
      setSchedule(prev => {
        const newIntervals = [...prev[day].intervals];
        newIntervals[index] = { ...newIntervals[index], enabled: true };
        return { ...prev, [day]: { ...prev[day], intervals: newIntervals } };
      });
      setAlertState({
        open: true,
        tipo: 'ok',
        texto: `Se habilitó nuevamente el intervalo del turno Turno ${index + 1} del día ${day}`,
      });
    }
  };

  const toggleModalDay = (day: string) => {
    setModalSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSaveEdit = () => {
    const targetDays = modalSelectedDays.length > 0 ? modalSelectedDays : (editingDay ? [editingDay] : ['Lunes']);

    const [startH, startM] = editStart.split(':').map(Number);
    const [endH, endM] = editEnd.split(':').map(Number);
    const startTotal = (startH || 0) * 60 + (startM || 0);
    const endTotal = (endH || 0) * 60 + (endM || 0);

    if (endTotal <= startTotal) {
      setAlertState({
        open: true,
        tipo: 'err',
        texto: `El horario de fin debe ser posterior al de inicio en el día ${targetDays[0]}`,
      });
      return;
    }

    setSchedule((prev) => {
      const updated = { ...prev };
      for (const day of targetDays) {
        const horario = `${editStart} a ${editEnd}`;
        if (isAddMode) {
          const nextTurno = updated[day].intervals.length + 1;
          updated[day] = {
            ...updated[day],
            selected: true,
            intervals: [
              ...updated[day].intervals,
              { id: 0, dia: day, turno: `Turno ${nextTurno}`, horario, activeReservations: 0, enabled: true }
            ],
          };
        } else if (editingIndex !== null && editingDay === day) {
          const newIntervals = [...updated[day].intervals];
          newIntervals[editingIndex] = { ...newIntervals[editingIndex], horario };
          updated[day] = { ...updated[day], selected: true, intervals: newIntervals };
        } else if (editingIndex !== null) {
          const nextTurno = updated[day].intervals.length + 1;
          updated[day] = {
            ...updated[day],
            selected: true,
            intervals: [
              ...updated[day].intervals,
              { id: 0, dia: day, turno: `Turno ${nextTurno}`, horario, activeReservations: 0, enabled: true }
            ],
          };
        }
      }
      return updated;
    });

    setEditModalOpen(false);
  };

  const handleGlobalSave = async () => {
    const finalIntervals: IntervalItem[] = [];
    const finalWorkDays: string[] = [];
    
    // Asignamos IDs simulados a los nuevos intervalos
    let currentMaxId = 0;
    for (const day of DIAS) {
      schedule[day].intervals.forEach(int => {
        if (int.id && int.id > currentMaxId) currentMaxId = int.id;
      });
    }

    for (const day of DIAS) {
      if (!schedule[day].selected) continue;
      
      finalWorkDays.push(day);
      const intervals = schedule[day].intervals.filter((i) => i.enabled !== false); // Solo para validar overlap
      
      for (let i = 0; i < intervals.length; i++) {
        for (let j = i + 1; j < intervals.length; j++) {
          const int1 = intervals[i];
          const int2 = intervals[j];
          
          const [s1Str, e1Str] = int1.horario.split(' a ');
          const [s2Str, e2Str] = int2.horario.split(' a ');
          
          const [s1H, s1M] = s1Str.split(':').map(Number);
          const [e1H, e1M] = e1Str.split(':').map(Number);
          const start1 = s1H * 60 + s1M;
          const end1 = e1H * 60 + e1M;
          
          const [s2H, s2M] = s2Str.split(':').map(Number);
          const [e2H, e2M] = e2Str.split(':').map(Number);
          const start2 = s2H * 60 + s2M;
          const end2 = e2H * 60 + e2M;
          
          if (start1 < end2 && start2 < end1) {
            setAlertState({
              open: true,
              tipo: 'err',
              texto: `Hay superposición de horarios en el día ${day}`,
            });
            return; // Bloquea guardado
          }
        }
      }

      // Preparar array para guardar (incluyendo deshabilitados que no superponen obviamente o sí superponen pero están deshabilitados)
      schedule[day].intervals.forEach((int) => {
        let finalInt = { ...int };
        if (!finalInt.id) {
          currentMaxId++;
          finalInt.id = currentMaxId;
        }
        finalIntervals.push(finalInt);
      });
    }
    
    await saveWorkDaysAndIntervals(finalWorkDays, finalIntervals);
    setAlertState({
      open: true,
      tipo: 'ok',
      texto: 'Configuración guardada exitosamente.',
    });
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingDay(null);
    setEditingIndex(null);
  };

  const mainPanelStyle = {
    background: '#d4dad8',
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
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, padding: 24, overflowX: 'auto' }}>
      <h2 style={{ fontSize: 32, fontWeight: 500, color: '#000', margin: '0 0 16px 0' }}>
        Configurar Jornada Laboral
      </h2>

      <div style={{ display: 'flex', gap: 8, minWidth: 'min-content' }}>
        <div style={{ ...mainPanelStyle, flex: '1 0 150px' }}>
          <div style={{ padding: '8px 0' }}>
            <div style={columnHeaderStyle}>Días</div>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 24px', gap: 28 }}>
              {DIAS.map((day) => (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 28 }}>
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

        {Array.from({ length: maxTurnos }).map((_, colIndex) => (
          <div key={colIndex} style={{ ...mainPanelStyle, flex: '1 0 280px' }}>
            <div style={{ padding: '8px 0' }}>
              <div style={columnHeaderStyle}>
                Turno {colIndex + 1} <span style={{ color: '#ef4444' }}>🗑️</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 24px', gap: 28 }}>
                {DIAS.map((day) => {
                  const interval = schedule[day].intervals[colIndex];
                  return (
                    <div key={day} style={{ display: 'flex', alignItems: 'center', height: 28 }}>
                      {schedule[day].selected && interval ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            background: interval.enabled === false ? '#fff' : 'transparent',
                            padding: interval.enabled === false ? '2px 12px' : '0',
                            borderRadius: 16,
                            boxShadow: interval.enabled === false ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          }}
                        >
                          <span style={{ fontSize: 14, color: '#1e293b' }}>Horario:</span>
                          <span style={{ fontSize: 14, color: '#1e293b', whiteSpace: 'nowrap' }}>
                            {interval.horario.replace(' a ', '-')}
                          </span>
                          <button
                            onClick={() => handleEditClick(day, colIndex)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                            title={`Editar Turno ${colIndex + 1}`}
                          >
                            ✏️
                          </button>
                          {interval.enabled !== false ? (
                            <button
                              onClick={() => handleDisableInterval(day, colIndex)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              title="Deshabilitar intervalo"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444">
                                <circle cx="12" cy="12" r="10" fill="#ef4444" />
                                <line x1="15" y1="9" x2="9" y2="15" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                                <line x1="9" y1="9" x2="15" y2="15" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEnableInterval(day, colIndex)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              title="Rehabilitar intervalo"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 4 23 10 17 10" />
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div style={{ height: 28 }}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        <div style={{ ...mainPanelStyle, flex: '1 0 180px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={columnHeaderStyle}>Agregar Turno</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div
                onClick={handleAddTurnoClick}
                style={{
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
                  paddingBottom: 4,
                }}
                title="Agregar nuevo intervalo"
              >
                +
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 1000, marginTop: 16 }}>
        <button
          style={{
            padding: '12px 24px',
            background: '#fef08a',
            border: '1px solid #b45309',
            borderRadius: 6,
            fontSize: 16,
            color: '#000',
            cursor: 'pointer',
          }}
        >
          Configurar descansos entre reservas
        </button>

        <div style={{ display: 'flex', gap: 16 }}>
          <button
            style={{
              padding: '12px 32px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleGlobalSave}
            style={{
              padding: '12px 32px',
              background: '#a7f3d0',
              color: '#064e3b',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Guardar
          </button>
        </div>
      </div>

      {editModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ width: 650, borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.15)', background: '#fff' }}>
            <div style={{ background: '#7AC9B7', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <button onClick={closeEditModal} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#1e293b' }}>×</button>
            </div>

            <div style={{ padding: '24px 32px' }}>
              <h3 style={{ fontSize: 32, fontWeight: 400, color: '#000', margin: '0 0 32px 0', textAlign: 'center' }}>
                Ingrese el intervalo de horario deseado
              </h3>

              <div style={{ display: 'flex', gap: 48 }}>
                <div style={{ flex: 1, border: '1px solid #94a3b8', borderRadius: 6 }}>
                  <div style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #94a3b8', fontSize: 16, color: '#1e293b' }}>
                    Días
                  </div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {DIAS.map((day) => (
                      <div
                        key={day}
                        onClick={() => toggleModalDay(day)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                      >
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
                          {modalSelectedDays.includes(day) && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
                    <span style={{ fontSize: 24, width: 70, color: '#000' }}>Inicio</span>
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
                        color: '#000',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
                    <span style={{ fontSize: 24, width: 70, color: '#000' }}>Fin</span>
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
                        color: '#000',
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
                  cursor: 'pointer',
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
