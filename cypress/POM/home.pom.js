export class Login{
    constructor(){
        this.UsernameINPUT = '[name="شماره موبایل"]'
        this.PasswordINPUT = '[name="رمز عبور"]'
        this.ContinueBTN = '.q-btn__content'
        this.LoginBTN = '.q-btn--standard > .q-btn__content'
    }

    usernameInput(){
        cy.fixture("login-info").then((data) => {
            cy.gtype(this.UsernameINPUT, data.username)
        })
        cy.gclick(this.ContinueBTN)
    }

    passwordInput(){
        cy.fixture("login-info").then((data) => {
            cy.gtype(this.PasswordINPUT, data.password)
        })
        cy.gclick(this.LoginBTN)
    }
}

export class Login2{
    constructor(){
        this.UsernameINPUT = '[name="شماره همراه"]'
        this.PasswordINPUT = '[name="رمز عبور"]'
        this.LoginBTN = '.btn-primary'
    }

    usernameInput(){
        cy.fixture("login-info").then((data) => {
            cy.gtype(this.UsernameINPUT, data.username)
        })
    }
    passwordInput(){
        cy.fixture("login-info").then((data) => {
            cy.gtype(this.PasswordINPUT, data.password)
        })
    }
    LoginBtn(){
        cy.gclick(this.LoginBTN)
    }
}