import { URL, admin_api, admin, URL_stage146, admin_stage, admin_stage_api, InvDocRef } from '../../../../fixtures/urls.json'
import { Login2 } from '../../../../POM/home.pom'
import { DateTime, ConfirmPreDock } from '../../../../POM/gelobalMethod.pom';
import { ReferencePage } from '../../../../POM/references.pom';
import { depot, dock, fulfillment } from '../../../../fixtures/Items.json';
import { SetDateTime, FormControl, AddProduct } from '../../../../POM/preDocuments.pom';
import { Triprequest, BinToDockDocument, DocumentProducts } from '../../../../POM/database.pom';



describe('pre-document fulfillment to dispatch', () => {
    it('call api to create new reference "dock to fulfillment", pre-ducument "to dock", "dock to fulfillment" then pre-document fulfillment to dispatch', () => {
        cy.visit(`${URL}${admin}`)
        cy.wait(2000)
        
        cy.intercept('POST', `${URL}:7071/api/pub/account/login`).as('get-accessToken')
        cy.intercept('POST', `${URL}${admin_api}/inventory-document/bin-to-dock`).as('get-dockId')
        
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
            WHERE sds.end_date_time = '${time} 9:30:00' AND sds.seller_id_fk = 1;`)
            .then((response) => {
                    body["sellerDeliveryShiftId"] = response[0].id_pk
            })
            cy.task("connectDB", `
                SELECT id_pk, code, product_unit_id_fk 
                FROM Dispatch.product_article
                WHERE product_id_fk = ${product.id}
                AND seller_id_fk = 1;`)
            .then((response) => {
                item.productArticleId = response[0].id_pk
                item.code = response[0].code
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
        let customerID = 15241;
        let sellerCustomerID = 40414;
        // let customerID = 32738;
        // let sellerCustomerID = 60272;

        let tripRequest = new Triprequest(time, customerID)
        let newObject = {};

        tripRequest.getVatCategory().then( result => {

            newObject.TaxPercent = result[0]
            newObject.TollPercent = result[1]
            newObject.Name = result[2]
            cy.task('setData', newObject)

        })

        cy.task('getData').then(myData => {

            tripRequest.getPrice().then(result => { 
                    
                myData.UnitMinPayable = result[0]
                myData.UnitPriceBeforeDiscount = result[1]
                cy.task('setData', myData)
    
            })

        })

        cy.task('getData').then(myData => {

            tripRequest.getSellerDeliveryShift().then(result => {

                myData.sellerDeliveryShiftId = result
                cy.task('setData', myData)

            })

        })

        cy.task('getData').then(myData => {

            myData.UnitTax = myData.UnitPriceBeforeDiscount * (myData.TaxPercent / 100)
            myData.UnitToll = myData.UnitPriceBeforeDiscount * (myData.TollPercent / 100)
            myData.Tax = myData.UnitTax * 20
            myData.Toll = myData.UnitToll * 20
            myData.UnitPayable = myData.UnitPriceBeforeDiscount + myData.UnitTax + myData.UnitToll
            cy.task('setData', myData)

        })


        // tripRequest.cancelExistTripRequest().then(result => {

        //     if (result.length != 0) {
        //         cy.get('@get-accessToken').its('response.body.accessToken').then(res => {
        //             cy.request({method: 'PUT', url:`${URL}${admin_api}/trip-requests/cancel/${result[0].id_pk}`, headers:{Authorization:`Bearer ${res}`}})
        //         })   
        //     }

        // })

        cy.task('getData').then(myJson => {

            cy.fixture("TripRequest").then(data => {
               
                data.sellerDeliveryShiftId = myJson.sellerDeliveryShiftId;
                const items = data.parcelRequest.items;
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    item.vatCategory.taxPercent = myJson.TaxPercent
                    item.vatCategory.tollPercent = myJson.TollPercent;
                    item.vatCategory.name = myJson.Name;
                    item.deliveryRequestItemMetaIn.unitMinPayable = Math.ceil(myJson.UnitMinPayable);
                    item.deliveryRequestItemMetaIn.unitPriceBeforeDiscount = Math.ceil(myJson.UnitPriceBeforeDiscount);
                    item.deliveryRequestItemMetaIn.unitTax = Math.ceil(myJson.UnitTax);
                    item.deliveryRequestItemMetaIn.unitToll = Math.ceil(myJson.UnitToll);
                    item.tax = Math.ceil(myJson.Tax);
                    item.toll = Math.ceil(myJson.Toll);
                    item.deliveryRequestItemMetaIn.unitPayable = Math.ceil(myJson.UnitPayable);
                }
    
                cy.get('@get-accessToken').its('response.body.accessToken').then(res => {
                    cy.request({method: 'POST', url:`${URL}${admin_api}/trip-requests`, headers: {Authorization:`Bearer ${res}`}, body: data}).as('create-triprequest')
                })
            })

        })
        cy.wait(1500)


        // tour *REST*
        cy.fixture("CreateTour").then(data => {
            cy.get('@get-accessToken').its('response.body.accessToken').then(token => {

                data.driverId = 100000007
                data.courierId = 100000007
                
                tripRequest.getVehicle().then(vehicle => {
                    data.vehicleId = vehicle[4].id_pk
                
                    cy.get('@create-triprequest').then(triprequest => {
                    
                        data.tripsIn[0].tripId = triprequest.body.tripId

                        cy.request({method: 'POST', url: `${URL}${admin_api}/tours`, headers: {Authorization: `Bearer ${token}`}, body: data}).as('tour')
                    })
                })
            })
        })
        cy.wait(1500)


        // get token app 
        let driverUser = {"clientType":"ANDROID","firebaseToken":"","panelType":"DRIVER","password":"123456","uniqueId":"3a743fc1f2ac1405","username":"09362348839"}

        cy.request({method: 'POST', url: `${URL}:7071/api/pub/account/login`, body: driverUser}).as('tokenDriver')

        cy.wait(1000)

        // start tour on app
        cy.get('@tour').its('body.id').then(tourId => {
            cy.get('@tokenDriver').its('body').then(res => {
                    cy.request({method: 'PUT', url: `http://192.168.7.10:7071/api/driver/tours/status/${tourId}/start`, headers:{Authorization: `Bearer ${res.accessToken}`}})
                })
        })

        cy.wait(1000)

        // delivery product (it should be partial delivery)
        cy.get('@create-triprequest').then(triprequest => {
            let dp = {"description":"","items":[{"conflictReasonId":"42","deliveredPackageQuantity":"15","deliveredQuantity":"15","id":"7363802","notDeliveredPackageQuantity":"6","notDeliveredQuantity":"6","productArticleId":112},{"conflictReasonId":"42","deliveredPackageQuantity":"16","deliveredQuantity":"16","id":"7363803","notDeliveredPackageQuantity":"5","notDeliveredQuantity":"5","productArticleId":163}],"lat":35.8021317,"lng":51.4955733,"status":"PARTIAL_DELIVERED","transferee":""}
            
            for (let i = 0; i < triprequest.body.parcelRequest.items.length; i++) {

                dp.items[i]["id"] = triprequest.body.parcelRequest.items[i].id
                dp.items[i]["productArticleId"] = triprequest.body.parcelRequest.items[i].productArticleId
            }

            cy.get('@tokenDriver').its('body').then(res => {  
                cy.request({method: 'PUT', url:`http://192.168.7.10:7071/api/driver/delivery-requests/${triprequest.body.parcelRequest.id}`, headers:{Authorization: `Bearer ${res.accessToken}`}, body: dp})
            })
        })
        cy.wait(1000)

        // here i have to call a rest to get new amount
        cy.get('@tokenDriver').its('body').then(res => {
            cy.get('@create-triprequest').then(triprequest => {
                cy.request({method: 'GET', url: `http://192.168.7.10:7071/api/driver/trip-requests/${triprequest.body.id}`, headers:{Authorization: `Bearer ${res.accessToken}`}}).as('newValue')
            })
        })
        cy.wait(1500)


        // payment trip request (it should get amount after partial delivered)
        cy.get('@newValue').then(newValue => {
     
            let ptr = {"amount":"6550402","currencyId":"IRR","paymentConfigId":12,"paymentRequestItemId":1069361,"sellerCustomerId":59870,"sellerId":2}
              
            ptr["amount"] = newValue.body.paymentRequests[0].items[0].amount
            ptr["sellerCustomerId"] = newValue.body.sellerCustomerId
            ptr["paymentRequestItemId"] = newValue.body.paymentRequests[0].items[0].id

            cy.wait(500)

            cy.get('@tokenDriver').its('body').then(res => {  
                cy.request({method: 'POST', url:`http://192.168.7.10:7071/api/driver/financial/payments`, headers:{Authorization: `Bearer ${res.accessToken}`}, body: ptr})
            })
        })
        cy.wait(1000)

        // finish tour
        cy.get('@tour').its('body.id').then(tourId => {
            cy.get('@tokenDriver').its('body').then(res => {  
                cy.request({method: 'PUT', url:`http://192.168.7.10:7071/api/driver/tours/status/${tourId}/finish`, headers:{Authorization: `Bearer ${res.accessToken}`}})
            })
        })
        cy.wait(1000)

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
        cy.wait(1000)

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
            cy.wait(1500)

            cy.get('@get-accessToken').its('response.body.accessToken').then(token => {
                cy.get('@create-fulfillmentDispatch').then(data => {
                    cy.request({method: 'POST', url: `${URL}${admin_api}/inventory-document/fulfillment-to-dispatch/${data.body.id}/confirm`, headers:{Authorization:`Bearer ${token}`}}).as('confirm-fulfillmentDispatch')
                })
            })
        })

        // pre-document Dispatch to Bin
        cy.fixture("DispatchBin").then( data => {
            cy.get('@get-accessToken').its('response.body.accessToken').then(res => {
                cy.get('@shipack').then(shipack => {
                    let date = new DateTime(1)
                    let time = date.liveDate()

                    data.shippingPackageIds[0] = shipack.body.id
                    data.manualDate = `${time}T20:30:00`
                    let idDriver = 100000007
                    data.driverId = idDriver
                    cy.task("connectDB", `
                        SELECT inventory_id_fk FROM Dispatch.driver iid
                        WHERE iid.id_pk = ${idDriver};`).then(vehicle => {
                            data.binInventoryId = vehicle[0].inventory_id_fk
                        })

                    cy.request({method: 'POST', url:`${URL}${admin_api}/inventory-document/dispatch-to-bin`, headers: {Authorization:`Bearer ${res}`}, body: data}).as('create-dispatchBin')
                })
            })
            cy.wait(500)
            cy.get('@get-accessToken').its('response.body.accessToken').then(token => {
                cy.get('@create-dispatchBin').then(data => {
                    cy.request({method: 'POST', url: `${URL}${admin_api}/inventory-document/dispatch-to-bin/${data.body.id}/confirm`, headers:{Authorization:`Bearer ${token}`}}).as('confirm-dispatchBin')
                })
            })
        })


        // test Bin to Dock
        cy.gcclick('div', ' عملیات انبار ')
        cy.wait(200)

        cy.gcclick('div', ' پیش اسناد ')
        cy.wait(200)

        // go to create new document page
        let referencepage = new ReferencePage('/pre-documents', '/bin-to-dock')
        referencepage.goToPage()
        referencepage.createPage()

        date = new SetDateTime('[name="تاریخ مؤثر"]')
        date.setDate()
        cy.wait(1000)


        // should save tour ID for test without request rest
        cy.gclick('[name="تور"]')
        cy.wait(200)
        cy.get('@tour').its('body.id').then(tourId => {
            cy.get('.modal-body').within(() => {
                cy.get('.row > .mb-3').first().within(() => {
                    cy.gtype('.input-group > input', tourId)
                })
                cy.gclick('.btn-primary')
            })
        })

        cy.wait(1000)


        cy.get('[name="انبارک مبدا"]').select('انبارک')
        cy.wait(1000)

        cy.get('[name="انبار مقصد"]').find('.ac-form-control').click()
        cy.gcclick('.badge-secondary',' 164 ')
        cy.wait(500)

        // here i have to add products with add rest of products button or manually
        cy.gcclick('button', ' درج کالاهای بازگشتی تور ')
        cy.wait(5000)


        // save document
        cy.gclick('#footer-submit-button')
        cy.wait(5000)

        let product = [{"name":"الویه  ژامبون 200 گرمی"},{"name":"الویه مرغ  200 گرمی"}]

        // query to check products on database
        cy.get('@tour').its('body.id').then(tourId => {

            let binToDock = new BinToDockDocument(tourId)

            binToDock.getIdInventoryDocumentBinDock().then(res => {

                cy.visit(`${URL}${admin}/documents/bin-to-dock/show/${res[0].id_pk}`)
                cy.wait(3000)


                let documentProducts = new DocumentProducts(res[0].id_pk)
             
                documentProducts.getProductFromDocument().then((response) => {
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
                cy.intercept('POST', `${URL}${admin_api}/inventory-document/bin-to-dock/${res[0].id_pk}/confirm`).as('confirm-dock')
                let confirm = new ConfirmPreDock('@confirm-dock')
                confirm.buttonConfirm()
                confirm.checkResponse()
            })
        })
    })
})