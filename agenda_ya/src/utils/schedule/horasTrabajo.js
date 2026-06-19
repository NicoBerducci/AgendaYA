/**
 * US_002: Devuelve el horario por defecto para un nuevo día seleccionado
 */
export const getDefaultHours = () => {
  return { 
    startTime: '08:00', 
    endTime: '16:00' 
  };
};

/**
 * US_004: Valida que la hora de fin sea estrictamente posterior a la de inicio
 */
export const validateTimeRange = (startTime, endTime) => {
  // Al usar el formato HH:mm (ej. "09:00", "18:00"), JavaScript permite compararlos directamente como strings
  if (endTime <= startTime) {
    return { 
      isValid: false, 
      errorMessage: 'La hora de fin debe ser posterior a la hora de inicio' 
    };
  }
  return { isValid: true };
};

/**
 * US_005: Valida que exista al menos un día seleccionado antes de guardar
 */
export const validateSaveConfig = (selectedDays) => {
  if (!selectedDays || selectedDays.length === 0) {
    return { 
      isValid: false, 
      errorMessage: 'Por favor, seleccione al menos un día para poder guardar' 
    };
  }
  return { isValid: true };
};