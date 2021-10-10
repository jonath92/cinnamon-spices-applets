import { AppletArguments } from "index"
import { getAppletLabel } from "./AppletLabel"
import { getCalendarPopupMenu } from "./popupMenu"

const { Applet } = imports.ui.applet

let appletBox: InstanceType<typeof Applet>

export function getAppletBox(args: AppletArguments): InstanceType<typeof Applet> {

    const {
        instanceId, 
        orientation, 
        panelHeight
    } = args

    if (appletBox){
        return appletBox
    }

    appletBox = new Applet(orientation, panelHeight, instanceId )
    appletBox.actor.add_child(getAppletLabel())

    const popupMenu = getCalendarPopupMenu({ launcher: appletBox.actor })
    appletBox.on_applet_clicked = popupMenu.toggle

    return appletBox
}
