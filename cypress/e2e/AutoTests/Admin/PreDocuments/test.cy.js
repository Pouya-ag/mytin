import { URL, admin_api, admin, URL_stage146, admin_stage, admin_stage_api } from '../../../../fixtures/urls.json'
import { Login2 } from '../../../../POM/home.pom'
import { ReferencePage, FormControl, AddProduct } from '../../../../POM/references.pom';
        
        
describe('Reference dock create', () => {
    it('Reference dock create', () => {
        cy.intercept('POST', `${URL}${admin_api}/inventory-document-references/to-dock`).as('creatReference')
        cy.visit(`${URL}${admin}`)
        cy.wait(2000)
        
        let login = new Login2()
        login.usernameInput()
        login.passwordInput()
        login.LoginBtn()
        cy.wait(3000)

        cy.get('.sidebar').should('be.visible')

        cy.gcclick('div', ' عملیات انبار ')
        cy.wait(200)

        cy.gcclick('div', ' رفرنس ')
        cy.wait(200)

        let referencepage = new ReferencePage('/references', '/to-dock')
        referencepage.goToPage()
        referencepage.createPage()

        // add seller to form control
        let seller = new FormControl('[name="تامین کننده"]')
        seller.selectOnInput()
        seller.btnSearchModal()
        seller.setSeller()

        // set date to form control
        seller.setDate()

        cy.get('[name="انبار بارانداز"]').within(() => {
            cy.get('.ac-wrapper > input').then($el => {
                const hasValue = $el.attr('value') !== undefined;
                cy.log(hasValue);
            })
            
        })
        
            cy.wait(50000000)
        })
})
