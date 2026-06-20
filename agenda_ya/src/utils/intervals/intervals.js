/**
 * US_006: Valida si es posible agregar un intervalo en base a si el día es laboral
 */
export const validarAgregarIntervalo = (diaEsLaboral) => {
    if (!diaEsLaboral) {
        return {
            isValid: false,
            errorMessage: "Primero debe seleccionar el día como laboral"
        };
    }
    return { isValid: true };
};

/**
 * US_007: Valida si hay superposición de horarios entre el nuevo intervalo y los existentes
 */
export const validarSuperposicion = (intervalosExistentes, nuevoIntervalo, dia) => {
    if (!intervalosExistentes || intervalosExistentes.length === 0) {
        return { isValid: true };
    }

    const { startTime: newStart, endTime: newEnd } = nuevoIntervalo;

    const overlap = intervalosExistentes.some(({ startTime: currStart, endTime: currEnd }) => {
        // Dos intervalos [A, B] y [C, D] se superponen si A < D y C < B
        return newStart < currEnd && currStart < newEnd;
    });

    if (overlap) {
        return {
            isValid: false,
            errorMessage: `Hay superposición de horarios en el día ${dia}`
        };
    }

    return { isValid: true };
};

/**
 * US_008: Guarda los intervalos de un día específico en un nuevo objeto de configuración sin mutar el original
 */
export const guardarIntervalosDia = (config, dia, nuevosIntervalos) => {
    return {
        ...config,
        [dia]: nuevosIntervalos
    };
};

/**
 * US_009: Deshabilita temporalmente un intervalo
 */
export const deshabilitarIntervalo = (intervalo) => {
    return {
        ...intervalo,
        enabled: false
    };
};

/**
 * US_010: Habilitar un intervalo
 */
export const habilitarIntervalo = (intervalo) => {
    return {
        ...intervalo,
        enabled: true
    };
};

/**
 * US_009 / US_010: Obtiene solo los intervalos que están habilitados para la agenda pública
 */
export const obtenerIntervalosActivos = (intervalos) => {
    if (!intervalos) return [];
    return intervalos.filter(intervalo => intervalo.enabled !== false);
};
