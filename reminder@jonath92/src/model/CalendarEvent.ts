import { Office365CalendarEventResponse } from "lib/office365Handler";

export class CalendarEvent{
 

    constructor(
        readonly id: string
    ){}


    static newFromOffice365response(office365Response: Office365CalendarEventResponse){

        const {id, reminderMinutesBeforeStart, subject, webLink,start } = office365Response

        new CalendarEvent(id)
    }
    
}