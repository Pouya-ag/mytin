export class DateTime{
    constructor(day){
        this.day = day
    }

    liveDate(){
        const date = new Date();

        date.setDate(date.getDate() - this.day);
        const now = date.toISOString().split('.')[0];
        const arr = now.split('T')
        const dateOnly = arr[0]
        return dateOnly;
    }
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