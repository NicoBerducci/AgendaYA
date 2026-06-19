/**
 * US_021: Valida que la antelación esté entre 0 y 72 horas. Si es nulo, devuelve 0.
 */
export const validarAntelacion = (horas, nombreEvento) => {
  if (horas === null || horas === undefined || horas === "") {
    return { isValid: true, valor: 0 };
  }

  if (horas < 0 || horas > 72) {
    return {
      isValid: false,
      errorMessage: `El valor de antelación para el evento ${nombreEvento} debe estar entre 0 y 72 horas`,
    };
  }

  return { isValid: true, valor: horas };
};

/**
 * US_022: Calcula si la diferencia entre la hora actual y el turno, para ver si respeta la antelación
 */
export const esHorarioVisible = (horaActual, horaTurno, antelacionHoras) => {
  // Obtenemos la diferencia en milisegundos y la convertimos a horas
  const diferenciaMilisegundos = horaTurno.getTime() - horaActual.getTime();
  const diferenciaHoras = diferenciaMilisegundos / (1000 * 60 * 60);

  return diferenciaHoras >= antelacionHoras;
};

/**
 * US_023: Valida que el límite diario sea un entero mayor a 0, o lo marca sin límite si está vacío
 */
export const validarLimiteDiario = (limite) => {
  if (limite === null || limite === undefined || limite === "") {
    return { isValid: true, sinLimite: true };
  }

  // Comprueba que no sea 0 o negativo, y que sea un número entero
  if (isNaN(limite) || limite <= 0 || !Number.isInteger(Number(limite))) {
    return {
      isValid: false,
      errorMessage: "El límite debe ser un número entero mayor a 0",
    };
  }

  return { isValid: true, sinLimite: false, valor: Number(limite) };
};
