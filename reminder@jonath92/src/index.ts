import { ReminderApplet } from "./Applet";
import { CalendarEvent, getTodayEvents } from "./Office365Events";
import { createPopupMenu } from 'cinnamonpopup'
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

        // based on messageTraj.js Line 263
        const button = new Button({
            accessible_role: NOTIFICATION
        })

        const table = new Table({
            name: 'notification',
            reactive: true
        })

        button.set_child(table)

        const bannerBox = new BoxLayout({
            vertical: true,
            style: 'spacing: 4px'
        })

        table.add(bannerBox, {
            row: 0,
            col: 1,
            col_span: 2,
            x_expand: false,
            y_expand: false,
            y_fill: false
        })

        const timeLabel = new Label({
            show_on_set_parent: false
        })

        const titleLabel = new Label()

        titleLabel.clutter_text.line_wrap = true
        titleLabel.clutter_text.line_wrap_mode = WrapMode.WORD_CHAR

        bannerBox.add_actor(timeLabel)
        bannerBox.add_actor(titleLabel)

        table.add(new Bin(), {
            row: 0,
            col: 2,
            y_expand: false,
            y_fill: false
        })

        const icon = new Icon({
            icon_name: 'window-close',
            icon_type: IconType.SYMBOLIC,
            icon_size: 16
        })

        const closeButton = new Button({ child: icon, opacity: 128 })

        table.add(closeButton, {
            row: 0,
            col: 3,
            x_expand: false,
            y_expand: false,
            y_fill: false,
            y_align: Align.START
        })


        popupMenu.add_child(button)

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