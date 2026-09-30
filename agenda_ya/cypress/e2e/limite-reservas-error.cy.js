describe('AgendaYA - Gestión de Disponibilidad - Límite Diario Error', () => {
  beforeEach(() => {
    // La página principal de tu frontend
    cy.visit('/')
    
    // Hacemos clic en la pestaña que carga el componente de Límite de Reservas
    cy.get('[data-cy="tab-CP_009_010"]').click()
  })

  it('CP_010: Configuración de límite diario con valores no permitidos (Negativo)', () => {
    // Arrange: preparar el estado inicial
    cy.get('[data-cy="daily-limit-input"]').clear()

    // Act: ejecutar la acción principal ingresando un valor no permitido (0)
    cy.get('[data-cy="daily-limit-input"]').type('0')
    cy.wait(1500) // Pausa para captura del input
    cy.screenshot('CP_010-ingreso-invalido')
    
    cy.get('[data-cy="save-daily-limit-button"]').click()
    cy.wait(1500) // Pausa para captura del modal

    // Assert: verificar el resultado esperado
    cy.get('[data-cy="error-message"]')
      .should('be.visible')
      .and('contain', 'El límite debe ser un número entero mayor a 0')
      
    cy.screenshot('CP_010-resultado-error')
  })
})
