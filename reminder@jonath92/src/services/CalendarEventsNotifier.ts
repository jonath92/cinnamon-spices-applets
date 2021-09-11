import { selectEvents, watchSelector } from "Store"
import { DateTime } from 'luxon'


export function createNotifyService() {

    const reminderTimerMap = new Map<string, number>()

    watchSelector(selectEvents, (events) => {

        events.forEach(event => {

            const { id, reminderStartTime } = event

            const existingReminderID = reminderTimerMap.get(id)

            if (existingReminderID)
                clearTimeout(existingReminderID)

            if (reminderStartTime <= DateTime.now()) {
                event.sendReminder()
            }
        })

    })


}