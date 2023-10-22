import {URL, customer, customer_api} from '../../../fixtures/urls.json'
import { loginCustomer } from '../../Pages/login'


describe('create trip request', () => {
    beforeEach(() => {
        cy.visit(`${URL}${customer}`)
        let Login = loginCustomer()

        cy.request({method: 'POST', url: `${Login.baseUrl.adminBaseURL()}/login`, body: Login.body}).as('login-user');

        cy.get('@login-user').then((res) => {
            let account = JSON.stringify(res.body)
            window.localStorage.setItem('ACCOUNT', account)
        })
        cy.reload()
    })
    it('create a trip request', () => {
        cy.gclick('[href="/trip-requests/create/sellers"]')
        cy.wait(500)
        cy.get('[class="text-bold"]').contains('نامی نو').click()
        cy.wait(500)
        cy.get('div.header-container > .q-page > :nth-child(2)').within(() => {
            cy.get('.q-radio__inner').within(() => {
                cy.get('input[type="radio"]').should('be.checked')
            })
        })
        cy.gclick('[href="/trip-requests/create/sellers/2/delivery-requests#PARCEL"]')
        cy.wait(500)
        cy.get(':nth-child(1) > .flex-column').within(() => {
            cy.get('.flex.items-center > :nth-child(1)').within(() => {
                cy.gclick('.q-icon')
                for (let i = 0 ; i < 10 ; i++) {
                    cy.gclick('.flex > .q-field > .q-field__inner > .q-field__control > .q-field__prepend > .q-icon')
                }
            })
        })
        cy.get(':nth-child(3) > .flex-column > .flex.items-center > :nth-child(1)').within(() => {
            cy.gclick('.q-icon')
            for (let i = 0 ; i < 10 ; i++) {
                cy.gclick('.flex > .q-field > .q-field__inner > .q-field__control > .q-field__prepend > .q-icon')
            }
        })
        cy.intercept('POST', `${URL}${customer_api}/customer/trip-requests`).as('trip-request')
        cy.gclick('.q-pa-md > .q-btn > .q-btn__content')
        cy.gclick('.q-pa-sm')
        cy.wait('@trip-request')
            .then((res) => {
                let response = JSON.stringify(res)
                cy.log(response)
            })
        cy.get('.text-h5', { timeout: 10000 }).should('be.visible')
        cy.get('.text-h5').contains('سفارش شما با موفقیت ثبت شد!')
    });
})