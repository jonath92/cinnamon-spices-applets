import { Office365CalendarEventResponse } from "lib/office365Handler";
import { DateTime } from "luxon";

export class CalendarEvent{
 

    constructor(
        readonly id: string,
        readonly reminderMinutesBeforeStart: number, 
        readonly subject: string, 
        readonly startUTC: DateTime
    ){}


    static newFromOffice365response(office365Response: Office365CalendarEventResponse){

        const {id, reminderMinutesBeforeStart, subject, webLink, start } = office365Response

        const startUTC = DateTime.fromISO(start.dateTime + 'Z')

        return new CalendarEvent(id, reminderMinutesBeforeStart, subject, startUTC)
    }
    
}