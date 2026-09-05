export class DateTime{
    constructor(day, daysToAdd){
        this.day = day
        this.daysToAdd = daysToAdd
    }

    liveDate(){
        const date = new Date();

        date.setDate(date.getDate() - this.day);
        // date.setDate(date.getDate() + daysToAdd);
        const now = date.toISOString().split('.')[0];
        const arr = now.split('T')
        const dateOnly = arr[0]
        return dateOnly;
    }
    // incrementDate(daysToAdd) {
    //     const date = new Date();
    //     date.setDate(date.getDate() + daysToAdd);
    //     const now = date.toISOString().split('.')[0];
    //     const arr = now.split('T');
    //     const dateOnly = arr[0];
    //     return dateOnly;
    //     }
}

export class ConfirmPreDock{
    constructor(rest){
        this.rest = rest
    }

    buttonConfirm(){
        cy.gclick('#confirm-document')
        cy.wait(500)
    }

    checkResponse(){
        cy.gclick('.snotify-centerCenter > .snotify-confirm > .snotifyToast__buttons > .success')
        cy.wait(this.rest).then(res => {
            expect(res.response.statusCode).to.eq(204)
        })
    }
}
















export class Pages{
    constructor(urlpage, path){
        this.UrlPage = urlpage
        this.path = path
    }

    mainPage(){

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
    }


    setSeller(){
        cy.get('.modal-body').within(() => {
            cy.get('div > .row > :nth-child(1) > .input-group').within(() => {
                cy.gtype('input', 1)
            })
        })
        cy.wait(500)
    }


    selectOnInput(){
        cy.get(this.inputName).within(() => {
            cy.get('.input-group').within(() => {
                cy.get('.form-control').click()
            })
        })
        cy.wait(1000)
    }


    btnSearchModal(){
        cy.get('.modal-body').within(() => {
            cy.get('.align-items-center').within(() => {
                cy.get('.btn-primary').click()
            })
        })
        cy.wait(1500)
    }

    setInventoryWithCheck


    setDate(){
        cy.gclick('.input-group > .flex-nowrap')
        cy.wait(200)

        cy.gclick('.card-footer > .btn-success')
        cy.gclick('.card-footer > .btn-secondary')
        cy.wait(200)
    }
}

export class AddProduct{

    constructor(barcode){
        this.barcode = barcode
    }

    setBarcode(){
        cy.get('.modal-body').within(() => {
            cy.get('div > .row > :nth-child(1) > .input-group').within(() => {
                cy.gtype('input', this.barcode)
            })
        })
        cy.wait(500)
    }

    typeNumberOfProduct(){
        cy.get('tbody > :nth-child(1) > :nth-child(6)').within(() => {
            cy.get('div').first().within(() => {
                cy.get('input').type('20')
            })
        })
        cy.wait(1000)

        cy.get('tbody > :nth-child(1) > :nth-child(8)').within(() => {
            cy.get('div').first().within(() => {
                cy.get('input').type('20')
            })
        })
        cy.wait(1000)

        // چک کردن select و پر کردنش در صورت خالی بودن
        cy.get('select').then(($select) => {
            const selectedValue = $select.val()
            
            if (!selectedValue || selectedValue === '') {
                // اولین option معتبر (غیر خالی) رو انتخاب کن
                cy.wrap($select).find('option').then(($options) => {
                    const validOption = [...$options].find(o => o.value !== '')
                    if (validOption) {
                        cy.wrap($select).select(validOption.value)
                    }
                })
            }
        })
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

export class SetInventory{
    constructor(inventoryName, value) {
        this.inventoryName = inventoryName
        this.value = value
    }

    setValueWithCheck(){

        cy.get(this.inventoryName).within(() => {
            cy.get('.ac-wrapper > .input-group > .ac-form-control > .ac-selected-items').then($el => {
                const hasValue = $el.text().trim() == '';
                if (hasValue) {
                    cy.gclick('.ac-wrapper > .input-group > .ac-form-control')
                    cy.gclick(this.value)
                }
            })
        })

    }
    
}