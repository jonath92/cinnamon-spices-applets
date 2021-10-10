import { AppletArguments } from "index"
import { getAppletLabel } from "./AppletLabel"
import { getCalendarPopupMenu } from "./popupMenu"

const { Applet } = imports.ui.applet

let appletBox: InstanceType<typeof Applet> | null = null

let cleanupFunctions: (() => void)[] = []

export function createAppletBox(args: AppletArguments): InstanceType<typeof Applet> {

    if (appletBox) {
        global.logWarning('appletBox already defined')
        return appletBox
    }

    const {
        instanceId,
        orientation,
        panelHeight
    } = args

    appletBox = new Applet(orientation, panelHeight, instanceId)
    appletBox.actor.add_child(getAppletLabel())

    const popupMenu = getCalendarPopupMenu({ launcher: appletBox.actor })
    appletBox.on_applet_clicked = popupMenu.toggle

    appletBox.on_applet_removed_from_panel = () => {
        cleanupFunctions.forEach(cleanupFunc => cleanupFunc())
        cleanupFunctions = []
    }

    cleanupFunctions.push(() => {
        appletBox?.actor.destroy()
        appletBox = null
    })

    return appletBox
}

export function addCleanupFunction(cleanupFunction: () => void): void {
    cleanupFunctions.push(cleanupFunction)
}
