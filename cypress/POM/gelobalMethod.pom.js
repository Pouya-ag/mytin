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