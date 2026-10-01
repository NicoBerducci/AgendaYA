// Módulo: M04 - Reserva Pública
// Casos de prueba: CP_011 (positivo) y CP_012 (negativo)
// Integrante: Gracia Ignacio

describe('CP_011_012 - Reserva pública (Bloqueo temporal y acceso desde Desktop)', () => {
  beforeEach(() => {
    // Arrange: ir a la pestaña del módulo
    cy.visit('/');
    cy.get('[data-cy="tab-CP_011_012"]', { timeout: 10000 }).click();
  });

  it('CP_011 - bloquea el horario elegido por 10 minutos, muestra el contador y lo oculta para otros usuarios', () => {
    // Arrange: parado en el sub-tab CP_011 (bloqueo temporal)
    cy.get('[data-cy="subtab-CP_011"]').click();

    // Arrange: tomar el primer horario disponible del Dispositivo A
    cy.get('[data-cy="device-panel-device-a"]')
      .find('button[data-cy^="slot-"]')
      .not('[disabled]')
      .first()
      .invoke('text')
      .then((selectedTime) => {
        // Act: seleccionar ese horario
        cy.get('[data-cy="device-panel-device-a"]')
          .find(`[data-cy="slot-${selectedTime}"]`)
          .click();

        // Act: confirmar la preselección con "Continuar"
        cy.get('[data-cy="device-panel-device-a"]')
          .find('[data-cy="btn-continuar"]')
          .click();

        // Assert: aparece el contador regresivo de 10 minutos en el Dispositivo A
        cy.get('[data-cy="device-panel-device-a"]')
          .find('[data-cy="contador-tiempo"]')
          .should('be.visible')
          .and('contain', '10:00');

        // Assert: el mismo horario deja de estar disponible para el Dispositivo B
        // (se persiste en el backend simulado, no es solo un cambio visual local)
        cy.get('[data-cy="device-panel-device-b"]')
          .find(`[data-cy="slot-${selectedTime}"]`, { timeout: 2000 })
          .should('be.disabled');
      });
  });

  it('CP_012 - bloquea el acceso al flujo público desde un dispositivo Desktop', () => {
    // Arrange: parado en el sub-tab CP_012 (acceso desde Desktop)
    cy.get('[data-cy="subtab-CP_012"]').click();

    // Assert: por defecto el User-Agent simulado es "Desktop" y se muestra la pantalla de bloqueo
    cy.get('[data-cy="btn-user-agent-desktop"]').click();
    cy.get('[data-cy="pantalla-bloqueo-desktop"]').should('be.visible');

    // Assert: el mensaje de bloqueo es el definido para la restricción
    cy.get('[data-cy="mensaje-bloqueo-desktop"]')
      .should('contain', 'únicamente desde dispositivos móviles');

    // Act: achicar la ventana para simular una resolución de celular
    cy.get('[data-cy="checkbox-ventana-angosta"]').check();

    // Assert: la pantalla de bloqueo se mantiene, porque el criterio es el
    // User-Agent y no el ancho de pantalla (punto 4 del CP_012)
    cy.get('[data-cy="pantalla-bloqueo-desktop"]').should('be.visible');
  });
});