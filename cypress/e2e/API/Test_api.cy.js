import {username, password} from '../../fixtures/login-info.json'
import {BaseURL} from '../Pages/urls.js'
import {login} from '../Pages/login'
import * as createTripRequest from '../../fixtures/trip-request-info.json'
import * as profileAccount from '../../fixtures/profileAccount.json'


describe('Account public', () => {
    it('check user', () => {

        const body = {
            "username": username
        }
        
        let baseUrl = new BaseURL('/pub','/account')

        cy.request({method: 'POST',url: `${baseUrl.adminBaseURL()}/check-user`, body: body}).as('check-user');

        cy.get('@check-user').then((res) => {
            expect(res.body.username).to.equal(username)
            expect(res.body.hasAccount).to.be.true
            expect(res.body.hasPassword).to.be.true
            expect(res.body.mobile).to.be.true
        })
    });

    it('login user', () => {
        
        const body = {
            "panelType": "CUSTOMER",
            "clientType": "WEB",
            "uniqueId": 979807369,
            "username": username,
            "password": password,
            "firebaseToken": null
        }
        
        let baseUrl = new BaseURL('/pub','/account')
        
        cy.request({method: 'POST', url: `${baseUrl.adminBaseURL()}/login`, body: body}).as('login-user');

        cy.get('@login-user').then((res) => {
            cy.get('@login-user').its('status').should('equal', 200)
            expect(res.body.account.mobile).to.equal(username)
            expect(res.body.account.mobile).to.exist
            expect(res.body.account.id).to.exist
            expect(res.body.accessToken).to.exist
            expect(res.body.refreshToken).to.exist
        })


    });
})


describe('Account idn', () => {
    let accessToken = ''
    beforeEach(() => {
        let Login = login()
        
        cy.request({method: 'POST', url: `${Login.baseUrl.adminBaseURL()}/login`, body: Login.body}).as('login-user');

        cy.get('@login-user').then((res) => {
            accessToken = res.body.accessToken
        })
    })
    it('test logout', () => {

        let baseUrl = new BaseURL('/idn','/account')

        const Authorization = `Bearer ${ accessToken }`;
        cy.request({method: 'POST', url: `${baseUrl.adminBaseURL()}/logout`, headers: { Authorization }})
    });

    it('test profile GET', () => {
        
        let baseUrl = new BaseURL('/idn', '/account')

        const Authorization = `Bearer ${ accessToken }`
        cy.request({method: 'GET', url: `${baseUrl.adminBaseURL()}/profile`, headers: { Authorization }}).as('profile')

        cy.get('@profile').then((res) => {
            cy.get('@profile').its('status').should('equal', 200)
            expect(res.body.user).to.exist
            expect(res.body.user.mobile, res.body.user.firstName, res.body.user.lastName, res.body.user.nationalId, res.body.user.fullName).to.exist
            expect(res.body.user.mobile).to.equal(username)
            // expect(` ${res.body.user.firstName} ${res.body.user.lastName} `).to.equal(res.body.user.fullName)
        })
    });
    // it('test profile PUT', () => {
      
    //     let baseUrl = new BaseURL('/idn', '/account')

    //     const Authorization = `Bearer ${ accessToken }`
    //     cy.request({method: 'PUT', url: `${baseUrl.adminBaseURL()}/profile`, headers: { Authorization }, body: profileAccount}).as('profile')

    //     cy.get('@profile').then((res) => {
    //         cy.get('@profile').its('status').should('equal', 200)

    //     })
          
    // });
    it('heve password', () => {

        let baseUrl = new BaseURL('/idn', '/account')

        const Authorization = `Bearer ${ accessToken }`
        cy.request({method: 'GET', url: `${baseUrl.adminBaseURL()}/profile/have-pass`, headers: { Authorization }}).as('password')

        cy.get('@password').then((res) => {
            cy.get('@password').its('status').should('equal', 200)
            expect(res.body.havePassword).to.equal(true)
        })
    });
})

describe('get difference between two lists of sellers from customerPanel and adminPanel', () => {

    let accessToken = ''
    beforeEach(() => {
        let Login = login()
        
        cy.request({method: 'POST', url: `${Login.baseUrl.adminBaseURL()}/login`, body: Login.body}).as('login-user');

        cy.get('@login-user').then((res) => {
            accessToken = res.body.accessToken
        })
    })

    
    let ListSellerCustomer = []
    let ListSellerAdmin  = []
    it('GET sellers from customer panel', () => {
        
        let baseUrl = new BaseURL('/customer', '/sellers')

        const Authorization = `Bearer ${ accessToken }`
        cy.request({method: 'GET', url: `${baseUrl.customerBaseURL()}`, headers: { Authorization }}).as('sellers')

        cy.get('@sellers').then((res) => {
            let response = res.body

            for(let i = 0 ; i < response.length ; i++){
                ListSellerCustomer.push(response[i].sellerName)
            }
        })
    });
    it('GET sellers from admin panel', () => {
        
        let baseUrl = new BaseURL('/admin', '/customers')

        const Authorization = `Bearer ${ accessToken }`
        cy.request({method: 'GET', url: `${baseUrl.adminBaseURL()}/15241/seller-customers`, qs: {"include": "seller"}, headers: { Authorization }}).as('sellers')

        cy.get('@sellers').then((res) => {
            let response = res.body.sellerCustomers
            
            for(let i = 0; i < response.length; i++){
                ListSellerAdmin.push(response[i].seller.name)
            }
        })
    });
    it('get difference between two lists of sellers from customerPanel and adminPanel', () => {
        let difference = ListSellerCustomer
            .filter(x => !ListSellerAdmin.includes(x))
                .concat(ListSellerAdmin.filter(x => !ListSellerCustomer.includes(x)));

        expect(difference).to.deep.equal([])
    });
})

describe('trip request', () => {
    let accessToken = ''
    beforeEach(() => {
        let Login = login()
        
        cy.request({method: 'POST', url: `${Login.baseUrl.adminBaseURL()}/login`, body: Login.body}).as('login-user');

        cy.get('@login-user').then((res) => {
            accessToken = res.body.accessToken
        })
    })
    it('GET trip request', () => {
        
        let baseUrl = new BaseURL('/customer', '/trip-requests')

        const Authorization = `Bearer ${ accessToken }`
        
        cy.request({method: 'GET', url: `${baseUrl.customerBaseURL()}`, headers: { Authorization }}).as('trip-requests')

        cy.get('@trip-requests').then((res) => {
            cy.log(res.body[0])
        })
    });
    it('POST trip request', () => {
        let baseUrl = new BaseURL('/customer', '/trip-requests')

        const Authorization = `Bearer ${ accessToken }`

        cy.request({method: 'POST', url: `${baseUrl.customerBaseURL()}`, headers: { Authorization }, body: createTripRequest}).as('trip-request')

        cy.get('@trip-request').then((res) => {
            cy.get(res).its('status').should('equal', 200)
            expect(res.body.id).to.exist
        })
    });
})