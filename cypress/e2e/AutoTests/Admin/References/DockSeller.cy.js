import { URL, admin_api, admin } from '../../../../fixtures/urls.json';
import { Login2 } from '../../../../POM/home.pom';
import { FormControl, Pages, AddProduct } from '../../../../POM/gelobalMethod.pom';


describe('Create refernce Dock to Seller', () => {
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

        let referencepage = new Pages('/references', '/dock-to-seller')
        referencepage.mainPage()
        referencepage.createPage()
        
        // add seller to form control
        let seller = new FormControl('[name="تامین کننده"]')
        seller.selectOnInput()
        seller.setSeller()
        seller.btnSearchModal()

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
        let formControl = new FormControl('[name="کالا"]')

        cy.fixture("Products").then(data => {
            
            let barcodes = [data[163]["barcode"], data[112]["barcode"]]

            for(let i = 0; i < barcodes.length; i++){

                let addProduct = new AddProduct(barcodes[i])
                
                formControl.selectOnInput()

                addProduct.setBarcode()

                formControl.btnSearchModal()

                cy.gclick('#submitButton')

                cy.get(`tbody > :nth-child(${i+1}) > :nth-child(5)`).within(() => {
                    cy.get('div').first().within(() => {
                        cy.get('input').type('20')
                    })
                })
                cy.wait(1000)
            }
        })
        cy.wait(1500)

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