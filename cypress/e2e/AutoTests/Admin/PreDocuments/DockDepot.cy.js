import { URL, admin_api, admin, URL_stage146, admin_stage, admin_stage_api, InvDocRef } from '../../../../fixtures/urls.json'
import { Login2 } from '../../../../POM/home.pom'
import { DateTime, ConfirmPreDock } from '../../../../POM/gelobalMethod.pom';
import { ReferencePage } from '../../../../POM/references.pom';
import { depot } from '../../../../fixtures/Items.json';
import { SetDateTime, FormControl } from '../../../../POM/preDocuments.pom';



describe('pre-document dock to depot', () => {
    it('call api to create new reference "dock to depot" then pre-document dock to depot', () => {
        cy.visit(`${URL}${admin}`)
        cy.wait(2000)
        
        cy.intercept('POST', `${URL}:7000/api/pub/account/login`).as('get-accessToken')
        cy.intercept('POST', `${URL}${admin_api}/inventory-document/dock-to-depot`).as('get-dockId')
        
        let login = new Login2()
        login.usernameInput()
        login.passwordInput()
        login.LoginBtn()        
        cy.wait(3000)

        cy.get('.sidebar').should('be.visible')

        cy.fixture("CreateDock").then((data) => {
            let date = new DateTime(1)
            let time = date.liveDate()

            let body = data;
            body["manualDate"] = `${time}T20:30:00`
            body["depotInventory"] = true
            body["depotInventoryGroupId"] = 1
            body["items"] = depot

            date = new DateTime(0)
            time = date.liveDate()
            cy.task("connectDB", `
            SELECT id_pk FROM Dispatch.seller_delivery_shift sds
            WHERE sds.end_date_time = '${time} 10:30:00'`)
            .then((response) => {
                    body["sellerDeliveryShiftId"] = response[0].id_pk
            })

            cy.get('@get-accessToken').its('response.body.accessToken').then(res => {
                cy.request({method: 'POST', url: `${URL}${admin_api}${InvDocRef}/to-dock`,headers:{Authorization:`Bearer ${res}`}, body: body}).as('create-reference')
            })
        })
        // create pre-document to dock
        cy.fixture("PreDock").then( data => {
            let date = new DateTime(1)
            let time = date.liveDate()

            let body = data.Dock;
            body["manualDate"] = `${time}T20:30:00`
            body["refDate"] = `${time}T20:30:00`
            cy.get('@create-reference').then(res => {
                body["inventoryDocumentReferenceId"] = res.body.id
            })
            
            cy.get('@get-accessToken').its('response.body.accessToken').then(res => {
                cy.request({method: 'POST', url: `${URL}${admin_api}/inventory-document/to-dock`, headers:{Authorization:`Bearer ${res}`}, body: body}).as('create-preDock')
            })
            cy.wait(500)
            cy.get('@get-accessToken').its('response.body.accessToken').then(token => {
                cy.get('@create-preDock').then(data => {
                    cy.request({method: 'POST', url: `${URL}${admin_api}/inventory-document/to-dock/${data.body.id}/confirm`, headers:{Authorization:`Bearer ${token}`}}).as('confirm-predock')
                })
            })
        })
    
        // go to pre document's page
        cy.gcclick('div', ' عملیات انبار ')
        cy.wait(200)

        cy.gcclick('div', ' پیش اسناد ')
        cy.wait(200)     

        // go to create new document page
        let referencepage = new ReferencePage('/pre-documents', '/dock-to-depot')
        referencepage.goToPage()
        referencepage.createPage()

        // form control
        let date = new SetDateTime('[name="تاریخ مؤثر"]')
        date.setDate()

        cy.gclick('[name="تامین کننده"]')
        cy.wait(200)
        let formControl = new FormControl('[name="شناسه رفرنس انبار"]')
        formControl.btnSearchModal()
        formControl.setSeller()

        // cy.get('[name="انبار مبدا"]').within(() => {
        //     cy.gclick('.ac-wrapper > .input-group > .ac-form-control > .ac-actions')
        // })
        // cy.wait(200)
        // cy.gclick('#item-text-1')
        // cy.wait(200)

        // cy.get('[name="انبار مقصد"]').within(() => {
        //     cy.gclick('.ac-wrapper > .input-group > .ac-form-control > .ac-actions')
        // })
        // cy.wait(200)
        // cy.gclick('#item-text-1')
        cy.wait(200)

        cy.gtype('[name="تحویل گیرنده"]', 'جعفر جعفری')
        cy.wait(200)

        cy.gtype('[name="تحویل دهنده"]', 'موزع نامی نو')
        cy.wait(200)

        formControl.selectOnInput()

        // query on database to get dockToFulfillment reference id
        cy.get('@create-reference').then((res) => {
            cy.task("connectDB", `
                SELECT id_pk FROM Dispatch.inventory_document_reference idr
                WHERE idr.reference_id_fk = ${res.body.id};`)
            .then((response) => {
                // set id to reference search
                cy.gtype('.modal-body > div > .row > :nth-child(1) > .input-group > .form-control', response[0].id_pk)
            })
        })
  
        // formControl.btnSearchModal()
        cy.gclick('.btn-primary')

        cy.gcclick('button', ' درج کالاهای رفرنس ')
        cy.wait(1000)

        let products = cy.get('.table-bordered > tbody > tr')
        cy.get('@create-reference').then((res) => { 
            products.should('have.length', res.body.items.length)
        })
        cy.wait(200)

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
            cy.intercept('POST', `${URL}${admin_api}/inventory-document/dock-to-depot/${res}/confirm`).as('confirm-dock')
            let confirm = new ConfirmPreDock('@confirm-dock')
            confirm.buttonConfirm()
            confirm.checkResponse()
        })
    });
})