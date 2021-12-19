import { createPopupMenu } from "cinnamonpopup"
import { createConfig } from "../../Config"
import { createSeparatorMenuItem } from "../../lib/PopupSeperator"
import { createMpvHandler } from "../../mpv/MpvHandler"
import { createInfoSection } from "../InfoSection"
import { createChannelList } from "./ChannelList"
import { createCopyButton } from "./MediaControlToolbar/CopyButton"
import { createMediaControlToolbar } from "./MediaControlToolbar/MediaControlToolbar"
import { createPlayPauseButton } from "./MediaControlToolbar/PlayPauseButton"

const { BoxLayout } = imports.gi.St

export function createRadioPopupMenu(props: { launcher: imports.gi.St.BoxLayout, mpvHandler: ReturnType<typeof createMpvHandler>, configs: ReturnType<typeof createConfig> }) {
    const {
        launcher,
        configs,
        mpvHandler
    } = props

    const { getPlaybackStatus } = mpvHandler

    const popupMenu = createPopupMenu({ launcher })

    const channelList = createChannelList({
        configs,
        mpvHandler
    })

    const radioActiveSection = new BoxLayout({
        vertical: true,
        visible: getPlaybackStatus() !== 'Stopped'
    });

    const mediaControlToolbar = createMediaControlToolbar({
        mpvHandler, 
        configs
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