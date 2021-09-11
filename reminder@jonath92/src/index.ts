import { CalendarApplet } from "./Applet";
import { initNotificationFactory } from "./lib/NotificationFactory";
import { initCalendarEventEmitter } from "./services/CalendarEventEmitter";
import { createCalendarPopupMenu } from "./components/popupMenu";
import { createNofifier } from "services/Notifier";
const { Icon, IconType} = imports.gi.St

interface Arguments {
    orientation: imports.gi.St.Side,
    panelHeight: number,
    instanceId: number
}


export function main(args: Arguments) {
    const {
        orientation,
        panelHeight: panel_height,
        instanceId: instance_id
    } = args

    initCalendarEventEmitter()


    const reminderApplet = new CalendarApplet(orientation, panel_height, instance_id)

    const popupMenu = createCalendarPopupMenu({launcher: reminderApplet.actor})
    const emittedReminders: string[] = []

    createNofifier()

    reminderApplet.on_applet_clicked = popupMenu.toggle

    // // TODO: what is with all day events
    // // https://moment.github.io/luxon/#/?id=luxon
    // async function updateMenu() {
    //     const todayEvents = await getTodayEvents()

    //     cardContainer.box.destroy_all_children()

    //     todayEvents.forEach(event => {

    //         const eventStart = DateTime.fromISO(event.start.dateTime + 'Z')
    //         const eventStartFormated = eventStart.toLocaleString(DateTime.TIME_SIMPLE)

    //         const card = createCard({
    //             title: eventStartFormated,
    //             body: event.subject
    //         })

    //         cardContainer.box.add_child(card)

    //         const reminderStartTime = eventStart.minus({
    //             minutes: event.reminderMinutesBeforeStart
    //         })

    //         if (reminderStartTime <= DateTime.now() && !emittedReminders.includes(event.id)) {

    //             // What is this? Why is \n needed instead of <br> ?
    //             const notificationText = `<b>${eventStartFormated}</b>\n\n${event.subject}`

    //             notify({
    //                 notificationText,
    //                 transient: false
    //             })

    //             emittedReminders.push(event.id)
    //         }
    //     })

    // }
    return reminderApplet
    
}