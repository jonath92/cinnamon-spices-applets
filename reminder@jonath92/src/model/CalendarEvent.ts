import { notify } from "lib/NotificationFactory";
import { Office365CalendarEventResponse } from "lib/office365Handler";
import { DateTime } from "luxon";

export class CalendarEvent {

    constructor(
        readonly id: string,
        readonly remindTime: DateTime,
        readonly subject: string,
        readonly startUTC: DateTime
    ) { }

    static newFromOffice365response(office365Response: Office365CalendarEventResponse) {

        const { id, reminderMinutesBeforeStart, subject, webLink, start } = office365Response

        const startUTC = DateTime.fromISO(start.dateTime + 'Z')

        const reminderStartTime = startUTC.minus({
            minutes: reminderMinutesBeforeStart
        })

        return new CalendarEvent(id, reminderStartTime, subject, startUTC)
    }

    get startFormated() {
        return this.startUTC.toLocaleString(DateTime.TIME_SIMPLE)
    }

    public sendNotification() {
        // TODO:  What is this? Why is \n needed instead of <br> ?
        const notificationText = `<b>${this.startFormated}</b>\n\n${this.subject}`

        notify({
            notificationText,
            transient: false
        })
    }

}