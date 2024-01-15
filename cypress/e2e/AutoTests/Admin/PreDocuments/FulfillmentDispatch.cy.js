import { URL, admin_api, admin, URL_stage146, admin_stage, admin_stage_api, InvDocRef } from '../../../../fixtures/urls.json'
import { Login2 } from '../../../../POM/home.pom'
import { DateTime, ConfirmPreDock } from '../../../../POM/gelobalMethod.pom';
import { ReferencePage } from '../../../../POM/references.pom';
import { depot, dock, fulfillment } from '../../../../fixtures/Items.json';
import { SetDateTime, FormControl, AddProduct } from '../../../../POM/preDocuments.pom';



describe('pre-document fulfillment to dispatch', () => {
    it('call api to create new reference "dock to fulfillment", pre-ducument "to dock", "dock to fulfillment" then pre-document fulfillment to dispatch', () => {
        cy.visit(`${URL}${admin}`)
        cy.wait(2000)
        
        cy.intercept('POST', `${URL}:7000/api/pub/account/login`).as('get-accessToken')
        cy.intercept('POST', `${URL}${admin_api}/inventory-document/fulfillment-to-dispatch`).as('get-dockId')
        
        let login = new Login2()
        login.usernameInput()
        login.passwordInput()
        login.LoginBtn()        
        cy.wait(3000)

        cy.get('.sidebar').should('be.visible')

        // create *rest* reference dock to fulfillment
        cy.fixture("CreateDock").then((data) => {
            let date = new DateTime(1)
            let time = date.liveDate()

            let body = data;
            body["manualDate"] = `${time}T20:30:00`
            body["fulfillmentInventory"] = true
            body["fulfillmentInventoryGroupId"] = 1
            body["items"] = fulfillment

            date = new DateTime(0)
            time = date.liveDate()
            cy.task("connectDB", `
            SELECT id_pk FROM Dispatch.seller_delivery_shift sds
            WHERE sds.end_date_time = '${time} 10:30:00'`)
            .then((response) => {
                    body["sellerDeliveryShiftId"] = response[0].id_pk
            })

            cy.get('@get-accessToken').its('response.body.accessToken').then(res => {
                cy.request({method: 'POST', url: `${URL}${admin_api}${InvDocRef}/to-dock`,headers:{Authorization:`Bearer ${res}`}, body: body}).as('create-reference')
            })
        })

        // create *rest* pre-document to dock
        cy.fixture("PreDock").then( data => {
            let date = new DateTime(1)
            let time = date.liveDate()

            let body = data.Dock;
            body["manualDate"] = `${time}T20:30:00`
            body["refDate"] = `${time}T20:30:00`
            cy.get('@create-reference').then(res => {
                body["inventoryDocumentReferenceId"] = res.body.id
            })
            
            cy.get('@get-accessToken').its('response.body.accessToken').then(res => {
                cy.request({method: 'POST', url: `${URL}${admin_api}/inventory-document/to-dock`, headers:{Authorization:`Bearer ${res}`}, body: body}).as('create-preDock')
            })
            cy.wait(500)
            cy.get('@get-accessToken').its('response.body.accessToken').then(token => {
                cy.get('@create-preDock').then(data => {
                    cy.request({method: 'POST', url: `${URL}${admin_api}/inventory-document/to-dock/${data.body.id}/confirm`, headers:{Authorization:`Bearer ${token}`}}).as('confirm-predock')
                })
            })
        })

        // create *rest* pre-document dock to fulfillment
        cy.fixture("PreDock").then( data => {
            let date = new DateTime(1)
            let time = date.liveDate()

            let body = data.DockFulfillment;
            body["manualDate"] = `${time}T20:30:00`
            cy.get('@create-reference').then(res => {
                body["inventoryDocumentReferenceId"] = res.body.id + 1
            })
            
            cy.get('@get-accessToken').its('response.body.accessToken').then(res => {
                cy.request({method: 'POST', url: `${URL}${admin_api}/inventory-document/dock-to-fulfillment`, headers:{Authorization:`Bearer ${res}`}, body: body}).as('create-preDockfulfillment')
            })
            cy.wait(500)
            cy.get('@get-accessToken').its('response.body.accessToken').then(token => {
                cy.get('@create-preDockfulfillment').then(data => {
                    cy.request({method: 'POST', url: `${URL}${admin_api}/inventory-document/dock-to-fulfillment/${data.body.id}/confirm`, headers:{Authorization:`Bearer ${token}`}}).as('confirm-preDockfulfillment')
                })
            })
        })

        // create *rest* trip request 
        let date = new DateTime(1)
        let time = date.liveDate()
        // let customerID = 15241;
        // let sellerCustomerID = 40414;
        let customerID = 14449;
        let sellerCustomerID = 1315;

        cy.task("connectDB", `
        SELECT tr.id_pk FROM Dispatch.trip_request tr
        JOIN Dispatch.seller_delivery_shift sds
        ON tr.seller_delivery_shift_id_fk = sds.id_pk
        WHERE tr.customer_id_fk = ${customerID}
        AND sds.delivery_date = '${time} 20:30:00'
        AND tr.canceled IS NULL;`)
        .then((response) => {
                if (response.length != 0) {
                    cy.get('@get-accessToken').its('response.body.accessToken').then(res => {
                        cy.request({method: 'PUT', url:`${URL}${admin_api}/trip-requests/cancel/${response[0].id_pk}`, headers:{Authorization:`Bearer ${res}`}})
                    })   
                }})
        cy.fixture("TripRequest").then(data => {
            cy.task("connectDB", `
                SELECT sds.id_pk FROM Dispatch.seller_delivery_shift sds
                WHERE sds.delivery_date = '${time} 20:30:00';
            `).then( res => {
                data.sellerDeliveryShiftId = res[0].id_pk
                data.sellerCustomerId = sellerCustomerID
            })

            cy.get('@get-accessToken').its('response.body.accessToken').then(res => {
                cy.request({method: 'POST', url:`${URL}${admin_api}/trip-requests`, headers: {Authorization:`Bearer ${res}`}, body: data}).as('create-triprequest')
            })
        })

        // create *rest* shipping dock
        cy.fixture("Shipack").then( data => {
            cy.get('@get-accessToken').its('response.body.accessToken').then(res => {
                cy.get('@create-triprequest').then(triprequest => {

                    data.deliveryRequestId = triprequest.body.parcelRequest.items[0].deliveryRequestInfo.id
                    data.shippingPackageItemIns[0].deliveryRequestItemId = triprequest.body.parcelRequest.items[0].id
                    data.shippingPackageItemIns[1].deliveryRequestItemId = triprequest.body.parcelRequest.items[1].id

                    cy.request({method: 'POST', url:`${URL}${admin_api}/shipping-packages`, headers: {Authorization:`Bearer ${res}`}, body: data}).as('shipack')
                })
            })
        })
        


        
        // go to pre document's page
        cy.gcclick('div', ' عملیات انبار ')
        cy.wait(200)

        cy.gcclick('div', ' پیش اسناد ')
        cy.wait(200)

        // go to create new document page
        let referencepage = new ReferencePage('/pre-documents', '/fulfillment-to-dispatch')
        referencepage.goToPage()
        referencepage.createPage()

        // form control
        date = new SetDateTime('[name="تاریخ مؤثر"]')
        date.setDate()


        let formControl = new FormControl('[name="شیپک"]')
        formControl.selectOnInput()
        cy.get('@shipack').then(shipack => {
            cy.get('.modal-body').within(() => {
                cy.get('.row').first().within(() => {
                    cy.get('.input-group').first().within(() => {
                        cy.gtype('.form-control', shipack.body.id)
                    })
                    
                })
            })
        })
        formControl.btnSearchModal()

        let product = [{"name":"الویه  ژامبون 200 گرمی"},{"name":"الویه مرغ  200 گرمی"}]

        cy.wait(200)

        // save document
        cy.gclick('#footer-submit-button')
        cy.wait(3000)

        // query to check products on database
        cy.get('@get-dockId').its('response.body.id').then((res) => {
            cy.task("connectDB", `
                SELECT name FROM Dispatch.product pro
                JOIN Dispatch.product_article pa
                ON pa.product_id_fk = pro.id_pk
                JOIN Dispatch.inventory_document_item idi
                ON idi.product_article_id_fk = pa.id_pk
                WHERE idi.inventory_document_id_fk = ${res};`)
            .then((response) => {
                expect(product.length).to.eq(response.length)

                // sort array of object order by name
                function sortArray(arr){
                    return arr.slice().sort((a, b) => a.name.localeCompare(b.name));
                }

                let newproduct = sortArray(product)
                let newresponse = sortArray(response)

                for (let i = 0 ; i < product.length ; i++){
                    expect(newproduct[i].name).to.eq(newresponse[i].name)
                }
            })

            cy.intercept('POST', `${URL}${admin_api}/inventory-document/fulfillment-to-dispatch/${res}/confirm`).as('confirm-dock')
            let confirm = new ConfirmPreDock('@confirm-dock')
            confirm.buttonConfirm()
            // confirm.checkResponse()
            cy.gclick('.snotify-centerCenter > .snotify-confirm > .snotifyToast__buttons > .success')
            cy.get('@confirm-dock').its('response.statusCode').then(resp => {
                expect(resp).to.eq(204)
            })
        }) 
    });
});