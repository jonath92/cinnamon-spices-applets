import { createPopupMenu } from "cinnamonpopup"
import { createConfig } from "../../Config"
import { createMpvHandler } from "../../mpv/MpvHandler"
import { createInfoSection } from "../InfoSection"
import { createChannelList } from "./ChannelList"

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

    popupMenu.add_child(channelList)

    const infoSection = createInfoSection({
        initialChannelName: mpvHandler.getCurrentChannelName(),
        initialSongTitle: mpvHandler.getCurrentTitle(), 
        mpvHandler
    })

    radioActiveSection.add_child(infoSection.actor)

    popupMenu.add_child(radioActiveSection)

    return popupMenu
}