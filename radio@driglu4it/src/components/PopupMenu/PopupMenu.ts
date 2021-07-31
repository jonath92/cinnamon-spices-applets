import { createPopupMenu } from "../../lib/ui/PopupMenu"
import { createChannelList } from "./ChannelList"

interface Arguments {
    launcher: imports.gi.St.Widget,
}

export function createRadioPopupMenu(args: Arguments) {

    const {
        launcher
    } = args

    const popupMenu = createPopupMenu({ launcher })

    const channelList = createChannelList()

    popupMenu.add_child(channelList.actor)
    //popupMenu.add_child(radioActiveSection)

    return popupMenu
}