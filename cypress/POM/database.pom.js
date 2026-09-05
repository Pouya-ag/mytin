export class Triprequest {

    constructor(time, customerID) {
        this.time = time;
        this.customerID = customerID;
    }

    getVatCategory() {
        
        return cy.task("connectDB", `
            SELECT (tax_percent, toll_percent, name) FROM Dispatch.vat_category_record WHERE id_pk = 152;
        `).then(result => {

            const trimmedStr = result[0].row.replace(/[()]/g, '');
            let array = trimmedStr.split(',').map(item => item.trim());
            array = array.map(item => isNaN(item) ? item : Number(item));
            return array
        })
    }

    getPrice() {
        
        return cy.task("connectDB", `
            SELECT (min_payable, price_before_discount) FROM Dispatch.product_price_record WHERE id_pk = 51162;
            `).then(result => {

                const trimmedStr = result[0].row.replace(/[()]/g, '');
                let array = trimmedStr.split(',').map(item => item.trim());
                array = array.map(item => isNaN(item) ? item : Number(item));
                return array
            })
    }

    getSellerDeliveryShift() {

        return cy.task("connectDB", `
            SELECT sds.id_pk FROM Dispatch.seller_delivery_shift sds
            WHERE sds.delivery_date = '${this.time} 20:30:00' AND sds.seller_id_fk = 2;
        `).then(result => {

            return result[0].id_pk
            
        })

    }

    cancelExistTripRequest() {

        return cy.task("connectDB", `
            SELECT tr.id_pk FROM Dispatch.trip_request tr
            JOIN Dispatch.seller_delivery_shift sds
            ON tr.seller_delivery_shift_id_fk = sds.id_pk
            WHERE tr.customer_id_fk = ${this.customerID}
            AND sds.delivery_date = '${this.time} 20:30:00'
            AND tr.canceled IS NULL;    
        `).then(result => {

            return result

        })
    }

    getVehicle() {

        return cy.task("connectDB", `
            SELECT id_pk FROM Dispatch.vehicle vehicle
            WHERE vehicle.active = true
            AND vehicle.vehicle_type_id_fk = 2
            limit 5;`).then(result => {
                
                return result

            })
    }
}


export class BinToDockDocument {

    constructor(tourId) {
        this.tourId = tourId;
    }

    getIdInventoryDocumentBinDock() {

        return cy.task("connectDB", `
            SELECT id_pk FROM Dispatch.inventory_document indo
            WHERE indo.tour_id_fk = ${this.tourId}
            AND indo.deleted IS NULL
            AND indo.document_type = 'BIN_TO_DOCK';`).then(result => {
                
                return result

            })
    }
}


export class DocumentProducts {

    constructor(documentId) {
        this.documentId = documentId;
    }

    getProductFromDocument() {

        return cy.task("connectDB", `
            SELECT name FROM Dispatch.product pro
            JOIN Dispatch.product_article pa
            ON pa.product_id_fk = pro.id_pk
            JOIN Dispatch.inventory_document_item idi
            ON idi.product_article_id_fk = pa.id_pk
            WHERE idi.inventory_document_id_fk = ${this.documentId};`).then(result => {

                return result

            })
    }
}