import { URL, admin, URL_stage146, admin_stage } from '../../../../fixtures/urls.json'
import { Login2 } from '../../../../POM/home.pom'
import { loginAdmin } from '../../../Pages/login'

describe('Login Admin panel', () => {
    it('Login Admin panel', () => {
        cy.visit(`${URL}${admin}`)
        cy.wait(2000)
        
        let login = new Login2()
        login.usernameInput()
        login.passwordInput()
        login.LoginBtn()
        cy.wait(3000)

        cy.get('.sidebar').should('be.visible')
    });
})

describe('Logout Admin panel', () => {
    it('Logout admin panel', () => {
      
        cy.visit(`${URL}${admin}`)
       
        let Login = loginAdmin()
        cy.request({method: 'POST', url: `${Login.baseUrl.adminBaseURL()}/login`, body: Login.body}).as('login-user');

        cy.get('@login-user').then((res) => {
            let account = JSON.stringify(res.body)
            window.localStorage.setItem('Dispatch-acc', `{"v":${account}}`)
        })
        cy.reload()
        cy.wait(20000)
   
        // cy.gclick('[href="/dashboard"]')
        // cy.wait(500)
        // cy.gclick('div.q-item')
        // cy.wait(500)
        // cy.get('.full-height').should('be.visible')
    });
})