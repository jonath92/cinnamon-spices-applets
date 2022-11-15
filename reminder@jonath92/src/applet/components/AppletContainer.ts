import { AppletArguments } from "../index"
import { getAppletLabel } from "./AppletLabel"
import { getContextMenu } from "./ContextMenu"
import { getCalendarPopupMenu } from "./PopupMenu"

const { Applet } = imports.ui.applet
const { uiGroup } = imports.ui.main
const { EventType } = imports.gi.Clutter

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
    const contextMenu = getContextMenu({ launcher: appletBox.actor, instanceId })

    // @ts-ignore
    appletBox.on_applet_clicked = popupMenu.toggle

    appletBox.actor.connect('event', (actor, event) => {
        if (event.type() === EventType.BUTTON_PRESS && event.get_button() === 3) {
            contextMenu.toggle()
            return true
        }

        return false
    })


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
