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

Cypress.Commands.add('gclick', (el) => { cy.get(el).click() })
Cypress.Commands.add('gtype', (el, value) => { cy.get(el).type(value) })
Cypress.Commands.add('gcclick', (el, content) => {cy.get(el).contains(content).click()})

Cypress.Commands.add('compareArrays', (firstArray, secondArray) => {
    if (firstArray.length != secondArray){
        throw new Error('Array have different lengths');
    }
    for (let i = 0 ; i < firstArray.length ; i++){
        const fItem = firstArray[i];
        const sItem = secondArray[i];

        if (JSON.stringify(fItem) !== JSON.stringify(sItem)){
            throw new Error('Array are not deeply equal')
        }
    }
})