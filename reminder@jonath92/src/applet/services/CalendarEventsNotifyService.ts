import { selectEvents, watchSelector } from "../Store"
import { DateTime } from 'luxon'
import { CalendarEvent } from "../model/CalendarEvent"
import { isEqual } from "lodash"


interface Reminder {
    eventId: string,
    // only when not yet send 
    timerId?: ReturnType<typeof setTimeout>,
    remindTime: DateTime,
}


// TODO: refactoring :-(. Add reminders to cleanup!!
export function createNotifyService() {


    let reminders: Reminder[] = []

    watchSelector(selectEvents, (events) => {

        reminders = updateExistingReminders(reminders, events)

        const newEvents = events.filter(event => {
            const isNew = !reminders.find(reminder => reminder.eventId === event.id)
            return isNew
        })

        newEvents.forEach(event => {
            const newReminder = createNewReminder(event)
            reminders.push(newReminder)
        })
    })


}

/**
 * - Finds all reminders which are not included in the updated Event and destroys them (including timer cleanup)
 * - Update timers when reminderTime has been changed (and sends reminder when remindTime is before currentTime)
 * 
 * @param reminders 
 * @param updatedEvents 
 * @returns updated Reminders
 */
function updateExistingReminders(reminders: Reminder[], updatedEvents: CalendarEvent[]): Reminder[] {

    return reminders.flatMap(reminder => {

        const updatedEvent = updatedEvents.find(event => reminder.eventId === event.id)

        const currentRemindTime = reminder.remindTime
        const updatedRemindTime = updatedEvent?.remindTime

        const reminderHasChanged = !isEqual(currentRemindTime, updatedRemindTime)

        if (reminderHasChanged) {
            reminder.timerId && clearTimeout(reminder.timerId)

            if (!updatedEvent) {
                return []
            }

            return createNewReminder(updatedEvent)
        }

        return reminder
    })
}


/**
 * calls sendNotification for the passed calendarEvent at the reminderTime - or immediately when the ReminderTime is in the past. 
 * 
 * @param event 
 * 
 */
function createNewReminder(event: CalendarEvent): Reminder {

    const remindTime = event.remindTime

    let timerId: ReturnType<typeof setTimeout> | undefined
    
    if (event.remindTime <= DateTime.now()) {
        event.sendNotification()
    } else {
        const timeout = remindTime.diff(DateTime.now()).milliseconds

        timerId = setTimeout(() => {
            event.sendNotification()
        }, timeout)
    }

    return {
        eventId: event.id, 
        remindTime, 
        timerId
    } 

}