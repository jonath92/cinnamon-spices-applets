import { createPopupMenu } from "cinnamonpopup";
const { BoxLayout, Label, Icon, IconType } = imports.gi.St
const { spawnCommandLine } = imports.misc.util

let contextMenu: ReturnType<typeof createPopupMenu> | null = null

interface ContextMenuArguments {
    launcher: imports.gi.St.BoxLayout
}

interface ContextMenuItemArguments {
    text: string,
    iconName: string,
    onClick: () => void
}


function createContextMenuItem(args: ContextMenuItemArguments) {

    const { text, iconName, onClick } = args

    const popupMenuItem = new BoxLayout({
        style_class: 'popup-menu-item',
        reactive: true
    })

    const label = new Label({ text })
    const icon = new Icon({
        style_class: 'popup-menu-icon',
        icon_name: iconName,
        icon_type: IconType.SYMBOLIC
    })

    popupMenuItem.add_child(icon)
    popupMenuItem.add_child(label)

    popupMenuItem.connect('button-press-event', onClick)

    return popupMenuItem
}

export function getContextMenu(args: ContextMenuArguments): { toggle: ReturnType<typeof createPopupMenu>["toggle"] } {
    const {
        launcher
    } = args

    if (contextMenu) {
        return { toggle: contextMenu.toggle }
    }

    contextMenu = createPopupMenu({ launcher })

    const aboutItem = createContextMenuItem({
        text: 'About ...',
        iconName: 'dialog-question',
        onClick: () => {
            spawnCommandLine(`xlet-about-dialog applets ${__meta.uuid}`)
        }
    })

    contextMenu.add_child(aboutItem)

    return { toggle: contextMenu.toggle }

}