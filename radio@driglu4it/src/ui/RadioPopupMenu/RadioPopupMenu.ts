import { createPopupMenu } from "cinnamonpopup"
import { createConfig } from "../../Config"
import { createMpvHandler } from "../../mpv/MpvHandler"
import { createChannelList } from "./ChannelList"

export function createRadioPopupMenu(props: { launcher: imports.gi.St.BoxLayout, mpvHandler: ReturnType<typeof createMpvHandler>, configs: ReturnType<typeof createConfig> }) {
    const { launcher, configs, mpvHandler } = props

    const popupMenu = createPopupMenu({ launcher })

    const channelList = createChannelList({
        configs, 
        mpvHandler
    })

    popupMenu.add_child(channelList)

    return popupMenu
}