import { URL, admin_api, admin, InvDocRef } from '../../../../fixtures/urls.json';
import { Login2 } from '../../../../POM/home.pom';
import { DateTime, FormControl, Pages, AddProduct } from '../../../../POM/gelobalMethod.pom';
import { depot } from '../../../../fixtures/Items.json';


describe('Create refernce Depot to Dock', () => {
    it('Reference dock create', () => {
        cy.intercept('POST', `${URL}:7071/api/pub/account/login`).as('get-accessToken')
        cy.intercept('POST', `${URL}${admin_api}/inventory-document-references/depot-to-dock`).as('creatReference')
        cy.visit(`${URL}${admin}`)
        cy.wait(2000)
        
        let login = new Login2()
        login.usernameInput()
        login.passwordInput()
        login.LoginBtn()
        cy.wait(3000)

        cy.get('.sidebar').should('be.visible')

        cy.fixture("CreateDock").then((data) => {
            let date = new DateTime(0)
            let time = date.liveDate()

            let body = data;
            body["manualDate"] = `${time}T20:29:00`
            body["depotInventory"] = true
            body["depotInventoryGroupId"] = 1
            body["items"] = depot

            date = new DateTime(0)
            time = date.liveDate()
            cy.task("connectDB", `
            SELECT id_pk FROM Dispatch.seller_delivery_shift sds
            WHERE sds.end_date_time = '${time} 9:30:00' AND sds.seller_id_fk = 1`)
            .then((response) => {
                    body["sellerDeliveryShiftId"] = response[0].id_pk
            })

            cy.get('@get-accessToken').its('response.body.accessToken').then(res => {
                cy.request({method: 'POST', url: `${URL}${admin_api}${InvDocRef}/to-dock`,headers:{Authorization:`Bearer ${res}`}, body: body}).as('create-reference')
            })
        })

        // go to reference page
        cy.gcclick('div', ' عملیات انبار ')
        cy.wait(200)

        cy.gcclick('div', ' رفرنس ')
        cy.wait(200)

        // go to create new document page
        let referencepage = new Pages('/references', '/depot-to-dock')
        referencepage.mainPage()
        referencepage.createPage()

        // add seller to form control
        let seller = new FormControl('[name="تامین کننده"]')
        seller.selectOnInput()
        seller.setSeller()
        seller.btnSearchModal()

        // set date to form control
        seller.setDate()

        // add dock to form control
        let depotForm = new FormControl('[name="انبار دپو"]')
        depotForm.selectOnInput()
        depotForm.btnSearchModal()
        depotForm.setInventoryWithCheck()

        // add new product 
        let formControl = new FormControl('[name="کالا"]')
        
        
        cy.fixture("Products").then(data => {
            
            let barcodes = [data[163]["barcode"], data[112]["barcode"]]

            for(let i = 0; i < barcodes.length; i++){

                let addProduct = new AddProduct(barcodes[i])
                
                formControl.selectOnInput()

                addProduct.setBarcode()

                formControl.btnSearchModal()

                cy.gclick('#submitButton')

                addProduct.typeNumberOfProduct()
            }
        })
        cy.wait(1500)

        // save and get all data from request and response

        cy.gclick('#footer-submit-button')
        
        cy.wait('@creatReference')

        cy.get('@creatReference').its('response.body').then(res => {
            cy.log(JSON.stringify(res.id))
            for(let i = 0 ; i < res.items.length ; i++){
                let itemsName = res.items[i].article.product.name
                cy.log(itemsName)
            }
        })
    });
});