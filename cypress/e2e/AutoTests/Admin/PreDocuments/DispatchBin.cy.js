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
        cy.intercept('POST', `${URL}${admin_api}/inventory-document/dispatch-to-bin`).as('get-dockId')
        
        let login = new Login2()
        login.usernameInput()
        login.passwordInput()
        login.LoginBtn()        
        cy.wait(3000)

        cy.get('.sidebar').should('be.visible')


        // reference Dock and Dock to Fulfillment *REST*
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

        // pre-document Dock *REST*
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

        // pre-document Dock to Fulfillment *REST*
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

        // trip-request *REST* 
        let date = new DateTime(1)
        let time = date.liveDate()
        // let customerID = 15241;
        // let sellerCustomerID = 40414;
        let customerID = 32063;
        let sellerCustomerID = 59605;
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
            // maybe it has a bug because this query add here without test, have to check it
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

        // tour *REST*
        cy.fixture("CreateTour").then(data => {
            cy.get('@get-accessToken').its('response.body.accessToken').then(token => {

                cy.task("connectDB", `
                    select id_pk from Dispatch.driver driver
                    where driver.active = true
                    and driver.distributor = true
                    and driver.courier = true
                    limit 10;
                `).then(driver => {
                    data.driverId = driver[9].id_pk
                    data.courierId = driver[9].id_pk
                })
                cy.task("connectDB", `
                    select id_pk from Dispatch.vehicle vehicle
                    where vehicle.active = true
                    and vehicle.vehicle_type_id_fk = 2
                    limit 5;
                `).then(vehicle => {
                    data.vehicleId = vehicle[4].id_pk
                })

                cy.get('@create-triprequest').then(triprequest => {
                    
                    data.tripsIn[0].tripId = triprequest.body.tripId

                    cy.request({method: 'POST', url: `${URL}${admin_api}/tours`, headers: {Authorization: `Bearer ${token}`}, body: data}).as('tour')
                })
            })
        })

        // shipack for trip-request *REST*
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

        // pre-document Fulfillment to Dispatch *REST*
        cy.fixture("FulfillmentDispatch").then( data => {
            cy.get('@get-accessToken').its('response.body.accessToken').then(res => {
                cy.get('@shipack').then(shipack => {
                    let date = new DateTime(1)
                    let time = date.liveDate()

                    data.shippingPackageId = shipack.body.id
                    data.manualDate = `${time}T20:30:00`

                    cy.request({method: 'POST', url:`${URL}${admin_api}/inventory-document/fulfillment-to-dispatch`, headers: {Authorization:`Bearer ${res}`}, body: data}).as('create-fulfillmentDispatch')
                })
            })
            cy.wait(500)
            cy.get('@get-accessToken').its('response.body.accessToken').then(token => {
                cy.get('@create-fulfillmentDispatch').then(data => {
                    cy.request({method: 'POST', url: `${URL}${admin_api}/inventory-document/fulfillment-to-dispatch/${data.body.id}/confirm`, headers:{Authorization:`Bearer ${token}`}}).as('confirm-fulfillmentDispatch')
                })
            })
        })

        // test Dispatch to Bin
        cy.gcclick('div', ' عملیات انبار ')
        cy.wait(200)

        cy.gcclick('div', ' پیش اسناد ')
        cy.wait(200)

        // go to create new document page
        let referencepage = new ReferencePage('/pre-documents', '/dispatch-to-bin')
        referencepage.goToPage()
        referencepage.createPage()

        date = new SetDateTime('[name="تاریخ مؤثر"]')
        date.setDate()

        cy.get('[name="انبار مبدا"]').within(() => {
            cy.get('.ac-wrapper > input').then($el => {
                const hasValue = $el.attr('value') == undefined;
                if (hasValue) {
                    cy.gclick($el)
                    cy.gclick('[title="انبار توزیع شهر ری"]')
                }
            })
        })

        let formControl = new FormControl('[name="موزع"]')
        formControl.selectOnInput()
        cy.get('@tour').then(tour => {
            cy.get('.modal-body').within(() => {
                cy.get('.row').within(() => {
                    cy.get('.input-group').first().within(() => {
                        cy.gtype('.form-control', tour.body.driverId)
                    })
                    
                })
            })
        })
        formControl.btnSearchModal()

        cy.wait(500)
        cy.gcclick('button', 'درج شناسه شیپک')

        cy.gtype('[name="تحویل گیرنده"]', 'جعفر جعفری')
        cy.wait(200)

        cy.gtype('[name="تحویل دهنده"]', 'موزع نامی نو')
        cy.wait(200)

        // save document
        cy.gclick('#footer-submit-button')
        cy.wait(3000)

        cy.get('body').then($body => {
            if ($body.find('[class="modal fade show"]')) {
                cy.get('[class="modal fade show"]').within( el => {
                    cy.get('.modal-dialog > .modal-content > .modal-footer').within(button => {
                        cy.gcclick('button', ' تایید با قبول مسئولیت ')
                    })
                })
            }
        })
        cy.wait(3000)

        let product = [{"name":"الویه  ژامبون 200 گرمی"},{"name":"الویه مرغ  200 گرمی"}]

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
            cy.intercept('POST', `${URL}${admin_api}/inventory-document/dispatch-to-bin/${res}/confirm`).as('confirm-dock')
            let confirm = new ConfirmPreDock('@confirm-dock')
            confirm.buttonConfirm()
            confirm.checkResponse()
        })
    })
})