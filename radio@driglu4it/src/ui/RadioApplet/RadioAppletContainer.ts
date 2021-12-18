
import { createPopupMenu } from "cinnamonpopup"
import { createConfig } from "../../Config"
import { createAppletContainer } from "../../lib/AppletContainer"
import { createMpvHandler } from "../../mpv/MpvHandler"
import { createAppletLabel } from "./AppletLabel"
import { createRadioAppletTooltip } from "./RadioAppletTooltip"
import { createRadioAppletIcon } from "./RadioAppletIcon"
import { createChannelList } from '../ChannelList/ChannelList'
import { VOLUME_DELTA } from "../../consts"

const { ScrollDirection } = imports.gi.Clutter;

interface Props {
    configs: ReturnType<typeof createConfig>,
    mpvHandler: ReturnType<typeof createMpvHandler>
}

export function createRadioAppletContainer(props: Props) {

    const { configs, mpvHandler } = props

    const appletContainer = createAppletContainer({
        icon: createRadioAppletIcon({ configs, mpvHandler }),
        label: createAppletLabel({ configs, mpvHandler }),
        onMiddleClick: () => mpvHandler.togglePlayPause(),
        onMoved: () => mpvHandler.deactivateAllListener(),
        onRemoved: () => { },
        onClick: () => popupMenu.toggle(),
        onRightClick: () => { },
        onScroll: handleScroll
    })

    function handleScroll(scrollDirection: imports.gi.Clutter.ScrollDirection) {
        const volumeChange =
            scrollDirection === ScrollDirection.UP ? VOLUME_DELTA : -VOLUME_DELTA
        mpvHandler.increaseDecreaseVolume(volumeChange)
    }


    createRadioAppletTooltip({mpvHandler, appletContainer})

    const popupMenu = createPopupMenu({ launcher: appletContainer.actor })

    const channelList = createChannelList({
        mpvHandler,
        configs
    })

    popupMenu.add_child(channelList)


    return appletContainer

}