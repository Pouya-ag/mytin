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

    btnSearchProduct(){
        cy.get('.input-group-append > .d-inline-block > button[class="btn btn-secondary rounded-right-0"]').click()
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
}

export class SetDateTime{
    constructor(dateName){
        this.dateName = dateName
    }

    setDate(){
        cy.gclick(this.dateName)
        cy.wait(200)

        cy.gclick('.card-footer > .btn-success')
        cy.gclick('.card-footer > .btn-secondary')
        cy.wait(200)
    }
}

export class AddProduct{
    constructor(filter, child, numOfProduct){
        this.filter = filter
        this.child = child
        this.numOfProduct = numOfProduct
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
        cy.get(`tbody > :nth-child(1) > :nth-child(6)`).within(() => {
            cy.get('div').first().within(() => {
                cy.get('input').clear().type('20')
            })
        })
        cy.wait(500)
    }
}