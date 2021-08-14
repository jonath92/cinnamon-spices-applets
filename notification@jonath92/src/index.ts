import { NoticiationApplet, Notification } from "./Applet";
import { createPopupMenu } from 'cinnamonpopup'
import { createApplet } from "./AppletNew";
import { createNotification } from "./CreateNotification";
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


    const dummyApplet = createApplet({
        orientation,
        instanceId,
        panelHeight
    })

    const popupMenu = createPopupMenu({ launcher: dummyApplet.actor })

    dummyApplet.on_applet_clicked = () => {
        // const notificiaton = new Notification('Title', 'Body')
        // _notificationBin.add_child(notificiaton.actor)

        const notification = createNotification({
            title: 'My Title',
            body: 'Body'
        })

        _notificationBin.add_child(notification)

        popupMenu.toggle()

        global.log(PolicyType.AUTOMATIC)
    }

    popupMenu.add_child(createSimpleItem('Simple Item'))


    const _maincontainer = new BoxLayout({
        vertical: true,
    })

    const scrollView = new ScrollView({
        x_fill: true,
        y_fill: true,
        y_align: Align.START,
        style_class: "vfade",
        hscrollbar_policy: PolicyType.NEVER,
        vscrollbar_policy: PolicyType.AUTOMATIC
    })

    const _notificationBin = new BoxLayout({
        vertical: true
    })

    _maincontainer.add_actor(scrollView)
    scrollView.add_actor(_notificationBin)

    popupMenu.add_actor(_maincontainer)

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

    // const reminderApplet = new NoticiationApplet(orientation, panel_height, instance_id)

    return dummyApplet

}