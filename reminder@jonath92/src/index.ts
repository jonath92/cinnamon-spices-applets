import { ReminderApplet } from "./Applet";
import { createPopupMenu } from 'cinnamonpopup'
import { createCardContainer } from "./CardContainer";
import { createCard } from "./Card";
import { DateTime } from "luxon";
import { initNotificationFactory, notify } from "./NotificationFactory";
import { createOffice365Handler } from "./office365Handler";
import { initCalendarEventEmitter } from "./CalendarEventEmitter";
import { createStore } from "@reduxjs/toolkit";
import { getState, watchSelector } from "./Store";
const { Icon, IconType, Align } = imports.gi.St

const { get_home_dir } = imports.gi.GLib;
const CONFIG_DIR = `${get_home_dir()}/.cinnamon/configs/${__meta.uuid}`;
const { new_for_path } = imports.gi.Gio.File

interface Arguments {
    orientation: imports.gi.St.Side,
    panelHeight: number,
    instanceId: number
}

const selectEvents = () => getState().calendarEvents


export function main(args: Arguments) {
    const {
        orientation,
        panelHeight: panel_height,
        instanceId: instance_id
    } = args

    const reminderApplet = new ReminderApplet(orientation, panel_height, instance_id)
    const emittedReminders: string[] = []

    // make a return value and put this in lib. Then create a NotificationService which sends Notifications for calendar Events
    initNotificationFactory({
        icon: new Icon({
            icon_type: IconType.SYMBOLIC,
            icon_name: 'view-calendar',
            icon_size: 25
        })
    })

    initCalendarEventEmitter()

    watchSelector(selectEvents, (events) => {
        global.log('events updated', JSON.stringify(events))
    })
    
  

    reminderApplet.on_applet_clicked = handleAppletClicked

    const popupMenu = createPopupMenu({ launcher: reminderApplet.actor })
    const cardContainer = createCardContainer()
    popupMenu.add_actor(cardContainer.actor)

    function handleAppletClicked() {
        popupMenu.toggle()
    }


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