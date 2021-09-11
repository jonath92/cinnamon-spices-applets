import { notify } from "lib/NotificationFactory"
import { selectEvents, watchSelector } from "Store"
import { DateTime } from 'luxon'

const { Icon, IconType } = imports.gi.St



export function createNofifier() {

    const reminderTimerMap = new Map<string, number>()

    watchSelector(selectEvents, (events) => {

        events.forEach(event => {

            const {id, startUTC: eventStart, reminderMinutesBeforeStart} = event

            const existingReminderID = reminderTimerMap.get(id)

            if (existingReminderID)
                clearTimeout(existingReminderID)

            const reminderStartTime = eventStart.minus({
                minutes: reminderMinutesBeforeStart
            })





            if (reminderStartTime <= DateTime.now()){

                const eventStartFormated = reminderStartTime.toLocaleString(DateTime.TIME_SIMPLE)
                 // TODO:  What is this? Why is \n needed instead of <br> ?
                 const notificationText = `<b>${eventStartFormated}</b>\n\n${event.subject}`

                 global.log('notifiationText', notificationText)

                 notify({
                     notificationText, 
                     transient: false
                 })
            }



        })
        
    })

}