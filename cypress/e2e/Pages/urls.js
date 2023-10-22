import {URL, URL_api, admin_api, customer_api} from '../../fixtures/urls.json'

class BaseURlMap{
    constructor(path){
        this.path = path
    }
    admin_base_url(){
        return URL + admin_api + this.path;
    }
    customer_base_url(){
        return URL + customer_api + this.path;
    }
}


export class BaseURL extends BaseURlMap{
    constructor(path, filename){
        super(path)
        this.filename = filename
    }
    adminBaseURL(){
        return this.admin_base_url() + this.filename;
    }
    customerBaseURL(){
        return this.customer_base_url() + this.filename;
    }
}