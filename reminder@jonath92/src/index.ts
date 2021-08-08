import { ReminderApplet } from "./Applet";
import { CalendarEvent, getTodayEvents } from "./Office365Events";
import { createPopupMenu } from 'cinnamonpopup'
const { BoxLayout, Label } = imports.gi.St


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

    reminderApplet.on_applet_clicked = handleAppletClicked

    const popupMenu = createPopupMenu({ launcher: reminderApplet.actor })


    const container = new BoxLayout({
        style_class: 'popup-menu-item'
    })

    popupMenu.add_actor(container)

    function handleAppletClicked() {

        popupMenu.toggle()

    }

    updateMenu()


    async function updateMenu() {
        const todayEvents = await getTodayEvents()

        popupMenu.remove_all_children()

        todayEvents.forEach(event => {
            const menuItem = createSimpleItem(event.subject)
            popupMenu.add_child(menuItem)
        })

    }

    function createSimpleItem(text: string) {
        const popupMenuItem = new BoxLayout({
            style_class: 'popup-menu-item',
        })

        const label = new Label({
            text
        })

        popupMenuItem.add_child(label)

        return popupMenuItem
    }

    return reminderApplet

}