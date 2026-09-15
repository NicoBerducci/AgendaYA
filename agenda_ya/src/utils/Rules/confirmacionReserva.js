/**
 * AgendaYA - Módulo 4: Confirmación de Reserva
 * Asignee: Tomás Yanardi
 * US: US_033, US_034, US_035
 */

/**
 * US_033: Valida el formato del correo electrónico mediante una expresión regular básica
 */
export const validarEmail = (email) => {
  if (!email) {
    return { 
      isValid: false, 
      errorMessage: 'Ingrese un email válido para continuar' 
    };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { 
      isValid: false, 
      errorMessage: 'Ingrese un email válido para continuar' 
    };
  }
  return { isValid: true };
};

/**
 * US_033: Valida que el nombre no esté vacío y tenga más de 1 carácter
 */
export const validarNombre = (nombre) => {
  if (!nombre || nombre.trim().length < 2) {
    return { 
      isValid: false, 
      errorMessage: 'Ingrese un nombre válido para continuar' 
    };
  }
  return { isValid: true };
};

/**
 * US_033: Valida formato de teléfono (al menos 6 dígitos numéricos)
 */
export const validarTelefono = (telefono) => {
  if (!telefono || telefono.trim().replace(/[\s-]/g, '').length < 6) {
    return {
      isValid: false,
      errorMessage: 'Ingrese un teléfono válido para continuar'
    };
  }
  return { isValid: true };
};

/**
 * US_035: Compara la hora de inicio (bloqueo) con la hora actual (confirmación)
 * para asegurar que no pasen más de 10 minutos
 */
export const validarExpiracion = (horaBloqueo, horaConfirmacion) => {
  const limiteMinutos = 10;
  
  const diferenciaMilisegundos = horaConfirmacion.getTime() - horaBloqueo.getTime();
  const diferenciaMinutos = diferenciaMilisegundos / (1000 * 60);
  
  if (diferenciaMinutos > limiteMinutos) {
    return { 
      isValid: false, 
      errorMessage: 'El tiempo para confirmar la reserva expiró' 
    };
  }
  
  return { isValid: true };
};
