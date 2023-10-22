import {URL, customer, customer_api} from '../../../fixtures/urls.json'
import {username, password} from '../../../fixtures/login-info.json'
import { Login } from '../../../POM/home.pom'
import { loginCustomer } from '../../Pages/login'


describe('Login CustomerPanel', () => {
    it('Login Successfully', () => {
        cy.visit(`${URL}${customer}`)
        cy.wait(2000)

        let login = new Login()

        login.usernameInput()

        login.passwordInput()

        cy.get('[class="q-page q-layout-padding bg-white q-pt-lg"]').should('be.visible')
    });
});

describe('Logout CustomerPanel', () => {
    it('Logout Successfully', () => {
        cy.visit(`${URL}${customer}`)
        let Login = loginCustomer()

        cy.request({method: 'POST', url: `${Login.baseUrl.adminBaseURL()}/login`, body: Login.body}).as('login-user');

        cy.get('@login-user').then((res) => {
            let account = JSON.stringify(res.body)
            window.localStorage.setItem('ACCOUNT', account)
        })

        cy.reload()
        cy.wait(2000)
        cy.gclick('[href="/dashboard"]')
        cy.wait(500)
        cy.get('div').contains('خروج').click()
        cy.wait(500)
        cy.get('.full-height').should('be.visible')
    });
});