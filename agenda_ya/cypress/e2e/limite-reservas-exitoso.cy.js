describe('AgendaYA - Gestión de Disponibilidad - Límite Diario Exitoso', () => {
  beforeEach(() => {
    // La página principal de tu frontend
    cy.visit('/')
    
    // Hacemos clic en la pestaña que carga el componente de Límite de Reservas
    cy.get('[data-cy="tab-CP_009_010"]').click()
  })

  it('CP_009: Configurar límite diario de reservas (Positivo)', () => {
    // Arrange: preparar el estado inicial (el campo debe estar visible y vacío o con valor previo)
    cy.get('[data-cy="daily-limit-input"]').clear()

    // Act: ejecutar la acción principal ingresando un valor permitido (10)
    cy.get('[data-cy="daily-limit-input"]').type('10')
    cy.wait(1500) // Pausa para captura del input
    cy.screenshot('CP_009-ingreso-datos')
    
    cy.get('[data-cy="save-daily-limit-button"]').click()
    cy.wait(1500) // Pausa para captura del modal

    // Assert: verificar el resultado esperado
    cy.get('[data-cy="success-message"]')
      .should('be.visible')
      .and('contain', 'El límite máximo de reservas fue configurado exitosamente')
      
    cy.screenshot('CP_009-resultado-exitoso')
  })
})
