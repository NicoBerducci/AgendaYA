export function validarLimiteDiario(limite) {
  const numero = Number(limite);
  return Number.isInteger(numero) && numero > 0;
}

export function actualizarEstadoPerfil(perfilId, nuevoLimite, simuladaDB = {}) {
  if (!simuladaDB[perfilId]) {
    simuladaDB[perfilId] = { id: perfilId, limiteReservas: null };
  }
  simuladaDB[perfilId].limiteReservas = nuevoLimite;
  return simuladaDB[perfilId];
}
