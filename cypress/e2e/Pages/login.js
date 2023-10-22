import {username, password} from '../../fixtures/login-info.json'
import {BaseURL} from '../Pages/urls.js'


export let loginCustomer = () => {
    const body = {
        "panelType": "CUSTOMER",
        "clientType": "WEB",
        "uniqueId": 979807369,
        "username": username,
        "password": password,
        "firebaseToken": null
    }
    
    let baseUrl = new BaseURL('/pub','/account')

    return {"baseUrl": baseUrl, "body": body}
    
    // cy.request({method: 'POST', url: `${baseUrl.adminBaseURL()}/login`, body: body}).as('login-user');
}

export let loginAdmin = () => {
    const body = {
        "username": "+989362348839",
        "password": "123456",
        "uniqueId": 3218944151,
        "clientType": "WEB",
        "panelType": "ADMIN"
    }

    let baseUrl = new BaseURL('/pub', '/account')

    return {"baseUrl" : baseUrl, "body" : body}
}