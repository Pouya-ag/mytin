import { URL, admin_api, admin, URL_stage146, admin_stage, admin_stage_api } from '../../../../fixtures/urls.json'
import { Login2 } from '../../../../POM/home.pom'
import { FormControl, ReferencePage, AddProduct } from '../../../../POM/references.pom';


describe('Reference dock create', () => {
    it('Reference dock create', () => {
        cy.intercept('POST', `${URL}${admin_api}/inventory-document-references/dock-to-seller`).as('creatReference')
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

        let referencepage = new ReferencePage('/references', '/dock-to-seller')
        referencepage.goToPage()
        referencepage.createPage()
        
        // add seller to form control
        let seller = new FormControl('[name="تامین کننده"]')
        seller.selectOnInput()
        seller.btnSearchModal()
        seller.setSeller()

        // set date to form control
        seller.setDate()

        let dock = new FormControl('[name="انبار بارانداز"]')
        dock.selectOnInput()
        dock.btnSearchModal()
        cy.get('.table').within(() => {
            cy.get('tbody > :nth-child(3) > :nth-child(5)').within(() => {
                cy.get('div > .text-center').within(() => {
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
        cy.wait(5000)
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