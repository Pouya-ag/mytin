export class DateTime{

    liveDate(){
        const date = new Date();
        let year = date.getFullYear()
        let month = date.getMonth()
        let day = date.getDate()

        return {year : year, month : month, day : day}
    }
}