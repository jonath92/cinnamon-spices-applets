import { ReminderApplet } from "./Applet";
import { CalendarEvent, getTodayEvents } from "./Office365Events";
import { createPopupMenu } from 'cinnamonpopup'
import { createCardContainer } from "./CardContainer";
import { createCard } from "./Card";
import { DateTime } from "luxon";
import { initNotificationFactory as initNotificationFactory, notify } from "./NotificationFactory";
const { BoxLayout, Label, Table, Button, Bin, Icon, IconType, Align } = imports.gi.St
const { NOTIFICATION } = imports.gi.Atk.Role

const { WrapMode } = imports.gi.Pango

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

    const reminderApplet = new ReminderApplet(orientation, panel_height, instance_id)

    const emittedReminders: string[] = []

    initNotificationFactory({
        icon: new Icon({
            icon_type: IconType.SYMBOLIC,
            icon_name: 'view-calendar',
            icon_size: 25
        })
    })

    reminderApplet.on_applet_clicked = handleAppletClicked

    const popupMenu = createPopupMenu({ launcher: reminderApplet.actor })
    const cardContainer = createCardContainer()

    popupMenu.add_actor(cardContainer.actor)

    function handleAppletClicked() {
        popupMenu.toggle()
    }

    updateMenu()
    setInterval(updateMenu, 60000)

    // TODO: what is with all day events

    // https://moment.github.io/luxon/#/?id=luxon
    async function updateMenu() {
        const todayEvents = await getTodayEvents()

        cardContainer.box.destroy_all_children()

        todayEvents.forEach(event => {

            const eventStart = DateTime.fromISO(event.start.dateTime + 'Z')
            const eventStartFormated = eventStart.toLocaleString(DateTime.TIME_SIMPLE)

            const card = createCard({
                title: eventStartFormated,
                body: event.subject
            })

            popupMenu.add_child(card)

            const reminderStartTime = eventStart.minus({
                minutes: event.reminderMinutesBeforeStart
            })

            if (reminderStartTime <= DateTime.now() && !emittedReminders.includes(event.id)) {

                // What is this? Why is \n needed instead of <br> ?
                const notificationText = `<b>${eventStartFormated}</b>\n\n${event.subject}`

                notify({
                    notificationText,
                    transient: false
                })

                emittedReminders.push(event.id)
            }
        })

    }

    return reminderApplet

}