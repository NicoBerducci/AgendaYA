import { toggleIntervalStatus, deleteInterval, resetScheduleState, getIntervals } from './scheduleService';

describe('US_021 / US_022 - Gestión de habilitación y eliminación de intervalos (Bomprezzi Paula)', () => {
  beforeEach(() => {
    resetScheduleState(); 
  });

  it('Debe deshabilitar exitosamente un intervalo activo si no es el último del día (Caso Normal)', async () => {
    // Miércoles tiene 2 intervalos activos, deshabilitamos el ID 3
    const result = await toggleIntervalStatus(3, false);
    
    expect(result.isValid).toBe(true);
    expect(result.successMessage).toContain('deshabilitó el intervalo del turno Turno 1 del día Miércoles exitosamente');
    
    const intervals = await getIntervals();
    const interval = intervals.find((i) => i.id === 3);
    expect(interval?.enabled).toBe(false);
  });

  it('Debe habilitar exitosamente un intervalo inactivo (Caso Normal)', async () => {
    // Martes tiene el ID 2 inactivo por defecto
    const result = await toggleIntervalStatus(2, true);
    
    expect(result.isValid).toBe(true);
    expect(result.successMessage).toContain('habilitó el intervalo del turno Turno 1 del día Martes exitosamente');
    
    const intervals = await getIntervals();
    const interval = intervals.find((i) => i.id === 2);
    expect(interval?.enabled).toBe(true);
  });

  it('Debe devolver error si se intenta deshabilitar el único intervalo activo del día (Caso Borde)', async () => {
    // Lunes solo tiene el ID 1 activo
    const result = await toggleIntervalStatus(1, false);
    
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('No se puede deshabilitar el único intervalo activo del día');
    
    const intervals = await getIntervals();
    const interval = intervals.find((i) => i.id === 1);
    expect(interval?.enabled).toBe(true); // Debe seguir habilitado
  });

  it('Debe devolver error si el intervalo a modificar no existe (Caso Error)', async () => {
    const result = await toggleIntervalStatus(999, false);
    
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('Intervalo no encontrado');
  });

  it('Debe devolver error exacto si se intenta eliminar un intervalo con reservas activas (Caso Error)', async () => {
    // El ID 1 (Lunes) tiene 3 reservas activas en el mock
    const result = await deleteInterval(1, true);
    
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('No se puede eliminar el intervalo porque tiene 3 reservas activas');
  });
});
