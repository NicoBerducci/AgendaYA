export function precargarHorarioDefecto(dia) {
    const diasLaborables = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    if (diasLaborables.includes(dia)) {
        return { inicio: '08:00', fin: '16:00' };
    }
    return null;
}

export function validarCoherenciaHoraria(horaInicio, horaFin) {
    const [hInicio, mInicio] = horaInicio.split(':').map(Number);
    const [hFin, mFin] = horaFin.split(':').map(Number);

    const minInicio = hInicio * 60 + mInicio;
    const minFin = hFin * 60 + mFin;

    return minFin > minInicio;
}
