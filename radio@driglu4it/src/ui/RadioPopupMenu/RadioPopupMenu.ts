import { createPopupMenu } from "cinnamonpopup"
import { createSeparatorMenuItem } from "../../lib/PopupSeperator"
import { createMpvHandler } from "../../mpv/MpvHandler"
import { createInfoSection } from "../InfoSection"
import { createChannelList } from "./ChannelList"
import { createMediaControlToolbar } from "./MediaControlToolbar/MediaControlToolbar"

const { BoxLayout } = imports.gi.St

export function createRadioPopupMenu(props: { launcher: imports.gi.St.BoxLayout, mpvHandler: ReturnType<typeof createMpvHandler>}) {
    const {
        launcher,
        mpvHandler
    } = props

    const { getPlaybackStatus } = mpvHandler

    const popupMenu = createPopupMenu({ launcher })

    const channelList = createChannelList({
        mpvHandler
    })

    const radioActiveSection = new BoxLayout({
        vertical: true,
        visible: getPlaybackStatus() !== 'Stopped'
    });

    const mediaControlToolbar = createMediaControlToolbar({
        mpvHandler, 
    }) 

    const infoSection = createInfoSection({
        mpvHandler
    });

    [infoSection, mediaControlToolbar].forEach(widget => {
        radioActiveSection.add_child(createSeparatorMenuItem())
        radioActiveSection.add_child(widget)
    })

    popupMenu.add_child(channelList)
    popupMenu.add_child(radioActiveSection)

    return popupMenu
}