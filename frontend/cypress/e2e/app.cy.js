describe('App Flow', () => {
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'password123';

    it('registers new user and redirects to dashboard', () => {
        cy.visit('/register');
        cy.get('input[type="email"]').type(testEmail);
        cy.get('input[type="password"]').type(testPassword);
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 10000 }).should('include', '/dashboard');
    });

    it('prevents duplicate registration', () => {
        cy.visit('/register');
        cy.get('input[type="email"]').type(testEmail);
        cy.get('input[type="password"]').type(testPassword);
        cy.get('button[type="submit"]').click();
        cy.on('window:alert', (text) => {
            expect(text).to.contains('failed');
        });
    });

    it('logs in existing user', () => {
        cy.visit('/login');
        cy.get('input[type="email"]').type(testEmail);
        cy.get('input[type="password"]').type(testPassword);
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 10000 }).should('include', '/dashboard');
    });

    it('creates board, adds card, and verifies both', () => {
        cy.visit('/login');
        cy.get('input[type="email"]').type(testEmail);
        cy.get('input[type="password"]').type(testPassword);
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 10000 }).should('include', '/dashboard');
        
        cy.get('input[placeholder*="brewing"]').type('Test Board');
        cy.contains('Create Board').click();
        cy.contains('Test Board', { timeout: 5000 }).should('be.visible');
        cy.contains('Test Board').click();
        
        cy.window().then((win) => {
            cy.stub(win, 'prompt').returns('Test Card');
        });
        cy.contains('add.card()').first().click();
        cy.contains('Test Card', { timeout: 5000 }).should('be.visible');
    });
})