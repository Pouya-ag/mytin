import { URL, admin_api, admin, URL_stage146, admin_stage, admin_stage_api, InvDocRef } from '../../../../fixtures/urls.json'
import { Login2 } from '../../../../POM/home.pom'
import { DateTime, ConfirmPreDock } from '../../../../POM/gelobalMethod.pom';
import { ReferencePage } from '../../../../POM/references.pom';
import { depot } from '../../../../fixtures/Items.json'
import { SetDateTime, FormControl } from '../../../../POM/preDocuments.pom';



describe('pre document for decline dock to fulfillment', () => {
    it('create new pre document in decline dock to fulfillment', () => {
        cy.visit(`${URL}${admin}`)
        cy.wait(2000)
        
        cy.intercept('POST', `${URL}:7000/api/pub/account/login`).as('get-accessToken')
        cy.intercept('POST', `${URL}${admin_api}/inventory-document/decline-dock-to-fulfillment`).as('get-dockId')
        
        let login = new Login2()
        login.usernameInput()
        login.passwordInput()
        login.LoginBtn()        
        cy.wait(3000)

        cy.get('.sidebar').should('be.visible')

        // go to pre document's page
        cy.gcclick('div', ' عملیات انبار ')
        cy.wait(200)

        cy.gcclick('div', ' پیش اسناد ')
        cy.wait(200)

        // go to create new document page
        let referencepage = new ReferencePage('/pre-documents', '/decline-dock-to-fulfillment')
        referencepage.goToPage()
        referencepage.createPage()

        // form control
        let date = new SetDateTime('[name="تاریخ مؤثر"]')
        date.setDate()

        cy.gclick('[name="تامین کننده"]')
        cy.wait(200)
        cy.gclick('.btn-primary')
        cy.gclick(':nth-child(2) > [aria-colindex="6"] > :nth-child(1) > .text-center > .btn')

        cy.gtype('[name="تحویل گیرنده"]', 'جعفر جعفری')
        cy.wait(200)

        cy.gtype('[name="تحویل دهنده"]', 'موزع نامی نو')
        cy.wait(200)


        cy.fixture("Items").then((file) => {
            cy.gtype('#barcode',file.depot[0].barcode)
            cy.gclick('#submitButton')
            cy.wait(1000)

            cy.gtype('#barcode',file.depot[1].barcode)
            cy.gclick('#submitButton')
            cy.wait(1000)
        })

        cy.get(`tbody > :nth-child(1) > :nth-child(6)`).within(() => {
            cy.get('div').first().within(() => {
                cy.get('input').clear().type('20')
            })
        })
        cy.wait(500)
        cy.get(`tbody > :nth-child(2) > :nth-child(6)`).within(() => {
            cy.get('div').first().within(() => {
                cy.get('input').clear().type('20')
            })
        })
        cy.wait(500)



        // save document
        cy.gclick('#footer-submit-button')
        cy.wait(3000)

        let product = [{"name":"الویه  ژامبون 200 گرمی"},{"name":"الویه مرغ  200 گرمی"}]

        // query to check products on database
        cy.get('@get-dockId').its('response.body.id').then((res) => {
            cy.task("connectDB", `
                SELECT name FROM Dispatch.product pro
                JOIN Dispatch.product_article pa
                ON pa.product_id_fk = pro.id_pk
                JOIN Dispatch.inventory_document_item idi
                ON idi.product_article_id_fk = pa.id_pk
                WHERE idi.inventory_document_id_fk = ${res};`)
            .then((response) => {
                expect(product.length).to.eq(response.length)

                // sort array of object order by name
                function sortArray(arr){
                    return arr.slice().sort((a, b) => a.name.localeCompare(b.name));
                }

                let newproduct = sortArray(product)
                let newresponse = sortArray(response)

                for (let i = 0 ; i < product.length ; i++){
                    expect(newproduct[i].name).to.eq(newresponse[i].name)
                }
            })
            cy.intercept('POST', `${URL}${admin_api}/inventory-document/decline-dock-to-fulfillment/${res}/confirm`).as('confirm-dock')
            let confirm = new ConfirmPreDock('@confirm-dock')
            confirm.buttonConfirm()
            confirm.checkResponse()
        })
    });
})