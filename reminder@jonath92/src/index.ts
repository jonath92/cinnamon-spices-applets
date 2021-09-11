import { CalendarApplet } from "./Applet";
import { initNotificationFactory } from "./lib/NotificationFactory";
import { initCalendarEventEmitter } from "./services/CalendarEventPollingService";
import { createCalendarPopupMenu } from "./components/popupMenu";
import { createNotifyService } from "services/CalendarEventsNotifyService";
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

    const icon = new Icon({
        icon_type: IconType.SYMBOLIC,
        icon_name: 'view-calendar',
        icon_size: 25
    })

    initNotificationFactory({
        icon
    })


    createNotifyService()

    reminderApplet.on_applet_clicked = popupMenu.toggle

    return reminderApplet
    
}