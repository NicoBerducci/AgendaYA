// Módulo: RestPeriodConfig
// Caso de prueba: CP_007, CP_008
// Integrante: Espínola Facundo

describe('US_019 - Configurar descanso entre reservas', () => {
  it('CP_007 - Permite ingresar 15 minutos, guarda exitosamente', () => {
    // Arrange
    cy.visit('/');
    cy.get('[data-cy="tab-CP_007_008"]').click();
    cy.get('[data-cy="btn-abrir-descanso"]').click();
    cy.get('[data-cy="modal-descanso"]').should('be.visible');

    // Act
    cy.get('[data-cy="input-minutos-descanso"]').clear().type('15');
    cy.get('[data-cy="btn-guardar-descanso"]').click();

    // Assert
    cy.get('[data-cy="aviso-descanso"]').should('contain.text', 'El intervalo entre turnos fue configurado exitosamente');
  });

  it('CP_008 - Rechaza 121 minutos con el mensaje de error exacto', () => {
    // Arrange
    cy.visit('/');
    cy.get('[data-cy="tab-CP_007_008"]').click();
    cy.get('[data-cy="btn-abrir-descanso"]').click();
    cy.get('[data-cy="modal-descanso"]').should('be.visible');

    // Act
    cy.get('[data-cy="input-minutos-descanso"]').clear().type('121');
    cy.get('[data-cy="btn-guardar-descanso"]').click();

    // Assert
    cy.get('[data-cy="aviso-descanso"]').should('contain.text', 'El intervalo debe estar entre 0 y 120 minutos');
  });
});
