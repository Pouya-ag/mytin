import { URL, admin_api, admin, URL_stage146, admin_stage, admin_stage_api, InvDocRef } from '../../../../fixtures/urls.json'
import { Login2 } from '../../../../POM/home.pom'
import { DateTime, ConfirmPreDock } from '../../../../POM/gelobalMethod.pom';
import { ReferencePage } from '../../../../POM/references.pom';
import { depot, dock, fulfillment } from '../../../../fixtures/Items.json';
import { SetDateTime, FormControl, AddProduct } from '../../../../POM/preDocuments.pom';
import { Triprequest, BinToDockDocument, DocumentProducts } from '../../../../POM/database.pom';



describe('pre-document fulfillment to dispatch', () => {
    it('call api to create new reference "dock to fulfillment", pre-ducument "to dock", "dock to fulfillment" then pre-document fulfillment to dispatch', () => {
        cy.visit(`${URL}${admin}`)
        cy.wait(2000)
        
        cy.intercept('POST', `${URL}:7071/api/pub/account/login`).as('get-accessToken')
        cy.intercept('POST', `${URL}${admin_api}/inventory-document/bin-to-dock`).as('get-dockId')
        
        let login = new Login2()
        login.usernameInput()
        login.passwordInput()
        login.LoginBtn()        
        cy.wait(3000)

        cy.get('.sidebar').should('be.visible')


        // test Bin to Dock
        cy.gcclick('div', ' عملیات انبار ')
        cy.wait(200)

        cy.gcclick('div', ' پیش اسناد ')
        cy.wait(200)

        // go to create new document page
        let referencepage = new ReferencePage('/pre-documents', '/bin-to-dock')
        referencepage.goToPage()
        referencepage.createPage()

        let date = new SetDateTime('[name="تاریخ مؤثر"]')
        date.setDate()
        cy.wait(1000)


        // should save tour ID for test without request rest
        cy.gclick('[name="تور"]')
        cy.wait(200)

            cy.get('.modal-body').within(() => {
                cy.get('.row > .mb-3').first().within(() => {
                    cy.gtype('.input-group > input', 61002)
                })
                cy.gclick('.btn-primary')
            })

        cy.wait(1000)


        cy.get('[name="انبارک مبدا"]').select('انبارک')
        cy.wait(1000)

        cy.get('[name="انبار مقصد"]').find('.ac-form-control').click()
        cy.gcclick('.badge-secondary',' 164 ')
        cy.wait(500)

        // here i have to add products with add rest of products button or manually
        cy.gcclick('button', ' درج کالاهای بازگشتی تور ')
        cy.wait(5000)


        // save document
        cy.gclick('#footer-submit-button')
        cy.wait(5000)

        let product = [{"name":"الویه  ژامبون 200 گرمی"},{"name":"الویه مرغ  200 گرمی"}]

        // query to check products on database


            let binToDock = new BinToDockDocument(61002)
            
            binToDock.getIdInventoryDocumentBinDock().then(res => {

                cy.visit(`${URL}${admin}/documents/bin-to-dock/show/${res[0].id_pk}`)
                cy.wait(3000)


                let documentProducts = new DocumentProducts(res[0].id_pk)

                documentProducts.getProductFromDocument().then((response) => {
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
                cy.intercept('POST', `${URL}${admin_api}/inventory-document/bin-to-dock/${res[0].id_pk}/confirm`).as('confirm-dock')
                let confirm = new ConfirmPreDock('@confirm-dock')
                confirm.buttonConfirm()
                confirm.checkResponse()
            })

    })
})