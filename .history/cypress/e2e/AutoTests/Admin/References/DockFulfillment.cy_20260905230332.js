import { URL, admin_api, admin } from '../../../../fixtures/urls.json';
import { Login2 } from '../../../../POM/home.pom';
import { FormControl, Pages, AddProduct } from '../../../../POM/gelobalMethod.pom';


describe('Create refernce Dock to Fulfillment', () => {
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

        let referencepage = new Pages('/references', '/to-dock')
        referencepage.mainPage()
        referencepage.createPage()

        // add seller to form control
        let seller = new FormControl('[name="تامین کننده"]')
        seller.selectOnInput()
        seller.setSeller()
        seller.btnSearchModal()

        // set date to form control
        seller.setDate()

    cy.gclick('.ac-form-control')
        cy.gclick('.ac-dropdown-items > :nth-child(1)')
        
        // check switch toggle
        cy.gclick(':nth-child(2) > :nth-child(1) > .form-control > .d-inline-block > .switch-slider')
        cy.wait(200)

        // add date for reference to customer
        let addcustomerdate = new FormControl('[name="شیوه و زمان مراجعه به مشتری"]')
        addcustomerdate.selectOnInput()
        cy.get('[name="تاریخ مراجعه "]').within(() => {
            cy.get(':nth-child(2)').eq(1).click()
        })
        cy.gclick('.card-footer > .btn-success')
        cy.gclick('.card-footer > .btn-secondary')
        cy.wait(2000)

        cy.get('[name="تاریخ مراجعه "]').within(() => {
            cy.get(':nth-child(5)').click()
        })
        cy.get('[class="dialog-days d-flex flex-wrap w-100 mb-2"]').within(() => {
            cy.get('.day-box').last().within(() => {
                cy.get('.num').invoke('text').as('lastDay')

            })
        })

        cy.get('.chosen-day').within(() => {
            cy.get('.num').invoke('text').as('chosendDay')
        })

        cy.get('@lastDay').then((lastDay) => {
            cy.get('@chosendDay').then((chosenDay) =>{
                if (lastDay == chosenDay) {
                    cy.get('.nextMonth').click() 
                    cy.get('[class="dialog-days d-flex flex-wrap w-100 mb-2"]').find('[class="day-box"]').first().click()
                }
                else {cy.get('.chosen-day').next().click()}
            })
        })
        cy.wait(200)

        cy.gclick('.btn-primary')

        cy.get('.table').within(() => {
            cy.get('tbody > :nth-child(1) > :nth-child(3)').within(() => {
                cy.get('.text-center').within(() => {
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

                addProduct.typeNumberOfProduct()
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