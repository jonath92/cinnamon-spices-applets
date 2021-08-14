import { NoticiationApplet, Notification } from "./Applet";
import { createPopupMenu } from 'cinnamonpopup'
import { createApplet } from "./AppletNew";
import { createNotification } from "./CreateNotification";
import { createNotificationContainer } from "./CreateNotificationContainer";
const { BoxLayout, Label, Table, Button, Bin, Icon, IconType, Align, ScrollView } = imports.gi.St
const { NOTIFICATION } = imports.gi.Atk.Role

const { PolicyType } = imports.gi.Gtk

const { WrapMode } = imports.gi.Pango

interface Arguments {
    orientation: imports.gi.St.Side,
    panelHeight: number,
    instanceId: number
}

export function main(args: Arguments) {

    const {
        orientation,
        panelHeight,
        instanceId
    } = args


    const applet = createApplet({
        orientation,
        instanceId,
        panelHeight
    })

    const popupMenu = createPopupMenu({ launcher: applet.actor })
    const notificationContainer = createNotificationContainer()

    popupMenu.add_actor(notificationContainer.actor)

    applet.on_applet_clicked = () => {

        const notification = createNotification({
            title: 'My Title',
            body: 'Body'
        })

        notificationContainer.box.add_child(notification)

        popupMenu.toggle()

    }

    return applet

}