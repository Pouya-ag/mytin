import { URL, admin_api, admin, URL_stage146, admin_stage, admin_stage_api } from '../../../../fixtures/urls.json'
import { Login2 } from '../../../../POM/home.pom'
import { ReferencePage, FormControl, AddProduct } from '../../../../POM/references.pom';
import { depot, dock, fulfillment } from '../../../../fixtures/Items.json';
import { SetDateTime } from '../../../../POM/preDocuments.pom';

        
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

        cy.gcclick('div', ' پیش اسناد ')
        cy.wait(200)

        let referencepage = new ReferencePage('/pre-documents', '/fulfillment-return')
        referencepage.goToPage()
        referencepage.createPage()

        // form control
        let date = new SetDateTime('[name="تاریخ مؤثر"]')
        date.setDate()

        // set seller
        cy.gclick('[name="تامین کننده"]')
        cy.wait(200)
        cy.get('.modal-body').within(() => {
            cy.get('.row > .mb-3').first().within(() => {
                cy.gtype('.input-group > input', '2')
            })
            cy.gclick('.btn-primary')
        })
        cy.wait(1000)

        cy.get('[name="انبار مبدا"]').within(() => {
            cy.get('.ac-wrapper > .input-group > .ac-form-control').then($el => {
                const hasValue = $el.attr('value') == undefined;
                if (hasValue) {
                    cy.gclick($el)
                    cy.gclick('[title="انبار پردازش شهر ری"]')
                }
            })
        })
        cy.wait(50000000)



        for (let i = 0; i < fulfillment.length; i++) {
            cy.gtype('#barcode', fulfillment[i].barcode)
            cy.gclick('#submitButton')
            cy.get('table > tbody > tr > td > .input-group > input').clear().type(20)
        }
        
        cy.wait(50000000)
        })
})
