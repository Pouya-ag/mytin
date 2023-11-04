import { URL_stage146, admin_stage, admin_stage_api, InvDocRef } from '../../../../fixtures/urls.json'
import { Login2 } from '../../../../POM/home.pom'
import { FormControl, ReferencePage, AddProduct } from '../../../../POM/references.pom';
import { DateTime } from '../../../../POM/gelobalMethod.pom';
import { depot } from '../../../../fixtures/Items.json';


describe('Reference dock create', () => {
    it('Reference dock create', () => {
        cy.intercept('POST', `${URL_stage146}:800/api/pub/account/login`).as('get-accessToken')
        cy.intercept('POST', `${URL_stage146}${admin_stage_api}/inventory-document-references/depot-to-fulfillment`).as('creatReference')
        cy.visit(`${URL_stage146}${admin_stage}`)
        cy.wait(2000)
        
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
            cy.log(JSON.stringify(body.manualDate))

            date = new DateTime(0)
            time = date.liveDate()

            cy.task("connectDB", `
            SELECT id_pk FROM Dispatch.seller_delivery_shift sds
            WHERE sds.end_date_time = '${time} 10:30:00'`)
            .then((response) => {
                    body["sellerDeliveryShiftId"] = response[0].id_pk
            })

            cy.get('@get-accessToken').its('response.body.accessToken').then(res => {
                cy.request({method: 'POST', url: `${URL_stage146}${admin_stage_api}${InvDocRef}/to-dock`,headers:{Authorization:`Bearer ${res}`}, body: body}).as('create-reference')
            })
        })

        cy.gcclick('div', ' عملیات انبار ')
        cy.wait(200)

        cy.gcclick('div', ' رفرنس ')
        cy.wait(200)

        let referencepage = new ReferencePage('/references', '/depot-to-fulfillment')
        referencepage.goToPage()
        referencepage.createPage()

        // add seller to form control
        let seller = new FormControl('[name="تامین کننده"]')
        seller.selectOnInput()
        seller.btnSearchModal()
        seller.setSeller()

        // set date to form control
        seller.setDate()

        // add depot's dock
        let dock = new FormControl('[name="انبار دپو"]')
        dock.selectOnInput()
        dock.btnSearchModal()

        // add date for reference to customer
        let addcustomerdate = new FormControl('[name="شیوه و زمان مراجعه به مشتری"]')
        addcustomerdate.selectOnInput()
        cy.gclick(':nth-child(2) > .me-auto')
        cy.get('.table').within(() => {
            cy.get('tbody > :nth-child(1) > :nth-child(3)').within(() => {
                cy.get('.text-center').within(() => {
                    cy.gclick('.btn-success')
                })
            })
        })

        // add new product 
        let addProduct = new FormControl('[name="کالا"]')
        let firstProduct = new AddProduct('[name="طبقه بندی کالای تامین کننده"]', ':nth-child(1)', '20', ':nth-child(1)')

        addProduct.selectOnInput()
        firstProduct.filterProduct()
        addProduct.btnSearchModal()

        // log product's name
        cy.log(firstProduct.logProduct())

        firstProduct.add()
        
        // type number of product
        firstProduct.typeNumberOfProduct()

        // add new product
        let secondProduct = new AddProduct('[name="طبقه بندی کالای تامین کننده"]', ':nth-child(4)', '20', ':nth-child(2)')

        addProduct.selectOnInput()
        secondProduct.filterProduct()
        addProduct.btnSearchModal()

        // log product's name
        cy.log(secondProduct.logProduct())

        secondProduct.add()

        // type number of product
        secondProduct.typeNumberOfProduct()

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