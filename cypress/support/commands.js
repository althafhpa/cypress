// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

const compareSnapshotCommand = require('cypress-image-diff-js/command');
compareSnapshotCommand();

// Define the loginToOkta command
Cypress.Commands.add('loginToOkta', (username, password, answer, okta_domain) => {
    Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress
        // inside the cy.origin() method from failing the test
        return false
    })

    // Get to a page that redirects to Okta.
    cy.visit( '/' , {
        failOnStatusCode: false
    });

    // Login with Okta without origin.
    cy.get('input[name="identifier"]').type(username);
    cy.get('[type="submit"]').click({timeout: 20000}); // Adjust the selector as per Okta login page
    cy.get('input[name="credentials.passcode"]').type(password);
    cy.get('[type="submit"]').click({timeout: 20000}); // Adjust the selector as per Okta login page
    cy.get('input[name="credentials.answer"]').type(answer);
    cy.get('[type="submit"]').click({timeout: 20000});

    // Wait for redirection back to Optimizely.
    cy.url().should('not.include', okta_domain).then(url => {
        cy.log('Current URL after redirection:', url);
        cy.document().its('readyState').should('eq', 'complete');
    });

    // In some cases if above doesn't work comment above and uncomment below.
    // Login with Okta with origin.
    // cy.origin(okta_domain, {args: {username, password, answer}}, ({username, password, answer}) => {
    //     cy.get('input[name="identifier"]').type(username);
    //     cy.get('[type="submit"]').click({timeout: 20000}); // Adjust the selector as per Okta login page
    //     cy.get('input[name="credentials.passcode"]').type(password);
    //     cy.get('[type="submit"]').click({timeout: 20000}); // Adjust the selector as per Okta login page
    //     cy.get('input[name="credentials.answer"]').type(answer);
    //     cy.get('[type="submit"]').click({timeout: 20000});
    //
    //     // Wait for redirection back to Optimizely.
    //     cy.url().should('not.include', 'okta.com').then(url => {
    //         cy.log('Current URL after redirection:', url);
    //     });
    // });

});

// Define the oktaLogin command.
Cypress.Commands.add('oktaLogin', (username, password, answer, okta_domain) => {
    const log = Cypress.log({
        displayName: 'OKTA LOGIN',
        message: [`🔐 Authenticating | ${username}`],
        autoEnd: false,
    });

    log.snapshot('before');

    cy.session(
        `okta-${username}`,
        () => {
            cy.loginToOkta(username, password, answer, okta_domain);
        },
        {
            validate: () => {
                // Validate presence of access token in Cookie.
                // Docs: https://docs.cypress.io/api/commands/getcookie#Session-id
            },
            // Docs: https://docs.cypress.io/api/commands/session#Caching-session-data-across-specs
            cacheAcrossSpecs: true,
        }
    );

    log.snapshot('after');
    log.end();
});
