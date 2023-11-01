import { URL_stage146, admin_stage, admin_stage_api, InvDocRef } from '../../../../fixtures/urls.json'
import { Login2 } from '../../../../POM/home.pom'
import { DateTime } from '../../../../POM/gelobalMethod.pom';
import { ReferencePage } from '../../../../POM/references.pom';
import { depot } from '../../../../fixtures/Items.json'
import { SetDateTime, FormControl } from '../../../../POM/preDocuments.pom';



describe('pre document for dock', () => {
    it('api request for create new reference and then create new pre document for dock', () => {
        cy.visit(`${URL_stage146}${admin_stage}`)
        cy.wait(2000)
        
        cy.intercept('POST', `${URL_stage146}:800/api/pub/account/login`).as('get-accessToken')
        cy.intercept('POST', `${URL_stage146}${admin_stage_api}/inventory-document/to-dock`).as('get-dockId')
        
        let login = new Login2()
        login.usernameInput()
        login.passwordInput()
        login.LoginBtn()        
        cy.wait(3000)

        cy.get('.sidebar').should('be.visible')

        cy.fixture("CreateDock").then((data) => {
            let date = new DateTime()
            let time = date.liveDate()

            let body = data;
            body["manualDate"] = `${time.year}-${time.month}-${31}T20:30:00`
            body["depotInventory"] = true
            body["depotInventoryGroupId"] = 1
            body["items"] = depot

            cy.get('@get-accessToken').its('response.body.accessToken').then(res => {
                cy.request({method: 'POST', url: `${URL_stage146}${admin_stage_api}${InvDocRef}/to-dock`,headers:{Authorization:`Bearer ${res}`}, body: body}).as('create-reference')
            })
        })

        // go to pre document's page
        cy.gcclick('div', ' عملیات انبار ')
        cy.wait(200)

        cy.gcclick('div', ' پیش اسناد ')
        cy.wait(200)

        // go to create new document page
        let referencepage = new ReferencePage('/pre-documents', '/to-dock')
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

        cy.gtype('[name="تحویل گیرنده"]', 'جعفر جعفری')
        cy.wait(200)

        cy.gtype('[name="تحویل دهنده"]', 'موزع نامی نو')
        cy.wait(200)
        
        cy.get('[name="دلیل تحویل"]').within(() => {
            cy.gclick('.ac-wrapper > .input-group > .ac-form-control > .ac-actions')
        })
        cy.wait(200)
        
        cy.gclick('#item-text-0')
        cy.wait(200)

        cy.gtype('[name="شماره فاکتور طرف"]', '123456789')
        cy.wait(200)

        let invoiceDate = new SetDateTime('[name="تاریخ فاکتور طرف"]')
        invoiceDate.setDate()

        // reference dock
        formControl.selectOnInput()

        // type id to search reference
        cy.get('@create-reference').then((res) => { 
            cy.gtype('.modal-body > div > .row > :nth-child(1) > .input-group > .form-control', res.body.id)
        })
        formControl.btnSearchModal() 

        cy.gcclick('button', ' درج کالاهای رفرنس ')
        cy.wait(1000)

        // check number of products
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
        })
    });
})