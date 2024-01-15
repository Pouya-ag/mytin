export class ReferencePage{
    constructor(urlpage, path){
        this.UrlPage = urlpage
        this.path = path
    }

    goToPage(){

        cy.gclick(`[href="${this.UrlPage}${this.path}"]`)
        cy.wait(2000)

    }

    createPage(){

        cy.gclick(`[href="${this.UrlPage}${this.path}/create"]`)
        cy.wait(2000)

    }
}

export class FormControl{
    constructor(inputName){
        this.inputName = inputName
        this.seller = ':nth-child(2) > [aria-colindex="6"] > :nth-child(1) > .text-center > .btn'
    }

    selectOnInput(){
        cy.get(this.inputName).within(() => {
            cy.get('.input-group').within(() => {
                cy.get('.form-control').click()
            })
        })
        cy.wait(500)
    }

    btnSearchModal(){
        cy.get('.modal-body').within(() => {
            cy.get('.align-items-center').within(() => {
                cy.get('.btn-primary').click()
            })
        })
        cy.wait(500)
    }

    setSeller(){
        cy.gclick(this.seller)
        cy.wait(200)
    }

    setDate(){
        cy.gclick('.input-group > .flex-nowrap')
        cy.wait(200)

        cy.gclick('.card-footer > .btn-success')
        cy.gclick('.card-footer > .btn-secondary')
        cy.wait(200)
    }
}

export class AddProduct{
    constructor(filter, child, numOfProduct, productchild){
        this.filter = filter
        this.child = child
        this.numOfProduct = numOfProduct
        this.productchild = productchild
    }

    filterProduct(){
        cy.get(this.filter).within(() => {
            cy.get('.ac-wrapper').within(() => {
                cy.get('.input-group').within(() => {
                    cy.get('.ac-form-control').click()
                })
            })
        })
        cy.wait(500)
        cy.gclick('[title="انواع الویه"]')
    }

    logProduct(){
        let Item;
        cy.get(`${this.child} > [aria-colindex="3"] > div > [value="[object Object]"] > span`).then(text => {
            Item = text.text()
            return Item
        })
    }

    add(){
        cy.gclick(`${this.child} > [aria-colindex="7"] > :nth-child(1) > .text-center > .btn`)
        cy.gclick('#submitButton')
        cy.wait(200)
    }

    typeNumberOfProduct(){
        cy.get(`tbody > ${this.productchild} > :nth-child(5)`).within(() => {
            cy.get('div').first().within(() => {
                cy.get('input').type('20')
            })
        })
        cy.wait(500)
    }
}