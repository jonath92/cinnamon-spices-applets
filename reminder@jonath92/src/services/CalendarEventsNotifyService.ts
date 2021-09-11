import { selectEvents, watchSelector } from "Store"
import { DateTime } from 'luxon'


interface Reminder {
    eventId: string,
    // only when not yet send 
    timerId?: number,
    remindTime: DateTime,
    hasBeenSend?: boolean
}

export function createNotifyService() {

    const reminders: Reminder[] = []

    watchSelector(selectEvents, (events) => {

        events.forEach(event => {

            const { id: eventId, remindTime: updatedRemindTime } = event

            const savedReminder = reminders.find(savedReminder => savedReminder.eventId === eventId)

            if (!savedReminder) {

                if (updatedRemindTime <= DateTime.now()) {
                    event.sendReminder()

                    reminders.push({
                        eventId,
                        remindTime: updatedRemindTime,
                        hasBeenSend: true
                    })
                }

                // TODO start timer
            }



            // TODO check if reminderTime has changed
        

    })

})


}