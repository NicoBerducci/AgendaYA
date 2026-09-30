// Módulo: RestPeriodConfig
// Caso de prueba: CP_007 y CP_008
// Integrante: Espínola Facundo

describe('Configurar descansos entre reservas', () => {
  it('TEST 1 - CP_007 (positivo): Configuración exitosa', () => {
    // Arrange
    cy.visit('/');
    cy.get('[data-cy="tab-CP_007_008"]', { timeout: 10000 }).click();
    cy.get('[data-cy="btn-abrir-descanso"]').click();
    cy.get('[data-cy="modal-descanso"]').should('be.visible');

    // Act
    cy.get('[data-cy="input-minutos-descanso"]').clear().type('15');
    cy.get('[data-cy="btn-guardar-descanso"]').click();

    // Assert
    cy.get('[data-cy="aviso-descanso"]').should('contain', 'El intervalo entre turnos fue configurado exitosamente');
  });

  it('TEST 2 - CP_008 (error): Configuración fallida con valor mayor a 120', () => {
    // Arrange
    cy.visit('/');
    cy.get('[data-cy="tab-CP_007_008"]', { timeout: 10000 }).click();
    cy.get('[data-cy="btn-abrir-descanso"]').click();
    cy.get('[data-cy="modal-descanso"]').should('be.visible');

    // Act
    cy.get('[data-cy="input-minutos-descanso"]').clear().type('121');
    cy.get('[data-cy="btn-guardar-descanso"]').click();

    // Assert
    cy.get('[data-cy="aviso-descanso"]').should('contain', 'El intervalo debe estar entre 0 y 120 minutos');
  });
});
